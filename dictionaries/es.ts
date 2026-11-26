import type { Dictionary } from "./fr";

const es: Dictionary = {
  meta: {
    description: "Portafolio: proyectos, CV y software.",
  },
  header: {
    home: "Téo Ranzi, volver arriba",
    nav: "Navegación principal",
    languages: "Idioma",
    passions: "Pasiones",
    contact: "Contacto",
  },
  hero: {
    intro:
      "Estudiante de matemáticas e informática en Aix-Marsella. Me interesan los sonidos del mar y los del lenguaje, y me gusta entender cómo funcionan las herramientas.",
    scroll: "Desliza para sumergirte ↓",
  },
  passions: {
    label: "bajo la superficie",
    title: "Lo que me apasiona,",
    titleEnd: "en imágenes de sonido.",
    text: "Cada imagen es el espectrograma de un sonido ligado al tema: el tiempo se lee de izquierda a derecha y las frecuencias de abajo arriba.",
    items: [
      { title: "Bioacústica", sound: "clic de delfín", detail: "Detector NBHF, OceanKit, Hublot" },
      { title: "Lingüística y PLN", sound: "vocales", detail: "Sesgo de género, Circuit Atlas" },
      { title: "Videojuegos", sound: "onda cuadrada de 8 bits", detail: "Máquinas retro y consolas antiguas" },
      { title: "Viajes y buceo", sound: "viento y pájaros", detail: "Sudamérica" },
    ],
  },
  contact: {
    title: "¿Un proyecto?",
    titleEnd: "Hablemos.",
    text: "Unas prácticas, una colaboración, una pregunta sobre alguno de mis proyectos: escríbeme.",
  },
  footer: {
    mail: "Correo",
    top: "Volver a la superficie ↑",
  },
  gauge: {
    depth: "prof.",
    surface: "superficie",
    pressure: "presión",
    temperature: "temp.",
    light: "luz",
    zone: "zona",
    echo: "eco",
    clickHint: "clic ↯",
    zones: {
      surface: "superficie",
      epipelagic: "epipelágica",
      mesopelagic: "mesopelágica",
      bathypelagic: "batipelágica",
    },
  },
  sonar: {
    echo: "eco {rtt} s → fondo a {distance} m",
  },
  konami: {
    retro: "VOLVER AL SONAR",
    hd: "MODO HD",
    hdHint: "↑↑↓↓←→←→BA para volver",
  },
};

export default es;
