/*
 * Le pied de page, tout au fond de la plongée.
 * Volontairement minimal : le copyright, les liens utiles, et un bouton
 * pour remonter (le lien "#" ramène en haut, donc à la surface).
 */

const annee = 2026;

const liens = [
  { href: "https://github.com/Slaytt", label: "GitHub ↗", externe: true },
  {
    href: "https://scholar.google.com/citations?user=6-_Jk4sAAAAJ&hl=fr",
    label: "Scholar ↗",
    externe: true,
  },
  { href: "mailto:teo.ranzi@etu.univ-amu.fr", label: "Mail", externe: false },
];

export default function Footer() {
  return (
    <footer
      data-no-sonar // un clic ici n'envoie pas de ping
      className="relative px-6 pb-6 font-mono text-sm text-foam md:pr-18 md:pl-60"
    >
      <div className="panel-sea flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sea-muted">© {annee} Téo Ranzi</span>
        <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
          {liens.map((lien) => (
            <li key={lien.href}>
              <a
                href={lien.href}
                {...(lien.externe && { target: "_blank", rel: "noreferrer" })}
                className="underline-offset-4 hover:underline"
              >
                {lien.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#" className="underline-offset-4 hover:underline">
              Remonter à la surface ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
