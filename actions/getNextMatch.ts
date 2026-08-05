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

  const now = new Date();

  const upcomingMatches = data
    .map((match) => ({ match, matchTime: parseArgentinaDateTime(match.datetime) }))
    .filter(({ match, matchTime }) => {
      const matchEndTime = new Date(matchTime.getTime() + 120 * 60 * 1000);

      return (
        !match.result &&
        (matchTime > now || (now >= matchTime && now <= matchEndTime))
      );
    })
    .sort((a, b) => a.matchTime.getTime() - b.matchTime.getTime());

  return upcomingMatches.length > 0
    ? upcomingMatches[0].match
    : EMPTY_MATCH;
};
