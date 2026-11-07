"use client";

import { useEffect, useRef, useState } from "react";
import { retroMode, retroRamp } from "./retro";

// ↑ ↑ ↓ ↓ ← → ← → B A
const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Le Konami code bascule entre la version rétro (par défaut) et la version HD.
 * Ce composant porte aussi le filtre SVG qui passe les images à la palette rétro.
 */
export default function Konami() {
  const [toast, setToast] = useState<string | null>(null);
  const funcs = useRef<(SVGFEFuncRElement | SVGFEFuncGElement | SVGFEFuncBElement | null)[]>([]);

  useEffect(() => {
    // Recopie la rampe de la palette dans le filtre (16 valeurs par canal).
    const syncFilter = () => {
      const palette = retroRamp(16);
      funcs.current.forEach((f, c) =>
        f?.setAttribute("tableValues", palette.map((p) => p[c].toFixed(3)).join(" ")),
      );
    };
    syncFilter();

    let progress = 0;
    let hide: ReturnType<typeof setTimeout>;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      // Bonne touche : on avance. Sinon on repart de zéro (ou de 1 si c'est ↑).
      progress = key === CODE[progress] ? progress + 1 : key === CODE[0] ? 1 : 0;
      if (progress < CODE.length) return;

      progress = 0;
      const retro = !retroMode.get();
      retroMode.set(retro);
      if (retro) syncFilter();
      setToast(retro ? "RETOUR AU SONAR" : "MODE HD");
      clearTimeout(hide);
      hide = setTimeout(() => setToast(null), 2500);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(hide);
    };
  }, []);

  return (
    <>
      {/*
        Filtre « rétro » pour les images : on passe en niveaux de gris, puis
        chaque canal est ramené aux 16 tons de la rampe (comme la mer).
      */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="retro" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR ref={(el) => void (funcs.current[0] = el)} type="discrete" />
            <feFuncG ref={(el) => void (funcs.current[1] = el)} type="discrete" />
            <feFuncB ref={(el) => void (funcs.current[2] = el)} type="discrete" />
          </feComponentTransfer>
        </filter>
      </svg>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed top-6 left-1/2 z-30 -translate-x-1/2"
      >
        {toast && (
          <p className="m-0 border-2 border-current bg-paper px-4 py-3 font-mono text-sm text-ink">
            {toast}
            {toast === "MODE HD" && (
              <span className="block pt-2 text-[10px] opacity-70">↑↑↓↓←→←→BA pour revenir</span>
            )}
          </p>
        )}
      </div>
    </>
  );
}
