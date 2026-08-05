import { Match } from "@/lib/types";

const BASE_URL = process.env.SHEETS_BASE_URL;

if (!BASE_URL) {
  throw new Error("Falta SHEETS_BASE_URL en el entorno");
}

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
  // 🔹 Caso 1: una sola hoja
  if (sheet) {
    const res = await fetch(`${BASE_URL}?gid=${SHEETS[sheet]}&output=tsv`, {
      next: { tags: ["matches", `season-${sheet}`] },
    });

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
  const results = await Promise.allSettled(
    Object.entries(SHEETS).map(async ([sheet, gid]) => {
      const res = await fetch(`${BASE_URL}?gid=${gid}&output=tsv`, {
        next: { tags: ["matches", `season-${sheet}`] },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch sheet");
      }

      const text = await res.text();

      return parseTSV(text).map((match) => ({
        ...match,
        temporada: sheet as SheetType,
      }));
    }),
  );

  // 🔥 Unificamos solo las hojas que respondieron bien
  return results.flatMap((result) => {
    if (result.status === "rejected") {
      console.error("Error al obtener una temporada:", result.reason);
      return [];
    }

    return result.value;
  });
};
