import type { Metadata } from "next";
import { Charis_SIL, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Texte : une serif de linguiste (Charis SIL est faite pour l'API phonétique).
const charis = Charis_SIL({
  variable: "--font-charis",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Mesures, légendes, jauge, et tout le texte de la version rétro : une mono d'instrument.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

// Titres de la version rétro : une grotesque géométrique, techno années 70.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-title",
  weight: ["500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Teo Ranzi",
    template: "%s · Teo Ranzi",
  },
  description: "Portfolio : projets, CV et logiciels.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-mode="retro" // version rétro par défaut ; le Konami code passe en HD
      className={`${charis.variable} ${plexMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-serif">{children}</body>
    </html>
  );
}
