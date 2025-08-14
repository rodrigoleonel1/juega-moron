"use client";

import { getNextMatch, getRecentMatches, Match } from "@/data/fixture";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useCountdown } from "@/hooks/use-countdown";
import { CountdownDisplay } from "@/components/countdown-display";
import { RecentMatches } from "@/components/recent-matches";
import { NextMatch } from "@/components/next-match";

export default function Home() {
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [countdownTargetDate, setCountdownTargetDate] = useState(new Date());

  useEffect(() => {
    const fetchedNextMatch = getNextMatch();
    setNextMatch(fetchedNextMatch);
    setRecentMatches(getRecentMatches(5));

    if (fetchedNextMatch) {
      setCountdownTargetDate(new Date(fetchedNextMatch.datetime));
    } else {
      setCountdownTargetDate(new Date(0));
    }
  }, []);

  const countdown = useCountdown(countdownTargetDate);

  const matchJsonLd = nextMatch
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `Deportivo Morón vs ${nextMatch.versus}`,
        startDate: nextMatch.datetime,
        location: {
          "@type": "Place",
          name: nextMatch.estadio || "Estadio a confirmar",
        },
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        performer: [
          { "@type": "SportsTeam", name: "Deportivo Morón" },
          { "@type": "SportsTeam", name: nextMatch.versus },
        ],
        description: `Próximo partido: Deportivo Morón vs ${
          nextMatch.versus
        } el ${new Date(nextMatch.datetime).toLocaleDateString("es-AR")}`,
      }
    : null;

  return (
    <>
      <Head>
        <title>Hoy juega Morón? - Próximo partido y resultados</title>
        <meta
          name="description"
          content="Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y más sobre el Gallo."
        />
        {matchJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(matchJsonLd) }}
          />
        )}
      </Head>
      <main className="lg:ml-10 space-y-6">
        <header>
          <h1 className="font-bold tracking-tighter text-6xl sm:text-8xl mt-6 max-w-xl">
            Hoy juega Morón?
          </h1>
        </header>
        <section>
          {nextMatch ? (
            <>
              <NextMatch match={nextMatch} />
              <CountdownDisplay
                {...countdown}
                ficha_partido={nextMatch.ficha_partido}
              />
            </>
          ) : (
            <div className="text-center mt-2 py-8 bg-black/50 rounded-md shadow-md max-w-lg">
              <h2 className="text-2xl font-bold">Cargando partido...</h2>
            </div>
          )}
        </section>
        <section>
          <RecentMatches recentMatches={recentMatches} />
        </section>
      </main>
    </>
  );
}
