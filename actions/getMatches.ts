import { Match } from "@/lib/types";

const BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6fCbDDYrrzkc0z-w5J12AZ4pcA6HUAoSb-9AF4ETycvpCQozKe0DuQrvdr6BZcsqNrB1iuu6FOT_a/pub";

type SheetType = "TEMP25" | "TEMP26";

const SHEETS: Record<SheetType, string> = {
  TEMP25: "805417991",
  TEMP26: "760899196",
};

const parseTSV = (data: string): Match[] => {
  return data
    .split("\n")
    .slice(1)
    .map((row) => {
      const [
        versus,
        isAway,
        id_prom,
        datetime,
        ficha_partido,
        ficha_rival,
        youtube,
        result,
        estadio,
        competencia,
        fecha,
      ] = row.split("\t");

      return {
        versus,
        isAway: isAway === "TRUE",
        id_prom,
        datetime,
        ficha_partido,
        ficha_rival,
        youtube,
        result,
        estadio,
        competencia,
        fecha,
      };
    });
};

export const getMatches = async (sheet?: SheetType): Promise<Match[]> => {
  try {
    // 🔹 Caso 1: una sola hoja
    if (sheet) {
      const res = await fetch(
        `${BASE_URL}?gid=${SHEETS[sheet]}&output=tsv`,
        {
          next: { tags: ["matches"] },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch ${sheet}`);
      }

      const text = await res.text();

      return parseTSV(text).map((match) => ({
        ...match,
        temporada: sheet,
      }));
    }

    // 🔹 Caso 2: todas las hojas
    const results = await Promise.all(
      Object.entries(SHEETS).map(async ([sheet, gid]) => {
        const res = await fetch(
          `${BASE_URL}?gid=${gid}&output=tsv`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch sheet");
        }

        const text = await res.text();

        return parseTSV(text).map((match) => ({
          ...match,
          temporada: sheet as SheetType,
        }));
      })
    );

    // 🔥 Unificamos todo en un solo array
    return results.flat();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};