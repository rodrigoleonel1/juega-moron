export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const TIME_ZONE = ARGENTINA_TIME_ZONE;

function getArgentinaOffsetMs(date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      timeZoneName: "shortOffset",
    }).formatToParts(date);

    const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-3";
    const match = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);

    if (match) {
      const sign = match[1] === "-" ? -1 : 1;
      const hours = parseInt(match[2], 10);
      const minutes = parseInt(match[3] ?? "0", 10);
      return sign * (hours * 3600 + minutes * 60) * 1000;
    }
  } catch {
    // fallback: Argentina usa UTC-3 (sin horario de verano desde 2009)
  }

  return -3 * 60 * 60 * 1000;
}

export function parseArgentinaDateTime(datetime: string): Date {
  const match = datetime.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/
  );

  if (!match) return new Date(datetime);

  const [, year, month, day, hour, minute, second] = match;
  const wall = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);

  return new Date(wall.getTime() - getArgentinaOffsetMs(wall));
}

export function getArgentinaDate(): Date {
  const now = new Date();
  const offsetMs = getArgentinaOffsetMs(now);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)) - offsetMs);
}

export function getArgentinaDateKey(): string {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  return `${year}-${month}-${day}`;
}
