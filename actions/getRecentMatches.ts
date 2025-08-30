import { Match } from "@/lib/types";
import { getMatches } from "./getMatches";

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

    return Array(limit).fill({
      versus: "",
      estadio: "",
      isAway: false,
      id_escudoteca: "",
      id_prom: "",
      datetime: "",
      ficha_partido: "",
      ficha_rival: "",
      youtube: "",
      result: "",
    });
  }
};
