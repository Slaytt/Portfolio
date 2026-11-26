import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import type { Dictionary } from "@/dictionaries/fr";
import { hasLocale, type Locale } from "./i18n";

/*
 * Charge les textes de la langue de la page. `lang()` lit le segment
 * `[lang]` de l'URL (/fr, /en, /es) depuis n'importe quel composant serveur,
 * sans avoir à le faire passer de composant en composant.
 * Ce fichier ne marche que côté serveur (Next refuse `next/root-params`
 * dans un composant client).
 */

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("@/dictionaries/fr").then((m) => m.default),
  en: () => import("@/dictionaries/en").then((m) => m.default),
  es: () => import("@/dictionaries/es").then((m) => m.default),
};

/** La langue de la page en cours ; 404 si l'URL en demande une inconnue. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary() {
  return dictionaries[await getLocale()]();
}
