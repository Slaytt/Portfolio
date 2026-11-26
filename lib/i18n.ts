/*
 * Les langues du site. Ce fichier ne dépend de rien : le proxy, les pages
 * serveur et les composants client peuvent tous l'importer.
 */

export const locales = ["fr", "en", "es"] as const;
export type Locale = (typeof locales)[number];

/** Langue utilisée quand le navigateur n'en demande aucune des trois. */
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Nom de chaque langue dans sa propre langue (sélecteur de l'en-tête). */
export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
};

/** Nombre avec un nombre fixe de décimales, à la façon de la langue (1,5 / 1.5). */
export const formatNumber = (locale: Locale, x: number, digits: number) =>
  x.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
