import { ARGENTINA_TIME_ZONE, parseArgentinaDateTime } from "@/lib/argentina-date";
import type { MatchResult, Season } from "@/lib/types";

export function isSeason(value: string): value is Season {
  return value === "TEMP25" || value === "TEMP26";
}

export function getResultOutcome(result: string | undefined): MatchResult | null {
  const outcome = result?.match(/\(([GEP])\)/)?.[1];

  return outcome === "G" || outcome === "E" || outcome === "P" ? outcome : null;
}

export const RESULT_OUTCOME_CLASS: Record<MatchResult, string> = {
  G: "text-success",
  E: "text-warning",
  P: "text-error",
};

export function formatMatchDate(datetime: string) {
  const date = parseArgentinaDateTime(datetime);
  return {
    date: date.toLocaleDateString("es-AR", {
      timeZone: ARGENTINA_TIME_ZONE,
      day: "numeric",
      month: "long",
    }),
    time: date.toLocaleTimeString("es-AR", {
      timeZone: ARGENTINA_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

export function formatMatchDateFull(datetime: string) {
  const date = parseArgentinaDateTime(datetime);
  return {
    date: date.toLocaleDateString("es-AR", {
      timeZone: ARGENTINA_TIME_ZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-AR", {
      timeZone: ARGENTINA_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}
