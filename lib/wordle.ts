import { Jugador } from "./types";
import { JUGADORES } from "./constants";

export { JUGADORES };

const APELLIDOS = JUGADORES.map((j) => j.apellido);

const LENGTH_COUNT = JUGADORES.reduce<Record<number, number>>((acc, j) => {
  acc[j.apellido.length] = (acc[j.apellido.length] || 0) + 1;
  return acc;
}, {});

const VALID_APELLIDOS = APELLIDOS.filter((a) => (LENGTH_COUNT[a.length] ?? 0) >= 6);

export function getDailyWord(): string {
  const start = new Date("2026-01-01");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return VALID_APELLIDOS[diff % VALID_APELLIDOS.length];
}

export function getJugador(apellido: string): Jugador | undefined {
  return JUGADORES.find(
    (j) => j.apellido === apellido
  );
}

export function isValidWord(word: string): boolean {
  return APELLIDOS.includes(word.toUpperCase());
}
