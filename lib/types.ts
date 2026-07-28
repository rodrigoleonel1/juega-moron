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
  temporada?: "TEMP25" | "TEMP26";
}
