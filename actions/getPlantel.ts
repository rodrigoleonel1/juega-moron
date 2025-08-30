import { Player } from "@/lib/types";

export const getPlantel = async (): Promise<Player[]> => {
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZR1t0ec_s29rlpfegjpAxwk53Pr8M4Vho_iXtJvA0xom5P3-dBvGeIFpQBep2Lfm1OSAGSdZpi3NP/pub?output=tsv",
    { next: { tags: ["players"] } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch plantel: ${res.statusText}`);
  }

  const data = await res.text();
  const plantel = data
    .split("\n")
    .slice(1)
    .map((row) => {
      const [
        nombre,
        posicion,
        edad,
        partidos,
        goles,
        asistencias,
        goles_concedidos,
        valla_invicta,
        amarillas,
        rojas,
      ] = row.split("\t");

      return {
        nombre,
        posicion,
        edad,
        partidos,
        goles,
        asistencias,
        goles_concedidos,
        valla_invicta,
        amarillas,
        rojas,
      };
    });

  return plantel;
};
