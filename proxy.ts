import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/lib/i18n";

/*
 * Le proxy s'exécute avant chaque requête. Si l'adresse n'a pas de langue
 * (ex. teoranzi.dev/), on redirige vers celle que préfère le navigateur :
 * on lit l'en-tête Accept-Language (« es-ES,es;q=0.9,en;q=0.8 ») et on
 * garde la première langue qu'on sait servir.
 */

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return wanted.map((w) => w.lang).find(hasLocale) ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasPrefix) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Pas les fichiers internes de Next ni les fichiers statiques (images, favicon...).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
