import { Match } from "@/lib/types";
import { getMatches } from "./getMatches";

export const getNextMatch = async (): Promise<Match> => {
  const data = await getMatches();

  const now = new Date();

  const upcomingMatches = data
    .filter((match) => {
      const matchTime = new Date(match.datetime);
      const matchEndTime = new Date(matchTime.getTime() + 120 * 60 * 1000);

      return (
        !match.result &&
        (matchTime > now || (now >= matchTime && now <= matchEndTime))
      );
    })

    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

  return upcomingMatches.length > 0
    ? upcomingMatches[0]
    : {
        versus: "",
        estadio: "",
        isAway: false,
        id_prom: "",
        datetime: "",
        ficha_partido: "",
        ficha_rival: "",
        youtube: "",
        result: "",
        competencia: "",
        fecha: "",
      };
};
