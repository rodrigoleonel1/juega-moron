import { Jugador } from "./types";
import { JUGADORES } from "./constants";
import { getArgentinaDate } from "./argentina-date";

export { JUGADORES };

const APELLIDOS = JUGADORES.map((j) => j.apellido);

export function normalizeWord(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, (mark) => (mark === "\u0303" ? mark : ""))
    .normalize("NFC")
    .toUpperCase();
}

const NORMALIZED_APELLIDOS = new Set(APELLIDOS.map(normalizeWord));

const LENGTH_COUNT = JUGADORES.reduce<Record<number, number>>((acc, j) => {
  acc[j.apellido.length] = (acc[j.apellido.length] || 0) + 1;
  return acc;
}, {});

const VALID_APELLIDOS = APELLIDOS.filter((a) => (LENGTH_COUNT[a.length] ?? 0) >= 6);

export function getDailyIndex(): number {
  const start = new Date("2026-01-01");
  const today = getArgentinaDate();
  return Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function getDailyWord(): string {
  return VALID_APELLIDOS[getDailyIndex() % VALID_APELLIDOS.length];
}

export function getJugador(apellido: string): Jugador | undefined {
  const normalized = normalizeWord(apellido);
  return JUGADORES.find((j) => normalizeWord(j.apellido) === normalized);
}

export function isValidWord(word: string): boolean {
  return NORMALIZED_APELLIDOS.has(normalizeWord(word));
}
