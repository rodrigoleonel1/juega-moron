import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const siteUrl = "https://juegamoron.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hoy juega Morón? - Próximo partido y resultados",
    template: `%s | Hoy juega Morón?`,
  },
  description:
    "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados, fixture, tabla de posiciones y más sobre el Gallo de Morón.",
  keywords: [
    "Deportivo Morón",
    "Morón",
    "futbol",
    "gallo",
    "partido",
    "hoy juega moron",
    "fixture",
    "resultados",
    "primera nacional",
    "ascenso",
    "tabla de posiciones",
  ],
  authors: [{ name: "Rodrigo Alarcón" }],
  creator: "Rodrigo Alarcón",
  openGraph: {
    title: "Hoy juega Morón? - Próximo partido y resultados",
    description:
      "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados recientes y más sobre el Gallo.",
    url: siteUrl,
    siteName: "Hoy juega Morón?",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hoy juega Morón?",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoy juega Morón? - Próximo partido y resultados",
    description:
      "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados recientes y más sobre el Gallo.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={outfit.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="8WARsLdu7-U5Xn5naWCUDUFKgOMsEK3rl4eZGz5iskM"
        />
        <link rel="canonical" href={siteUrl} />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="font-sans antialiased">
        <div className="relative min-h-dvh">
          <div
            className="fixed inset-0 bg-[url(/bg.jpg)] bg-center bg-cover opacity-60 z-0"
            aria-hidden="true"
          />
          <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-[1]" aria-hidden="true" />
          <Header />
          <main className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
