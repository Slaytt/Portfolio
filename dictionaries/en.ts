import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    description: "Portfolio: projects, CV and software.",
  },
  header: {
    home: "Téo Ranzi, back to top",
    nav: "Main navigation",
    languages: "Language",
    passions: "Interests",
    contact: "Contact",
  },
  hero: {
    intro:
      "Maths and computer science student in Aix-Marseille. I’m drawn to the sounds of the sea and the sounds of language, and I like understanding how tools actually work.",
    scroll: "Scroll to dive ↓",
  },
  passions: {
    label: "below the surface",
    title: "What I’m into,",
    titleEnd: "in pictures of sound.",
    text: "Each image is the spectrogram of a sound tied to the topic: time runs from left to right, frequency from bottom to top.",
    items: [
      { title: "Bioacoustics", sound: "dolphin click", detail: "NBHF detector, OceanKit, Hublot" },
      { title: "Linguistics & NLP", sound: "vowels", detail: "Gender bias, Circuit Atlas" },
      { title: "Video games", sound: "8-bit square wave", detail: "Retro machines and old consoles" },
      { title: "Travel & diving", sound: "wind and birds", detail: "South America" },
    ],
  },
  contact: {
    title: "Got a project?",
    titleEnd: "Let’s talk.",
    text: "An internship, a collaboration, a question about one of my projects: drop me a line.",
  },
  footer: {
    mail: "Email",
    top: "Back to the surface ↑",
  },
  gauge: {
    depth: "depth",
    surface: "surface",
    pressure: "pressure",
    temperature: "temp.",
    light: "light",
    zone: "zone",
    echo: "echo",
    clickHint: "click ↯",
    zones: {
      surface: "surface",
      epipelagic: "epipelagic",
      mesopelagic: "mesopelagic",
      bathypelagic: "bathypelagic",
    },
  },
  sonar: {
    echo: "echo {rtt} s → seafloor at {distance} m",
  },
  konami: {
    retro: "BACK TO SONAR",
    hd: "HD MODE",
    hdHint: "↑↑↓↓←→←→BA to go back",
  },
};

export default en;
