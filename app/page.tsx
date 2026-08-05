import type { Metadata } from "next";
import { RecentMatches } from "@/components/recent-matches";
import { NextMatchSection } from "@/components/next-match-section";
import { MatchSchema } from "@/components/match-schema";
import { getNextMatch } from "@/actions/getNextMatch";
import { getRecentMatches } from "@/actions/getRecentMatches";
import { SITE_URL } from "@/lib/constants";

const RECENT_MATCHES_TO_SHOW = 5;

export async function generateMetadata(): Promise<Metadata> {
  const nextMatch = await getNextMatch();
  const description = nextMatch?.versus
    ? `Próximo partido: Deportivo Morón vs ${nextMatch.versus}`
    : "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y más sobre el Gallo.";

  return {
    title: "Hoy juega Morón? - Próximo partido y resultados.",
    description,
    openGraph: {
      title: "Hoy juega Morón?",
      description,
      url: SITE_URL,
      siteName: "Juega Morón",
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
}

export default async function Home() {
  const [nextMatch, recentMatches] = await Promise.all([
    getNextMatch(),
    getRecentMatches(RECENT_MATCHES_TO_SHOW),
  ]);

  return (
    <>
      <MatchSchema match={nextMatch} />

      <section className="animate-fade-in">
        <header className="mb-6 max-w-xl">
          <h1 className="font-bold text-8xl tracking-tight leading-none text-white">
            Hoy juega Morón?
          </h1>
        </header>

        <NextMatchSection nextMatch={nextMatch} />
      </section>

      <section className="mt-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <RecentMatches recentMatches={recentMatches ?? []} />
      </section>
    </>
  );
}
