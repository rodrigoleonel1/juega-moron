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
}

export interface Player {
  nombre: string;
  posicion: string;
  edad: string;
  partidos: string;
  goles: string;
  asistencias: string;
  goles_concedidos: string;
  valla_invicta: string;
  amarillas: string;
  rojas: string;
}
