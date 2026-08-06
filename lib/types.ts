export interface ClubStats {
  partidos?: number;
  goles?: number;
  asistencias?: number;
  amarillas?: number;
  rojas?: number;
}

export interface Club {
  nombre: string;
  img_escudo?: string;
  desde?: string;
  hasta?: string;
  stats?: ClubStats;
}

export interface Jugador {
  nombre: string;
  apellido: string;
  clubes?: Club[];
  posicion?: string;
  posicionDetalle?: string;
  fechaNacimiento?: string;
  pais?: string;
  ciudad?: string;
  altura?: number;
  pie?: string;
  statsTotales?: ClubStats;
  statsTotalesMoron?: ClubStats;
}

export type Season = "TEMP25" | "TEMP26";

export type MatchResult = "G" | "E" | "P";

export interface Match {
  versus: string;
  estadio: string;
  isAway: boolean;
  id_prom: string;
  datetime: string;
  ficha_partido: string;
  ficha_rival: string;
  youtube?: string;
  result?: string;
  competencia: string;
  fecha: string;
  temporada?: Season;
}
