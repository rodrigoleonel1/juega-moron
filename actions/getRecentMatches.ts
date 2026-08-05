import { Match } from "@/lib/types";
import { getMatches } from "./getMatches";
import { EMPTY_MATCH } from "@/lib/constants";

export const getRecentMatches = async (limit = 5): Promise<Match[] | null> => {
  try {
    const data = await getMatches();

    const playedMatches = data.filter(
      (match) => match.result && match.result.trim() !== ""
    );

    const sortedMatches = playedMatches.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    return sortedMatches.slice(0, limit);
  } catch (error) {
    console.error("Error al obtener partidos recientes:", error);

    return Array.from({ length: limit }, () => EMPTY_MATCH);
  }
};
