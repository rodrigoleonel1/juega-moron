"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MatchActivity,
  StandingsPayload,
} from "@/lib/promiedos";
import { StandingsTable } from "@/app/posiciones/components/standings-table";

const POLL_INTERVAL_MS = 2 * 60 * 1000;
const MATCH_WINDOW_MS = 24 * 60 * 60 * 1000;
const WAKE_LEAD_MS = 3 * 60 * 60 * 1000;
const SLOW_HEARTBEAT_MS = 60 * 60 * 1000;

function nextSchedule(activity: MatchActivity, now: number) {
  const shouldPoll =
    activity.hasLive ||
    (activity.nextStartAt !== null &&
      activity.nextStartAt <= now + MATCH_WINDOW_MS);
  const nextWakeAt =
    shouldPoll || activity.nextStartAt === null
      ? null
      : activity.nextStartAt - WAKE_LEAD_MS;
  return { shouldPoll, nextWakeAt };
}

interface PosicionesLiveProps {
  initial: StandingsPayload | null;
}

export function PosicionesLive({ initial }: PosicionesLiveProps) {
  const [payload, setPayload] = useState<StandingsPayload | null>(initial);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/posiciones");
      if (response.ok) {
        const data = (await response.json()) as StandingsPayload;
        setPayload(data);
      }
    } catch {
      // keep showing the current data
    } finally {
      setTick((current) => current + 1);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    let delay = SLOW_HEARTBEAT_MS;

    if (payload?.activity) {
      const { shouldPoll, nextWakeAt } = nextSchedule(payload.activity, Date.now());
      if (shouldPoll) {
        delay = POLL_INTERVAL_MS;
      } else if (nextWakeAt !== null) {
        delay = Math.max(nextWakeAt - Date.now(), 0);
      }
    }

    timerRef.current = setTimeout(() => {
      refresh();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [payload, tick, refresh]);

  if (!payload || !payload.standings) {
    return (
      <section className="animate-fade-in mx-auto max-w-7xl mb-12">
        <h1 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-tight mb-6">
          Posiciones{" "}
          <span className="text-primary">2026</span>
        </h1>
        <div className="card p-6">
          <p className="text-muted">
            Las posiciones no están disponibles en este momento. Probá de nuevo
            en unos minutos.
          </p>
          <a
            href="https://www.promiedos.com.ar/primera_nacional"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-primary hover:underline"
          >
            Ver en promiedos
          </a>
        </div>
      </section>
    );
  }

  return (
    <StandingsTable standings={payload.standings} liveByTeam={payload.liveByTeam} />
  );
}