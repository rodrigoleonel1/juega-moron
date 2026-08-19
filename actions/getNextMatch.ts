import { Match } from "@/lib/types";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import { EMPTY_MATCH } from "@/lib/constants";
import { getMatches } from "./getMatches";

// Ventana durante la cual un partido sin resultado sigue considerándose "actual"
// (cubre en vivo + resultado pendiente hasta que la sheet se actualice).
const MATCH_CURRENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const getNextMatch = async (): Promise<Match> => {
  let data: Match[];

  try {
    data = await getMatches();
  } catch (error) {
    console.error("Error al obtener el próximo partido:", error);
    return EMPTY_MATCH;
  }

  const now = new Date();

  const currentMatches = data
    .map((match) => ({ match, matchTime: parseArgentinaDateTime(match.datetime) }))
    .filter(({ match, matchTime }) => {
      return (
        !match.result &&
        now.getTime() - matchTime.getTime() < MATCH_CURRENT_WINDOW_MS
      );
    })
    .sort((a, b) => {
      const aIsPast = a.matchTime.getTime() < now.getTime();
      const bIsPast = b.matchTime.getTime() < now.getTime();

      // Priorizamos futuros por encima de recientes sin resultado
      if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;

      return a.matchTime.getTime() - b.matchTime.getTime();
    });

  return currentMatches.length > 0
    ? currentMatches[0].match
    : EMPTY_MATCH;
};
