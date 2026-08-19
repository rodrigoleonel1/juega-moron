"use client";

import { useMatchStatus } from "@/hooks/use-match-status";
import type { LiveMatch } from "@/lib/promiedos";
import type { Match } from "@/lib/types";
import { CountdownDisplay } from "@/components/countdown-display";
import { NextMatch } from "@/components/next-match";
import { LiveScoreCard } from "@/components/live-score-card";

interface NextMatchLiveProps {
  match: Match;
}

export function NextMatchLive({ match }: NextMatchLiveProps) {
  const liveMatch: LiveMatch | null = useMatchStatus(match);

  if (liveMatch?.status === "en vivo") {
    return (
      <div className="space-y-4">
        <CountdownDisplay match_date={match.datetime} status="en vivo" />
        <LiveScoreCard match={match} live={liveMatch} />
      </div>
    );
  }

  if (liveMatch?.status === "finalizado") {
    return (
      <div className="space-y-4">
        <CountdownDisplay match_date={match.datetime} status="finalizado" />
        <LiveScoreCard match={match} live={liveMatch} finished />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CountdownDisplay match_date={match.datetime} />
      <NextMatch match={match} />
    </div>
  );
}
