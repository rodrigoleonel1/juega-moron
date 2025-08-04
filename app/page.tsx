"use client";

import { getNextMatch, getRecentMatches, Match } from "@/data/fixture";
import { useEffect, useState } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { CountdownDisplay } from "@/components/countdown-display";
import { RecentMatches } from "@/components/recent-matches";
import { NextMatch } from "@/components/next-match";
import MatchScoreboard from "@/components/match-scoreboard";

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
  const isToday =
    nextMatch && new Date(nextMatch.datetime).getDay() === new Date().getDay();

  return (
    <div className="lg:ml-10 space-y-6">
      <h1 className="font-bold tracking-tighter text-6xl sm:text-8xl mt-6 max-w-xl">
        Hoy juega Morón
        <span>{isToday ? "!" : "?"}</span>
      </h1>
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
      <RecentMatches recentMatches={recentMatches} />
    </div>
  );
}
