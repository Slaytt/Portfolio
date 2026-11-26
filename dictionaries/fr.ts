/*
 * Tous les textes du site, en français. C'est la langue de référence :
 * son type (`Dictionary`) est imposé à en.ts et es.ts, donc TypeScript
 * signale toute traduction manquante.
 *
 * Que des chaînes : ces textes passent aussi aux composants client (jauge,
 * sonar, Konami), qui ne peuvent recevoir que des données sérialisables.
 * D'où les trous `{rtt}` / `{distance}` à remplir plutôt que des fonctions.
 */

const fr = {
  meta: {
    description: "Portfolio : projets, CV et logiciels.",
  },
  header: {
    home: "Téo Ranzi, retour en haut",
    nav: "Navigation principale",
    languages: "Langue",
    passions: "Passions",
    contact: "Contact",
  },
  hero: {
    intro:
      "Étudiant en maths et informatique à Aix-Marseille. Je m’intéresse aux sons de la mer et à ceux du langage, et j’aime comprendre comment les outils marchent.",
    scroll: "Faites défiler pour plonger ↓",
  },
  passions: {
    label: "sous la surface",
    title: "Ce qui me passionne,",
    titleEnd: "en images de sons.",
    text: "Chaque image est le spectrogramme d’un son lié au sujet : on y lit le temps de gauche à droite et les fréquences de bas en haut.",
    // Même ordre que les images dans app/[lang]/page.tsx.
    items: [
      { title: "Bioacoustique", sound: "clic de dauphin", detail: "Détecteur NBHF, OceanKit, Hublot" },
      { title: "Linguistique & TAL", sound: "voyelles", detail: "Biais de genre, Circuit Atlas" },
      { title: "Jeux vidéo", sound: "onde carrée 8 bits", detail: "Machines rétro et vieilles consoles" },
      { title: "Voyage & plongée", sound: "vent et oiseaux", detail: "Amérique du Sud" },
    ],
  },
  contact: {
    title: "Un projet ?",
    titleEnd: "Parlons-en.",
    text: "Un stage, une collaboration, une question sur un de mes projets : écrivez-moi.",
  },
  footer: {
    mail: "Mail",
    top: "Remonter à la surface ↑",
  },
  gauge: {
    depth: "prof.",
    surface: "surface",
    pressure: "pression",
    temperature: "temp.",
    light: "lumière",
    zone: "zone",
    echo: "écho",
    clickHint: "clic ↯",
    zones: {
      surface: "surface",
      epipelagic: "épipélagique",
      mesopelagic: "mésopélagique",
      bathypelagic: "bathypélagique",
    },
  },
  sonar: {
    echo: "écho {rtt} s → fond à {distance} m",
  },
  konami: {
    retro: "RETOUR AU SONAR",
    hd: "MODE HD",
    hdHint: "↑↑↓↓←→←→BA pour revenir",
  },
};

// Même forme que le français, mais n'importe quel texte (pas les chaînes exactes).
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof fr>;

export default fr satisfies Dictionary;
