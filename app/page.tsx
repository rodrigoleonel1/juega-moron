"use client";

import { CountdownDisplay } from "@/components/countdown-display";
import NextMatch from "@/components/next-match";
import { RecentMatches } from "@/components/recent-matches";
import { getNextMatch, getRecentMatches, Match } from "@/data/fixture";
import { useCountdown } from "@/hooks/use-countdown";
import { useEffect, useState } from "react";

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

  if (!nextMatch) {
    return (
      <main className="relative h-screen">
        {/* Fondo con opacidad */}
        <div className="absolute inset-0 bg-[url(/bg.jpg)] bg-center bg-cover opacity-70 z-0"></div>

        {/* Contenido */}
        <section className="relative z-10 h-full text-white p-10 flex flex-col gap-6 max-w-2xl mr-auto">
          <h1 className="font-bold tracking-tighter text-7xl sm:text-8xl mt-6">
            Hoy juega Morón?
          </h1>

          <div className="text-center p-4 bg-black/50 rounded-md shadow-md">
            <h2 className="text-2xl font-bold">Cargando partido...</h2>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      {/* Fondo con opacidad */}
      <div className="absolute inset-0 bg-[url(/bg.jpg)] bg-center bg-cover opacity-70 z-0"></div>

      {/* Contenido */}
      <section className="relative z-10 h-full text-white p-10 flex flex-col gap-6 max-w-2xl mr-auto">
        <h1 className="font-bold tracking-tighter text-6xl sm:text-8xl mt-6">
          Hoy juega Morón?
        </h1>
        <NextMatch match={nextMatch} />
        <CountdownDisplay {...countdown} />
        <RecentMatches recentMatches={recentMatches} />
      </section>
    </main>
  );
}
