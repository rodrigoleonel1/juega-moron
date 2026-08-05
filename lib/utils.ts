import { ARGENTINA_TIME_ZONE, parseArgentinaDateTime } from "@/lib/argentina-date";

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
