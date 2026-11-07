/*
 * Le rendu « rétro » (pixels + tramage, palette d'écran de sonar) : c'est la
 * version de base du site. Le Konami code bascule vers la version HD.
 *
 * L'état est un petit « store » hors de React : la scène 3D le lit à chaque
 * image, et le CSS réagit à `<html data-mode="retro">`.
 */

/**
 * Les 4 couleurs rétro (de la plus sombre à la plus claire) sont définies
 * UNE seule fois, dans globals.css (`--retro-0` à `--retro-3`). La scène 3D
 * et le filtre des images les lisent ici : on change la palette dans le CSS,
 * tout suit.
 */
export function readRetroPalette(): [number, number, number][] {
  const style = getComputedStyle(document.documentElement);
  return [0, 1, 2, 3].map((i) => {
    const hex = style.getPropertyValue(`--retro-${i}`).trim().replace("#", "");
    const n = parseInt(hex, 16) || 0;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  });
}

// Rétro par défaut : <html data-mode="retro"> est déjà écrit par le layout.
let retro = true;
const listeners = new Set<() => void>();

export const retroMode = {
  get: () => retro,
  set(value: boolean) {
    retro = value;
    if (value) document.documentElement.dataset.mode = "retro";
    else delete document.documentElement.dataset.mode;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/**
 * La rampe de `levels` tons, du plus sombre au plus clair, en dégradé entre
 * les 4 couleurs de la palette (même calcul que le shader de la mer).
 */
export function retroRamp(levels: number): [number, number, number][] {
  const p = readRetroPalette();
  return Array.from({ length: levels }, (_, i) => {
    const t = (i / (levels - 1)) * 3;
    const k = Math.min(2, Math.floor(t));
    const f = t - k;
    return [0, 1, 2].map((c) => p[k][c] + (p[k + 1][c] - p[k][c]) * f) as [number, number, number];
  });
}
