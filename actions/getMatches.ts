import { Match } from "@/data/fixture";

export const getMatches = async (): Promise<Match[]> => {
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6fCbDDYrrzkc0z-w5J12AZ4pcA6HUAoSb-9AF4ETycvpCQozKe0DuQrvdr6BZcsqNrB1iuu6FOT_a/pub?output=tsv"
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch matches: ${res.statusText}`);
  }

  const data = await res.text();
  const matches = data
    .split("\n")
    .slice(1)
    .map((row) => {
      const [
        versus,
        isAway,
        id_escudoteca,
        id_prom,
        datetime,
        ficha_partido,
        ficha_rival,
        youtube,
        result,
        estadio,
      ] = row.split("\t");

      return {
        versus,
        isAway: isAway === "TRUE" ? true : false,
        id_escudoteca,
        id_prom,
        datetime,
        ficha_partido,
        ficha_rival,
        youtube,
        result,
        estadio,
      };
    });

  return matches;
};
