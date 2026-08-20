import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getStandings, serializeStandingsPayload } from "@/lib/promiedos";
import { SITE_URL } from "@/lib/constants";
import { PosicionesLive } from "@/components/posiciones-live";

const COMPETENCIA = "Primera Nacional";

export const metadata: Metadata = {
  title: "Posiciones",
  description:
    "Tabla de posiciones de la Primera Nacional con resultados en vivo. Seguí a Deportivo Morón y todos los equipos de la temporada 2026.",
  openGraph: {
    title: "Posiciones · Primera Nacional 2026",
    description:
      "Tabla de posiciones de la Primera Nacional con resultados en vivo. Seguí a Deportivo Morón y todos los equipos de la temporada 2026.",
    url: `${SITE_URL}/posiciones`,
    siteName: "Hoy juega Morón?",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Hoy juega Morón?",
      },
    ],
  },
};

export default async function PosicionesPage() {
  const data = await getStandingsCached();

  return <PosicionesLive initial={data ? serializeStandingsPayload(data) : null} />;
}

async function getStandingsCached() {
  "use cache";

  cacheTag("standings");
  cacheLife({ stale: 120, revalidate: 120, expire: 60 * 60 * 24 });

  return getStandings({ competencia: COMPETENCIA });
}