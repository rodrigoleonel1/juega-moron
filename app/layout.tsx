import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { Header } from "@/components/header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  preload: false,
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  preload: false,
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hoy juega Morón? - Próximo partido y resultados",
    template: `%s | Hoy juega Morón?`,
  },
  description:
    "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y fixture del Gallo de Morón.",
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
        url: "/og-image.jpg",
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
    images: [`${siteUrl}/og-image.jpg`],
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
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="8WARsLdu7-U5Xn5naWCUDUFKgOMsEK3rl4eZGz5iskM"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#C8102E" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
        <meta name="theme-color" content="#C8102E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <ServiceWorkerRegister />
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Hoy juega Morón?",
              url: siteUrl,
              description:
                "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y fixture del Gallo.",
              inLanguage: "es-AR",
              publisher: {
                "@type": "Organization",
                name: "Hoy juega Morón?",
                url: siteUrl,
                logo: {
                  "@type": "ImageObject",
                  url: `${siteUrl}/android-chrome-192x192.png`,
                },
              },
            }),
          }}
        />
        <div className="relative min-h-dvh">
          <div
            className="fixed inset-0 bg-[url(/bg.jpg)] bg-center bg-cover opacity-60 z-0"
            aria-hidden="true"
          />
          <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-[1]" aria-hidden="true" />
          <Header />
          <main id="main-content" className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
