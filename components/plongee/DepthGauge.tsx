"use client";

import { useEffect, useRef } from "react";
import {
  MAX_DEPTH,
  cameraY,
  createFollower,
  depthMeters,
  lightPercent,
  pressureBar,
  temperatureC,
  zoneName,
} from "./dive";
import type { SonarEcho } from "./Sonar";

/*
 * La console de plongée, fixée à gauche :
 * - la profondeur en grand ;
 * - une règle graduée qui défile devant un repère fixe ;
 * - pression, température, lumière restante et zone océanique ;
 * - le dernier écho du sonar (clic dans l'eau).
 *
 * Tout est mis à jour à chaque image en écrivant directement dans le DOM
 * (via des refs), sans repasser par React : pas de re-rendu 60 fois par seconde.
 */

const PX_PER_M = 1.6; // échelle de la règle

const fr = (x: number, digits = 1) => x.toFixed(digits).replace(".", ",");

const formatLight = (pct: number) =>
  pct >= 10 ? `${Math.round(pct)} %` : pct >= 0.01 ? `${fr(pct, 2)} %` : "≈ 0 %";

function Tape() {
  const ticks = [];
  for (let m = 0; m <= MAX_DEPTH; m += 10) {
    const y = m * PX_PER_M;
    const major = m % 50 === 0;
    ticks.push(
      <line key={m} x1={major ? 0 : 8} x2={18} y1={y} y2={y} strokeWidth={major ? 1.4 : 1} />,
    );
    if (m % 100 === 0) {
      ticks.push(
        <text key={`t${m}`} x={24} y={y + 4} fontSize={12} stroke="none" fill="currentColor">
          {m}
        </text>,
      );
    }
  }
  const h = MAX_DEPTH * PX_PER_M;
  return (
    <svg
      width={64}
      height={h + 40}
      viewBox={`0 -20 64 ${h + 40}`}
      className="block overflow-visible"
      stroke="currentColor"
    >
      {/* Au-dessus de 0 : la surface */}
      <path d="M0 -10 q4 -4 8 0 t8 0 t8 0" fill="none" strokeWidth={1.2} />
      {ticks}
    </svg>
  );
}

export default function DepthGauge() {
  const rootRef = useRef<HTMLElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const pressureRef = useRef<HTMLElement>(null);
  const tempRef = useRef<HTMLElement>(null);
  const lightRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLElement>(null);
  const echoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const follow = createFollower();
    const last: Record<string, string> = {};
    // N'écrit dans le DOM que si le texte a changé.
    const set = (key: string, el: Element | null, text: string) => {
      if (el && last[key] !== text) {
        el.textContent = text;
        last[key] = text;
      }
    };

    // Dernier écho du sonar, envoyé par <Sonar /> sous forme d'événement.
    const onEcho = (e: Event) => {
      const { rtt } = (e as CustomEvent<SonarEcho>).detail;
      set("echo", echoRef.current, `${fr(rtt, 2)} s`);
      echoRef.current?.classList.remove("opacity-70");
    };
    window.addEventListener("sonar", onEcho);

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const { p, maxP } = follow(Math.min((now - prev) / 1000, 0.1));
      prev = now;
      const under = cameraY(p) < 0;
      const d = depthMeters(p, maxP);

      if (rootRef.current) rootRef.current.dataset.under = String(under);
      // Aussi sur <html> : l'en-tête (et tout le CSS) peut réagir avec `under:`.
      document.documentElement.dataset.under = String(under);
      set("depth", depthRef.current, under ? `−${Math.max(1, Math.round(d))} m` : "surface");
      set("pressure", pressureRef.current, `${fr(pressureBar(d))} bar`);
      set("temp", tempRef.current, `${fr(temperatureC(d))} °C`);
      set("light", lightRef.current, formatLight(lightPercent(d)));
      set("zone", zoneRef.current, zoneName(under ? Math.max(d, 1) : 0));
      if (tapeRef.current) tapeRef.current.style.transform = `translateY(${-d * PX_PER_M}px)`;


      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("sonar", onEcho);
    };
  }, []);

  const row = "flex justify-between gap-3 whitespace-nowrap";
  // Étiquettes : même couleur que les valeurs, juste un peu effacées.
  const label = "opacity-70";
  // Petits panneaux lisibles, clairs au-dessus de l'eau et sombres dessous.
  const panel = "panel-paper group-data-[under=true]:panel-sea";

  return (
    <aside
      ref={rootRef}
      aria-hidden="true"
      data-under="false"
      className="group pointer-events-none fixed bottom-4 left-4 z-10 flex flex-col gap-5 font-mono text-xs text-ink transition-colors data-[under=true]:text-foam md:top-24 md:bottom-6 md:left-6 md:w-[184px]"
    >
      {/* Profondeur */}
      <div className={`${panel} flex flex-col gap-1 px-3 py-2.5`}>
        <span className={label}>prof.</span>
        <span ref={depthRef} className="text-lg leading-none font-medium">
          surface
        </span>
      </div>

      {/* Règle qui défile : le repère reste au milieu, les graduations montent */}
      <div className="relative hidden min-h-0 flex-1 overflow-hidden md:block [mask-image:linear-gradient(transparent,black_25%,black_75%,transparent)]">
        <div ref={tapeRef} className="absolute top-1/2 left-3 will-change-transform">
          <Tape />
        </div>
        <div className="absolute top-1/2 left-0 flex w-full -translate-y-1/2 items-center">
          <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current" />
          <span className="ml-auto h-px w-6 bg-current opacity-60" />
        </div>
      </div>

      {/* Mesures */}
      <dl className={`${panel} m-0 hidden flex-col gap-1.5 px-3 py-2.5 md:flex`}>
        <div className={row}>
          <dt className={label}>pression</dt>
          <dd ref={pressureRef} className="m-0">1,0 bar</dd>
        </div>
        <div className={row}>
          <dt className={label}>temp.</dt>
          <dd ref={tempRef} className="m-0">17,0 °C</dd>
        </div>
        <div className={row}>
          <dt className={label}>lumière</dt>
          <dd ref={lightRef} className="m-0">100 %</dd>
        </div>
        <div className={row}>
          <dt className={label}>zone</dt>
          <dd ref={zoneRef} className="m-0">surface</dd>
        </div>
        <div className={row}>
          <dt className={label}>écho</dt>
          <dd ref={echoRef} className="m-0 opacity-70">clic ↯</dd>
        </div>
      </dl>
    </aside>
  );
}
