import { Player } from "@/lib/types";

export const getPlantel = async (): Promise<Player[]> => {
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZR1t0ec_s29rlpfegjpAxwk53Pr8M4Vho_iXtJvA0xom5P3-dBvGeIFpQBep2Lfm1OSAGSdZpi3NP/pub?output=tsv",
    { next: { tags: ["players"] } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch plantel: ${res.statusText}`);
  }

  function calcularEdad(fechaNacimientoStr: string): string {
    const [diaStr, mesStr, anioStr] = fechaNacimientoStr.split("/");
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10) - 1; // Mes en JS es 0-indexado (0 = enero)
    const anio = parseInt(anioStr, 10);

    const fechaNacimiento = new Date(anio, mes, dia);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();

    if (
      mesActual < fechaNacimiento.getMonth() ||
      (mesActual === fechaNacimiento.getMonth() &&
        diaActual < fechaNacimiento.getDate())
    ) {
      edad--;
    }

    return edad.toString();
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
        edad: calcularEdad(edad),
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
