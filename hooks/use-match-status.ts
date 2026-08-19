"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import type { LiveMatch } from "@/lib/promiedos";
import type { Match } from "@/lib/types";

const POLL_INTERVAL_MS = 25_000;
const POLL_BEFORE_MS = 3 * 60 * 60 * 1000;
const POLL_AFTER_MS = 6 * 60 * 60 * 1000;
const REFRESH_THROTTLE_MS = 60_000;

interface LiveMatchState {
  matchKey: string;
  match: LiveMatch;
}

export function useMatchStatus(match: Match | null): LiveMatch | null {
  const router = useRouter();
  const [liveMatchState, setLiveMatchState] = useState<LiveMatchState | null>(
    null,
  );
  const lastRefreshRef = useRef<{ matchKey: string; ts: number } | null>(null);

  const matchKey = match
    ? `${match.versus}|${match.competencia}|${match.id_prom}|${match.datetime}`
    : "";

  const liveMatch =
    liveMatchState && liveMatchState.matchKey === matchKey
      ? liveMatchState.match
      : null;

  useEffect(() => {
    if (!match?.versus) return;

    const matchTime = parseArgentinaDateTime(match.datetime).getTime();
    const now = Date.now();

    if (now < matchTime - POLL_BEFORE_MS || now > matchTime + POLL_AFTER_MS) {
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const query = new URLSearchParams({
          competencia: match.competencia,
          id_prom: match.id_prom,
        });
        const response = await fetch(`/api/match-status?${query}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as { match: LiveMatch | null };

        if (cancelled) return;

        setLiveMatchState(data.match ? { matchKey, match: data.match } : null);

        if (data.match?.status === "finalizado") {
          const last = lastRefreshRef.current;
          const nowTs = Date.now();

          if (
            !last ||
            last.matchKey !== matchKey ||
            nowTs - last.ts >= REFRESH_THROTTLE_MS
          ) {
            lastRefreshRef.current = { matchKey, ts: nowTs };
            router.refresh();
          }
        }
      } catch {
        // si promiedos falla, seguimos mostrando el countdown normal
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchKey, match?.competencia, match?.id_prom, match?.versus, match?.datetime, router]);

  return liveMatch;
}