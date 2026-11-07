"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, type RefObject } from "react";
import * as THREE from "three";
import {
  cameraY,
  createFollower,
  depthMeters,
  mix,
  smoothstep,
} from "./dive";
import { readRetroPalette, retroMode } from "./retro";

/*
 * La mer en 3D (React Three Fiber).
 *
 * - Une grande surface d'eau, déformée par des vagues de Gerstner (les
 *   crêtes se resserrent, comme de vraies vagues) et colorée dans un shader :
 *   reflet du ciel « papier » vu d'au-dessus, fenêtre de Snell vue d'en dessous.
 * - Sous l'eau : rayons de lumière, neige marine, brouillard de plus en
 *   plus sombre avec la profondeur.
 *
 * Les couleurs sont passées en sRGB telles quelles (Canvas `linear flat`) pour
 * correspondre exactement aux couleurs CSS du site. Le fond n'est pas dessiné
 * par WebGL : c'est la couleur CSS du conteneur, mise à jour à chaque image.
 */

// Couleurs (sRGB, 0..1). Mêmes valeurs que globals.css.
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const PAPER = rgb("#fbfcfc");
const WATER_FAR = rgb("#9fb6ba"); // eau vue de loin, au-dessus
const WATER_NEAR = rgb("#557b86"); // eau sous la caméra, au-dessus
const SEA_TOP = rgb("#12394a"); // eau sous la surface
const SEA_DEEP = rgb("#020b10"); // abysses
const BIO = rgb("#c8f7ff"); // lumière vue d'en dessous

const tmp = new THREE.Vector3();
const toCss = (v: THREE.Vector3) =>
  `rgb(${Math.round(v.x * 255)},${Math.round(v.y * 255)},${Math.round(v.z * 255)})`;

// ---------------------------------------------------------------------------
// Shaders de la surface
// ---------------------------------------------------------------------------

const waterVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;

  // Une vague de Gerstner : w = (direction x, direction z, raideur, longueur d'onde)
  vec3 gerstner(vec4 w, vec3 p, inout vec3 tangent, inout vec3 binormal) {
    float k = 6.28318 / w.w;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(w.xy);
    float f = k * (dot(d, p.xz) - c * uTime);
    float a = w.z / k;
    tangent += vec3(-d.x * d.x * w.z * sin(f), d.x * w.z * cos(f), -d.x * d.y * w.z * sin(f));
    binormal += vec3(-d.x * d.y * w.z * sin(f), d.y * w.z * cos(f), -d.y * d.y * w.z * sin(f));
    return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
  }

  void main() {
    vec3 p = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 offset = vec3(0.0);
    offset += gerstner(vec4(1.0, 0.3, 0.16, 16.0), p, tangent, binormal);
    offset += gerstner(vec4(0.6, 1.0, 0.13, 9.0), p, tangent, binormal);
    offset += gerstner(vec4(-0.4, 0.8, 0.10, 5.0), p, tangent, binormal);
    offset += gerstner(vec4(0.9, -0.5, 0.07, 2.7), p, tangent, binormal);
    p += offset;
    vNormal = normalize(cross(binormal, tangent));
    vPos = (modelMatrix * vec4(p, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
  }
`;

const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCam;
  uniform vec3 uPaper;
  uniform vec3 uFar;
  uniform vec3 uNear;
  uniform vec3 uFog;
  uniform vec2 uFogRange;
  uniform vec3 uBio;
  uniform float uLight;
  varying vec3 vPos;
  varying vec3 vNormal;

  void main() {
    // Petites rides pour faire scintiller la surface.
    vec2 q = vPos.xz;
    vec3 ripple = vec3(
      sin(q.x * 3.1 + uTime * 1.7) + sin(q.y * 2.3 - uTime * 1.3 + q.x),
      0.0,
      sin(q.y * 3.7 + uTime * 1.9) + sin(q.x * 2.9 + uTime * 1.1 - q.y)
    ) * 0.035;
    vec3 n = normalize(vNormal + ripple);
    vec3 v = normalize(uCam - vPos);
    float dist = length(uCam - vPos);
    vec3 col;

    float fog = smoothstep(uFogRange.x, uFogRange.y, dist);

    if (gl_FrontFacing) {
      // Vue d'au-dessus : l'eau reflète le ciel (le papier) en lumière rasante.
      float cosV = max(dot(n, v), 0.0);
      float fresnel = 0.02 + 0.98 * pow(1.0 - cosV, 5.0);
      vec3 body = mix(uNear, uFar, smoothstep(2.0, 40.0, dist));
      col = mix(body, uPaper, fresnel);
      // Reflet du soleil
      vec3 sun = normalize(vec3(-0.3, 0.6, -1.0));
      col += vec3(1.0) * pow(max(dot(reflect(-v, n), sun), 0.0), 180.0) * 0.6;
      col = mix(col, uFog, fog);
    } else {
      // Vue d'en dessous : le ciel n'est visible que dans un cône (fenêtre de
      // Snell, ~48°). Au-delà, la surface agit comme un miroir de l'eau sombre.
      n = -n;
      float cosV = max(dot(n, v), 0.0);
      float window = smoothstep(0.64, 0.7, cosV);
      // Motif de caustiques : des rides fines qui se croisent.
      vec2 c = q * 2.6;
      float caustic = abs(sin(c.x + sin(c.y * 1.3 + uTime * 1.2) * 1.4))
                    * abs(sin(c.y * 1.1 + sin(c.x * 0.9 - uTime) * 1.4));
      caustic = pow(1.0 - caustic, 6.0);
      vec3 inside = mix(uFog * 1.6, uBio, 0.55 + 0.45 * caustic);
      vec3 outside = mix(uFog * 1.3, uFog, fog);
      // La lumière traverse le brouillard moins vite que le reste.
      col = mix(outside, inside, window * uLight * (1.0 - fog * 0.6));
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Rayons de lumière et neige marine (sous l'eau)
// ---------------------------------------------------------------------------

const rayVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const rayFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uTime;
  uniform float uSeed;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float across = sin(vUv.x * 3.14159);            // bords doux
    float along = smoothstep(0.0, 1.0, vUv.y);       // s'éteint en profondeur
    float flicker = 0.7 + 0.3 * sin(uTime * 0.8 + uSeed * 7.0);
    gl_FragColor = vec4(uColor, across * across * along * flicker * uOpacity);
  }
`;

const snowVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  attribute float aSpeed;
  attribute float aSize;
  varying float vFade;
  void main() {
    vec3 p = position;
    p.y = -0.3 - mod(-p.y + uTime * aSpeed, 24.0);   // chute lente, en boucle
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vFade = 1.0 - smoothstep(4.0, 22.0, -mv.z);
    gl_PointSize = aSize * uPixel / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const snowFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(uColor, a * vFade * uOpacity);
  }
`;

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Rendu rétro « 16 bits » (par défaut) : la scène est rendue en basse
// résolution dans une texture, puis ramenée à une rampe de quelques tons
// (dégradé entre les 4 couleurs de la palette, lues dans le CSS), avec un
// tramage ordonné (Bayer) entre tons voisins : rétro, mais doux pour les yeux.
// ---------------------------------------------------------------------------

// La résolution dépend de la profondeur : fine en surface, pour qu'on
// reconnaisse bien l'eau, plus grossière en dessous, où le « sonar » prend le relais.
const SURFACE = { pixel: 3, levels: 20 }; // taille d'un pixel (px CSS), nombre de tons
const DEPTH = { pixel: 3, levels: 16 };

const pixelVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // plein écran, sans caméra
  }
`;

const pixelFragment = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec2 uRes;
  uniform vec3 uP0, uP1, uP2, uP3; // la palette, du plus sombre au plus clair
  uniform float uUnder; // 0 au-dessus de l'eau, 1 dessous
  uniform float uLevels; // nombre de tons de la rampe
  varying vec2 vUv;


  // Matrice de Bayer 4×4 calculée (seuil différent pour chaque pixel d'un carré 4×4).
  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

  // La rampe : t = 0 → couleur la plus sombre, t = 1 → la plus claire.
  vec3 ramp(float t) {
    t = clamp(t, 0.0, 1.0) * 3.0;
    if (t < 1.0) return mix(uP0, uP1, t);
    if (t < 2.0) return mix(uP1, uP2, t - 1.0);
    return mix(uP2, uP3, t - 2.0);
  }

  void main() {
    vec3 col = texture2D(tScene, vUv).rgb;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    // Lisibilité : au-dessus de l'eau on reste dans la moitié claire de la
    // rampe (le texte y est sombre), dessous dans la partie sombre (le texte
    // y est clair). Au-dessus, on étire le contraste pour bien voir les vagues,
    // sans monter jusqu'au ton le plus clair (le ciel serait éblouissant) :
    // le maximum, 0.92, correspond à la couleur --paper du CSS.
    float above = 0.5 + 0.42 * clamp((lum - 0.35) / 0.65, 0.0, 1.0);
    float below = lum * 0.6;
    float t = mix(above, below, uUnder);
    // Quantification en uLevels tons ; le tramage hésite entre deux tons voisins.
    vec2 px = floor(vUv * uRes);
    float q = floor(t * (uLevels - 1.0) + bayer4(px)) / (uLevels - 1.0);
    gl_FragColor = vec4(ramp(q), 1.0);
  }
`;

type BackdropRef = RefObject<HTMLDivElement | null>;

/*
 * Toute la scène three.js, construite une fois, en dehors de React :
 * React ne fait que l'afficher (<primitive>) et appeler update() à chaque image.
 */
function createOcean() {
  const group = new THREE.Group();
  const follow = createFollower();
  const fog = new THREE.Vector3();
  let time = 0;
  let lastBg = "";

  // La surface : un grand plan finement découpé, déformé dans le shader.
  const waterGeometry = new THREE.PlaneGeometry(240, 240, 320, 320);
  waterGeometry.rotateX(-Math.PI / 2); // à plat, normale vers le haut
  const water = new THREE.ShaderMaterial({
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uPaper: { value: PAPER },
      uFar: { value: WATER_FAR },
      uNear: { value: WATER_NEAR },
      uFog: { value: fog },
      uFogRange: { value: new THREE.Vector2(20, 120) },
      uBio: { value: BIO },
      uLight: { value: 1 },
    },
  });
  const waterMesh = new THREE.Mesh(waterGeometry, water);
  waterMesh.position.z = -60;
  group.add(waterMesh);

  // Les rayons : des plans étroits, en transparence additive, qui partent de la surface.
  const rays = Array.from({ length: 6 }, (_, i) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: rayVertex,
      fragmentShader: rayFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: i },
        uColor: { value: BIO },
      },
    });
    // uv.y = 1 en haut (près de la surface), 0 en bas
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + (i % 3) * 0.7, 18), material);
    mesh.position.set(-9 + i * 3.6 + Math.sin(i * 12.9) * 1.2, -9, -6 - ((i * 7) % 5) * 3);
    mesh.rotation.z = 0.25 + Math.sin(i * 3.1) * 0.08;
    group.add(mesh);
    return material;
  });

  // La neige marine : des points qui tombent lentement (animés dans le shader).
  const count = 1600;
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const size = new Float32Array(count);
  // Générateur pseudo-aléatoire fixe : la neige est la même à chaque visite.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    pos[i * 3] = -16 + rnd() * 32;
    pos[i * 3 + 1] = -rnd() * 24;
    pos[i * 3 + 2] = -28 + rnd() * 34;
    speed[i] = 0.05 + rnd() * 0.15;
    size[i] = 0.6 + rnd() * 1.6;
  }
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  snowGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
  snowGeometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const snow = new THREE.ShaderMaterial({
    vertexShader: snowVertex,
    fragmentShader: snowFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixel: { value: 60 },
      uOpacity: { value: 0 },
      uColor: { value: BIO },
    },
  });
  group.add(new THREE.Points(snowGeometry, snow));

  // La passe « pixel » : une texture basse résolution + un triangle plein écran.
  const lowRes = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });
  const pixelMaterial = new THREE.ShaderMaterial({
    vertexShader: pixelVertex,
    fragmentShader: pixelFragment,
    depthTest: false,
    uniforms: {
      tScene: { value: lowRes.texture },
      uRes: { value: new THREE.Vector2() },
      uP0: { value: new THREE.Vector3() },
      uP1: { value: new THREE.Vector3() },
      uP2: { value: new THREE.Vector3() },
      uP3: { value: new THREE.Vector3() },
      uUnder: { value: 0 },
      uLevels: { value: SURFACE.levels },
    },
  });
  // À chaque passage en rétro, on relit la palette dans le CSS.
  const loadPalette = () => {
    if (!retroMode.get()) return;
    readRetroPalette().forEach((c, i) => pixelMaterial.uniforms[`uP${i}`].value.set(...c));
  };
  loadPalette();
  const unsubscribe = retroMode.subscribe(loadPalette);
  const pixelScene = new THREE.Scene();
  pixelScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pixelMaterial));
  const pixelCamera = new THREE.Camera();
  const clearColor = new THREE.Color();

  /** Dessine l'image : en rétro (pixels + tramage) ou en HD. */
  function render(
    gl: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    width: number,
    height: number,
  ) {
    if (!retroMode.get()) {
      gl.setClearColor(0x000000, 0); // fond transparent : la couleur CSS du conteneur
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }
    // Fin en surface, plus grossier sous l'eau (bascule au passage de la surface).
    const res = pixelMaterial.uniforms.uUnder.value < 0.5 ? SURFACE : DEPTH;
    pixelMaterial.uniforms.uLevels.value = res.levels;
    const w = Math.ceil(width / res.pixel);
    const h = Math.ceil(height / res.pixel);
    if (lowRes.width !== w || lowRes.height !== h) lowRes.setSize(w, h);
    // Dans la texture, le fond doit être peint : on le remplit avec la couleur du brouillard.
    clearColor.setRGB(fog.x, fog.y, fog.z, THREE.LinearSRGBColorSpace);
    gl.setClearColor(clearColor, 1);
    snow.uniforms.uPixel.value = h * 0.06; // taille des particules à cette résolution
    gl.setRenderTarget(lowRes);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    pixelMaterial.uniforms.uRes.value.set(w, h);
    gl.render(pixelScene, pixelCamera);
  }

  function update(
    camera: THREE.Camera,
    viewportHeight: number,
    dt: number,
    reduceMotion: boolean,
    backdrop: HTMLDivElement | null,
  ) {
    const step = Math.min(dt, 0.1);
    time += reduceMotion ? step * 0.1 : step;
    const { p, maxP } = follow(step);

    // Caméra
    const y = cameraY(p);
    const under = smoothstep(0.15, -0.35, y); // 0 au-dessus, 1 dessous
    pixelMaterial.uniforms.uUnder.value = under;
    const depth = depthMeters(p, maxP);
    const dark = smoothstep(0, 900, depth); // assombrissement visuel
    const light = Math.exp(-depth / 260); // lumière visuelle (plus douce que la vraie)
    camera.position.set(0, y, 8);
    // Au-dessus : on regarde un peu vers le bas. Dessous : vers la surface.
    camera.rotation.set(mix(-0.16, mix(0.5, 0.18, dark), smoothstep(0.6, -1.2, y)), 0, 0);

    // Couleur du fond (= brouillard), appliquée au conteneur en CSS.
    tmp.copy(SEA_TOP).lerp(SEA_DEEP, dark);
    fog.copy(PAPER).lerp(tmp, under);
    const bg = toCss(fog);
    if (bg !== lastBg && backdrop) {
      backdrop.style.backgroundColor = bg;
      lastBg = bg;
    }

    // Surface
    const u = water.uniforms;
    u.uTime.value = time * 0.55;
    u.uCam.value.copy(camera.position);
    u.uFogRange.value.set(mix(18, 4, under), mix(120, mix(45, 14, dark), under));
    u.uLight.value = light;

    // Rayons et neige
    for (const ray of rays) {
      ray.uniforms.uTime.value = time;
      ray.uniforms.uOpacity.value = 0.24 * under * light;
    }
    snow.uniforms.uTime.value = time;
    snow.uniforms.uOpacity.value = under * mix(0.55, 0.9, dark);
    snow.uniforms.uPixel.value = viewportHeight * 0.06;
  }

  // Libère la mémoire GPU quand on quitte la page.
  function dispose() {
    lowRes.dispose();
    pixelMaterial.dispose();
    unsubscribe();
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
  }

  return { group, update, render, dispose };
}

function Ocean({ backdrop, reduceMotion }: { backdrop: BackdropRef; reduceMotion: boolean }) {
  const [ocean] = useState(createOcean);
  useEffect(() => ocean.dispose, [ocean]);
  useFrame(({ camera, size }, dt) =>
    ocean.update(camera, size.height, dt, reduceMotion, backdrop.current),
  );
  // Priorité 1 : React Three Fiber ne dessine plus tout seul, c'est nous qui
  // appelons le rendu (pour pouvoir intercaler la passe rétro).
  useFrame(({ gl, scene, camera, size }) => ocean.render(gl, scene, camera, size.width, size.height), 1);
  return <primitive object={ocean.group} />;
}

export default function OceanScene({ backdrop }: { backdrop: BackdropRef }) {
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return (
    <Canvas
      linear
      flat
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: 50, near: 0.05, far: 300, position: [0, 2.6, 8] }}
    >
      <Ocean backdrop={backdrop} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
