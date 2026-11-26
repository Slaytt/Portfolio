import Image from "next/image";
import { getDictionary, getLocale } from "@/lib/dictionary";
import { localeNames, locales } from "@/lib/i18n";

/*
 * L'en-tête fixe. Le logo, c'est le spectrogramme du prénom « Téo »
 * prononcé : l'explosion du t, puis le formant qui descend de e à o.
 *
 * Il change de couleurs en plongeant, sans JavaScript ici : la jauge écrit
 * `data-under` sur <html>, et la variante CSS `under:` réagit.
 *
 * À droite, le sélecteur de langue : de simples liens vers /fr, /en, /es.
 */

export default async function Header() {
  const [dict, current] = await Promise.all([getDictionary(), getLocale()]);
  const liens = [
    { href: "#passions", label: dict.header.passions },
    { href: "#contact", label: dict.header.contact },
  ];

  return (
    <header
      data-no-sonar // un clic sur l'en-tête n'envoie pas de ping
      className="panel-paper under:panel-sea fixed inset-x-4 top-4 z-20 flex items-center justify-between gap-6 px-4 py-2.5 font-mono text-ink transition-colors under:text-foam md:inset-x-6"
    >
      <a href="#" className="flex items-center gap-3 no-underline" aria-label={dict.header.home}>
        <Image
          src="/spectrogrammes/teo.png"
          alt=""
          width={1200}
          height={400}
          priority
          className="spectro-logo block h-12 w-40 object-fill"
        />
        {/* Le nom n'apparaît que sous l'eau : en surface, « Téo » est déjà en grand. */}
        <span className="flex flex-col leading-tight opacity-0 transition-opacity duration-500 under:opacity-100">
          <span className="text-sm font-bold">Téo Ranzi</span>
          <span className="text-xs opacity-70">[te.o]</span>
        </span>
      </a>
      <div className="flex items-center gap-5">
      <nav aria-label={dict.header.nav}>
        <ul className="m-0 flex list-none gap-5 p-0 text-sm">
          {liens.map((lien) => (
            <li key={lien.href}>
              <a href={lien.href} className="underline-offset-4 hover:underline">
                {lien.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label={dict.header.languages}>
        <ul className="m-0 flex list-none gap-1.5 p-0 text-xs uppercase">
          {locales.map((locale) => (
            <li key={locale}>
              <a
                href={`/${locale}`}
                hrefLang={locale}
                lang={locale}
                title={localeNames[locale]}
                aria-current={locale === current ? "page" : undefined}
                className="px-0.5 underline-offset-4 opacity-60 hover:underline aria-[current=page]:font-bold aria-[current=page]:opacity-100"
              >
                {locale}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </header>
  );
}
