import { Match } from "@/lib/types";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import { EMPTY_MATCH } from "@/lib/constants";
import { getMatches } from "./getMatches";

export const getNextMatch = async (): Promise<Match> => {
  let data: Match[];

  try {
    data = await getMatches();
  } catch (error) {
    console.error("Error al obtener el próximo partido:", error);
    return EMPTY_MATCH;
  }

  const sorted = data
    .map((match) => ({
      match,
      matchTime: parseArgentinaDateTime(match.datetime).getTime(),
    }))
    .sort((a, b) => a.matchTime - b.matchTime);

  for (const { match } of sorted) {
    if (!match.result) {
      return match;
    }
  }

  return EMPTY_MATCH;
};
