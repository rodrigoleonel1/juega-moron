import { Match } from "@/lib/types";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import { EMPTY_MATCH, LIVE_WINDOW_MS } from "@/lib/constants";
import { getMatches } from "./getMatches";

const GRACE_MS = 24 * 60 * 60 * 1000;

export const getNextMatch = async (): Promise<Match> => {
  let data: Match[];

  try {
    data = await getMatches();
  } catch (error) {
    console.error("Error al obtener el próximo partido:", error);
    return EMPTY_MATCH;
  }

  const now = Date.now();
  const sorted = data
    .map((match) => ({
      match,
      matchTime: parseArgentinaDateTime(match.datetime).getTime(),
    }))
    .sort((a, b) => a.matchTime - b.matchTime);

  // Preferir próximo futuro sin resultado
  for (const { match, matchTime } of sorted) {
    if (match.result) continue;
    if (Number.isNaN(matchTime)) continue;
    if (matchTime > now) return match;
  }

  // Ventana de gracia: partido en curso (hasta 3h) o reciente (<24h) sin resultado aún
  for (const { match, matchTime } of sorted) {
    if (match.result) continue;
    if (Number.isNaN(matchTime)) continue;
    if (matchTime <= now && now <= matchTime + LIVE_WINDOW_MS) return match;
    if (matchTime <= now && now <= matchTime + GRACE_MS) return match;
  }

  // Si todo pendiente está vencido fuera de grace, no devolver stale de hace días
  // Cae a temporada finalizada en vez de "Próximo vs Racing 2 días atrás / En vivo"
  return EMPTY_MATCH;
};
