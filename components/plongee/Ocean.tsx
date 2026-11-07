"use client";

import { lazy, Suspense, useRef, useSyncExternalStore } from "react";

// three.js ne tourne que dans le navigateur. La scène est dans un fichier à part,
// chargé à la demande : le reste de la page s'affiche sans attendre la 3D.
const OceanScene = lazy(() => import("./OceanScene"));

// Vaut false pendant le rendu serveur, true une fois dans le navigateur.
const noop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(noop, () => true, () => false);

/** Fond fixe de l'accueil. Sa couleur CSS sert de « ciel » et de brouillard. */
export default function Ocean() {
  const backdrop = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  return (
    <div ref={backdrop} aria-hidden="true" className="fixed inset-0 -z-10 bg-paper">
      {isClient && (
        <Suspense>
          <OceanScene backdrop={backdrop} />
        </Suspense>
      )}
    </div>
  );
}
