import Image from "next/image";
import Header from "@/components/Header";
import DepthGauge from "@/components/plongee/DepthGauge";
import Konami from "@/components/plongee/Konami";
import Ocean from "@/components/plongee/Ocean";
import Sonar from "@/components/plongee/Sonar";

// Les quatre passions, chacune avec « son » spectrogramme.
const passions = [
  {
    titre: "Clics de dauphin",
    detail: "Bioacoustique : détecteur NBHF, OceanKit, Hublot",
    image: "/spectrogrammes/dauphin.png",
  },
  {
    titre: "Voyelles",
    detail: "Linguistique et TAL : biais de genre, Circuit Atlas",
    image: "/spectrogrammes/voyelles.png",
  },
  {
    titre: "Onde carrée 8 bits",
    detail: "Jeux vidéo et machines rétro",
    image: "/spectrogrammes/8bits.png",
  },
  {
    titre: "Vent et oiseaux",
    detail: "Voyage et plongée, Amérique du Sud",
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
              Maths, informatique et langage. J’écoute des dauphins, des
              voyelles et des vieilles consoles.
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
          <h2 className="m-0 max-w-[12ch] text-[clamp(52px,6vw,80px)] leading-[0.95] font-bold">
            Tout ce que j’écoute
          </h2>
          <p className="m-0 max-w-[46ch] text-xl leading-[1.55] text-sea-text">
            Chaque passion a un son, et chaque son a un spectrogramme. Sous
            l’eau, ils reprennent leurs couleurs.
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
              <h3 className="m-0 px-1 pt-1 text-[21px] font-bold">
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
            Me contacter
          </h2>
          <p className="m-0 max-w-[44ch] text-xl leading-[1.55] text-sea-text">
            Un stage, une collaboration, un enregistrement à partager.
          </p>
          {/* TODO : mettre la vraie adresse */}
          <a
            href="mailto:"
            className="mt-3 self-start text-xl text-bio underline underline-offset-4 transition-colors hover:text-foam"
          >
            [TON ADRESSE]
          </a>
        </div>
      </section>
    </main>
  );
}
