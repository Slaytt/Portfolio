/*
 * Le « modèle » de la plongée, partagé par la scène 3D et la jauge :
 * le défilement de la page → la position de la caméra et la profondeur.
 *
 * Les réglages sont en pixels pour un écran de 900 px de haut : on ramène
 * le scroll à cette échelle pour que l'effet soit le même sur tous les écrans.
 */

export const REF_HEIGHT = 900;
/** Défilement (en px de référence) auquel la caméra franchit la surface. */
export const SURFACE_P = 930;
/** Profondeur atteinte tout en bas de la page, en mètres. */
export const MAX_DEPTH = 1100;
/** Profondeur du fond marin, pour le sonar (un peu sous le bas de la page). */
export const SEAFLOOR = 1200;
/** Vitesse du son dans l'eau de mer, en m/s. */
export const SOUND_SPEED_WATER = 1500;

const CAM_START = 2.6; // hauteur de la caméra au-dessus de l'eau
const CAM_FLOOR = -6; // la caméra ne descend pas plus bas : le reste, c'est le brouillard

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Lit le défilement actuel, à l'échelle de référence. */
export function readScroll() {
  const k = REF_HEIGHT / window.innerHeight;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return { target: window.scrollY * k, maxP: Math.max(SURFACE_P + 1, max * k) };
}

/**
 * Suit le défilement avec un léger retard (la caméra « rattrape » le scroll).
 * Indépendant du nombre d'images par seconde.
 */
export function createFollower() {
  let p = readScroll().target;
  return (dt: number) => {
    const { target, maxP } = readScroll();
    p += (target - p) * (1 - Math.exp(-dt * 6));
    return { p, maxP };
  };
}

/** Hauteur de la caméra dans la scène (0 = surface de l'eau). */
export function cameraY(p: number) {
  if (p < SURFACE_P) {
    // On accélère en approchant de l'eau...
    const t = clamp01((p - 80) / (SURFACE_P - 80));
    return CAM_START * (1 - t * t);
  }
  // ...puis on ralentit doucement sous la surface (même vitesse au raccord).
  const v = (2 * CAM_START) / (SURFACE_P - 80);
  return CAM_FLOOR * (1 - Math.exp((-(p - SURFACE_P) * v) / -CAM_FLOOR));
}

/** Profondeur affichée, en mètres : ~250 m aux passions, 1100 m au contact. */
export function depthMeters(p: number, maxP: number) {
  if (p <= SURFACE_P) return 0;
  const f = clamp01((p - SURFACE_P) / (maxP - SURFACE_P));
  return MAX_DEPTH * (0.15 * f + 0.85 * f ** 2.6);
}

// --- Les mesures de la jauge (ordres de grandeur réalistes) ---

/** Pression absolue en bar : 1 atm + 1 bar tous les ~10 m. */
export const pressureBar = (d: number) => 1.013 + d / 10.06;

/** Température : eau froide du courant de Humboldt, thermocline vers 100 m. */
export const temperatureC = (d: number) => 4 + 13 / (1 + Math.exp((d - 110) / 45));

/** Lumière restante, en % de la surface (eau claire du large). */
export const lightPercent = (d: number) => 100 * Math.exp(-d / 45);

export function zoneName(d: number) {
  if (d <= 0) return "surface";
  if (d < 200) return "épipélagique";
  if (d < 1000) return "mésopélagique";
  return "bathypélagique";
}
