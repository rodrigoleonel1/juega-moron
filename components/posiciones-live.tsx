"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StandingsPayload } from "@/lib/promiedos";
import { StandingsTable } from "@/app/posiciones/components/standings-table";

const POLL_INTERVAL_MS = 60 * 60 * 1000;
const FOCUS_REFRESH_THROTTLE_MS = 60 * 1000;
const ARG_TZ = "America/Argentina/Buenos_Aires";
const WINDOW_DAYS = new Set([5, 6, 0, 1]); // Vie, Sáb, Dom, Lun
const WINDOW_START_HOUR = 13;
const WINDOW_END_HOUR = 24; // 13:00 inclusive — 24:00 exclusive (13-23)

function getArgParts(date: Date): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARG_TZ,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: weekdayMap[weekdayStr] ?? 0,
    hour: parseInt(hourStr, 10),
  };
}

function isInWindow(date: Date = new Date()): boolean {
  const { day, hour } = getArgParts(date);
  return WINDOW_DAYS.has(day) && hour >= WINDOW_START_HOUR && hour < WINDOW_END_HOUR;
}

function msUntilNextWindow(now: Date): number {
  // Buscar el próximo minuto que cae dentro de la ventana, hasta 8 días adelante.
  // Paso de 1 minuto para mantener el cálculo simple y correcto con DST (ARG no tiene DST).
  const maxOffset = 8 * 24 * 60 * 60 * 1000;
  for (let offset = 60 * 1000; offset <= maxOffset; offset += 60 * 1000) {
    const candidate = new Date(now.getTime() + offset);
    if (isInWindow(candidate)) return offset;
  }
  return POLL_INTERVAL_MS;
}

function getNextDelay(): number {
  const now = new Date();
  if (isInWindow(now)) return POLL_INTERVAL_MS;
  return msUntilNextWindow(now);
}

interface PosicionesLiveProps {
  initial: StandingsPayload | null;
}

export function PosicionesLive({ initial }: PosicionesLiveProps) {
  const [payload, setPayload] = useState<StandingsPayload | null>(initial);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(async () => {
    // Solo refrescar si estamos dentro de la ventana horaria
    if (!isInWindow(new Date())) {
      setTick((current) => current + 1);
      return;
    }
    lastRefreshAtRef.current = Date.now();
    try {
      const response = await fetch("/api/posiciones", { cache: "no-store" });
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
    const id = setTimeout(refresh, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAtRef.current < FOCUS_REFRESH_THROTTLE_MS) {
        return;
      }
      if (!isInWindow(new Date())) return;
      refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const delay = getNextDelay();

    timerRef.current = setTimeout(() => {
      refresh();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick, refresh]);

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

  return <StandingsTable standings={payload.standings} />;
}
