"use client";

import { useEffect, useState } from "react";
import { SEAFLOOR, SOUND_SPEED_WATER, depthMeters, readScroll } from "./dive";

/*
 * Le sonar : un clic dans l'eau envoie un « ping ». L'onde part du point
 * cliqué, descend jusqu'au fond et revient. Le temps d'aller-retour est
 * vraiment calculé : 2 × distance au fond ÷ 1500 m/s (vitesse du son dans
 * l'eau). Plus on est profond, plus l'écho revient vite.
 */

export type SonarEcho = { rtt: number; distance: number };

type Wave = { id: number; x: number; y: number; kind: "out" | "echo"; label?: string };

const fr = (x: number, digits: number) => x.toFixed(digits).replace(".", ",");

// Les clics sur ces éléments gardent leur rôle normal : pas de ping.
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [data-no-sonar]";

export default function Sonar() {
  const [waves, setWaves] = useState<Wave[]>([]);

  useEffect(() => {
    let nextId = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as Element).closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return; // l'utilisateur sélectionne du texte

      const { target, maxP } = readScroll();
      const distance = SEAFLOOR - depthMeters(target, maxP);
      const rtt = (2 * distance) / SOUND_SPEED_WATER;
      const { clientX: x, clientY: y } = e;

      setWaves((w) => [...w, { id: nextId++, x, y, kind: "out" }]);

      // L'écho revient après le vrai temps d'aller-retour.
      const timer = setTimeout(() => {
        timers.delete(timer);
        const label = `écho ${fr(rtt, 2)} s → fond à ${Math.round(distance)} m`;
        setWaves((w) => [...w, { id: nextId++, x, y, kind: "echo", label }]);
        window.dispatchEvent(new CustomEvent<SonarEcho>("sonar", { detail: { rtt, distance } }));
      }, rtt * 1000);
      timers.add(timer);
    };

    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
      timers.forEach(clearTimeout);
    };
  }, []);

  const remove = (id: number) => setWaves((w) => w.filter((wave) => wave.id !== id));

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {waves.map((w) => (
        <div
          key={w.id}
          className="absolute"
          style={{ left: w.x, top: w.y }}
          // On retire l'onde quand sa dernière animation est finie.
          onAnimationEnd={(e) =>
            (e.target as Element).classList.contains("sonar-last") && remove(w.id)
          }
        >
          <span className={`sonar-ring sonar-${w.kind} ${w.label ? "" : "sonar-last"}`} />
          {w.label && <span className="sonar-label sonar-last font-mono text-xs">{w.label}</span>}
        </div>
      ))}
    </div>
  );
}
