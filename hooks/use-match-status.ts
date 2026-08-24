"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import { LIVE_WINDOW_MS } from "@/lib/constants";
import { isNavigating } from "@/lib/navigation-guard";
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

function isLiveWindow(match: Match): boolean {
  if (match.result) return false;
  const matchTime = parseArgentinaDateTime(match.datetime).getTime();
  if (Number.isNaN(matchTime)) return false;
  const now = Date.now();
  return now >= matchTime && now <= matchTime + LIVE_WINDOW_MS;
}

function createSyntheticLive(match: Match): LiveMatch {
  return {
    status: "en vivo",
    score: null,
    startTime: parseArgentinaDateTime(match.datetime),
    matchId: "",
    opponentId: match.id_prom,
    opponentName: match.versus,
    minute: undefined,
  };
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

  const fetchStatus = useCallback(async () => {
    if (!match?.versus) return;
    if (match.result) return;

    try {
      const query = new URLSearchParams({
        competencia: match.competencia,
        id_prom: match.id_prom,
      });
      const response = await fetch(`/api/match-status?${query}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        if (isLiveWindow(match)) {
          setLiveMatchState({ matchKey, match: createSyntheticLive(match) });
        }
        return;
      }

      const data = (await response.json()) as { match: LiveMatch | null };

      if (isNavigating()) return;

      if (data.match) {
        setLiveMatchState({ matchKey, match: data.match });
      } else if (isLiveWindow(match)) {
        setLiveMatchState({ matchKey, match: createSyntheticLive(match) });
      } else {
        setLiveMatchState(null);
      }

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
      if (match && isLiveWindow(match)) {
        setLiveMatchState({ matchKey, match: createSyntheticLive(match) });
      }
    }
  }, [match, matchKey, router]);

  useEffect(() => {
    if (!match?.versus) return;
    if (match.result) {
      setLiveMatchState(null);
      return;
    }

    const matchTime = parseArgentinaDateTime(match.datetime).getTime();
    const now = Date.now();

    if (now < matchTime - POLL_BEFORE_MS || now > matchTime + POLL_AFTER_MS) {
      return;
    }

    // Si ya estamos en ventana de partido, mostrar En vivo inmediatamente aunque promiedos aún no responda
    if (isLiveWindow(match)) {
      setLiveMatchState({ matchKey, match: createSyntheticLive(match) });
    }

    let cancelled = false;

    const wrappedFetch = async () => {
      if (cancelled) return;
      await fetchStatus();
    };

    wrappedFetch();
    const interval = setInterval(wrappedFetch, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchKey, match, fetchStatus]);

  // Exponer retrigger para que el countdown llame al cruzar 0
  // Se adjunta como propiedad del hook vía efecto secundario: el consumidor puede llamar a fetchStatus si necesita
  // Para mantener compatibilidad, retornamos liveMatch pero también permitimos que CountdownDisplay dispare
  // un evento global. En NextMatchLive usaremos un listener.

  useEffect(() => {
    const handler = () => {
      fetchStatus();
    };
    window.addEventListener("match-countdown-finished", handler);
    return () => window.removeEventListener("match-countdown-finished", handler);
  }, [fetchStatus]);

  return liveMatch;
}
