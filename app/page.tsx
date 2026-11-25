import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import DepthGauge from "@/components/plongee/DepthGauge";
import Konami from "@/components/plongee/Konami";
import Ocean from "@/components/plongee/Ocean";
import Sonar from "@/components/plongee/Sonar";

// Les quatre passions. Chaque image est le spectrogramme d'un son
// qui va avec : `son` sert de légende sous l'image.
const passions = [
  {
    titre: "Bioacoustique",
    son: "clic de dauphin",
    detail: "Détecteur NBHF, OceanKit, Hublot",
    image: "/spectrogrammes/dauphin.png",
  },
  {
    titre: "Linguistique & TAL",
    son: "voyelles",
    detail: "Biais de genre, Circuit Atlas",
    image: "/spectrogrammes/voyelles.png",
  },
  {
    titre: "Jeux vidéo",
    son: "onde carrée 8 bits",
    detail: "Machines rétro et vieilles consoles",
    image: "/spectrogrammes/8bits.png",
  },
  {
    titre: "Voyage & plongée",
    son: "vent et oiseaux",
    detail: "Amérique du Sud",
    image: "/spectrogrammes/vent-oiseaux.png",
  },
];

export default function Home() {
  return (
    <main className="relative">
      <Ocean />
      <Header />
      <DepthGauge />
      <Sonar />
      <Konami />

      {/* Au-dessus de l'eau : le nom et une phrase */}
      <section className="relative flex min-h-svh flex-col justify-end px-6 py-14 text-ink md:pr-18 md:pl-60">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
          <h1 className="m-0 text-[clamp(96px,12vw,176px)] leading-[0.85] font-bold">
            Téo
          </h1>
          <div className="panel-paper flex flex-col gap-3.5 px-6 py-5">
            <p className="m-0 text-xl leading-[1.55]">
              Étudiant en maths et informatique à Aix-Marseille. Je
              m’intéresse aux sons de la mer et à ceux du langage, et
              j’aime comprendre comment les outils marchent.
            </p>
            <p className="m-0 font-mono text-sm font-medium text-ink-muted">
              Faites défiler pour plonger ↓
            </p>
          </div>
        </div>
      </section>

      {/* La traversée de la surface : de l'espace vide pour laisser la caméra descendre */}
      <div aria-hidden="true" className="h-[128vh]" />

      {/* Sous la surface */}
      <section id="passions" className="flex min-h-[111vh] flex-col gap-7 px-6 text-foam md:pr-18 md:pl-60">
        <div className="panel-sea flex max-w-[44rem] flex-col gap-5 px-7 py-6">
          <span className="font-mono text-sm text-sea-muted">
            sous la surface
          </span>
          <h2 className="m-0 text-[clamp(52px,6vw,80px)] leading-[0.95] font-bold">
            Ce qui me passionne,
            <br />
            <em className="font-normal text-sea-muted not-italic">en images de sons.</em>
          </h2>
          <p className="m-0 max-w-[46ch] text-xl leading-[1.55] text-sea-text">
            Chaque image est le spectrogramme d’un son lié au sujet : on y
            lit le temps de gauche à droite et les fréquences de bas en
            haut.
          </p>
        </div>
        <ul className="mt-6 grid list-none grid-cols-1 gap-7 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {passions.map((passion) => (
            <li
              key={passion.titre}
              className="panel-sea flex flex-col gap-2.5 p-3 pb-4"
            >
              <Image
                src={passion.image}
                alt=""
                width={960}
                height={400}
                className="h-[130px] w-full rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(143,233,255,0.25)]"
              />
              <span className="px-1 font-mono text-xs text-sea-muted">
                ♪ {passion.son}
              </span>
              <h3 className="m-0 px-1 text-[21px] font-bold">
                {passion.titre}
              </h3>
              <span className="px-1 text-base leading-[1.45] text-sea-text">
                {passion.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact, tout au fond */}
      <section id="contact" className="flex min-h-svh flex-col items-start px-6 pt-40 text-foam md:pr-18 md:pl-60">
        <div className="panel-sea flex flex-col gap-5.5 px-7 py-6">
          <h2 className="m-0 text-[clamp(52px,6vw,80px)] leading-[0.95] font-bold">
            Un projet ?
            <br />
            <em className="font-normal text-sea-muted not-italic">Parlons-en.</em>
          </h2>
          <p className="m-0 max-w-[44ch] text-xl leading-[1.55] text-sea-text">
            Un stage, une collaboration, une question sur un de mes
            projets : écrivez-moi.
          </p>
          <a
            href="mailto:teo.ranzi@etu.univ-amu.fr"
            className="mt-3 self-start text-xl break-all text-bio underline underline-offset-4 transition-colors hover:text-foam"
          >
            teo.ranzi@etu.univ-amu.fr
          </a>
          <ul className="m-0 flex list-none flex-wrap gap-5 p-0 font-mono text-base text-sea-muted">
            {[
              { href: "https://github.com/Slaytt", label: "GitHub ↗" },
              {
                href: "https://scholar.google.com/citations?user=6-_Jk4sAAAAJ&hl=fr",
                label: "Google Scholar ↗",
              },
            ].map((lien) => (
              <li key={lien.href}>
                <a
                  href={lien.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:text-foam hover:underline"
                >
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
