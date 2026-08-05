import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import type { Match } from "@/lib/types";

vi.mock("@/actions/getMatches", () => ({
  getMatches: vi.fn(),
}));

import { getMatches } from "@/actions/getMatches";
import { getNextMatch } from "@/actions/getNextMatch";
import { EMPTY_MATCH } from "@/lib/constants";

const now = new Date("2026-08-08T10:00:00.000Z");

const match = (overrides: Partial<Match> = {}): Match => ({
  versus: "Colegiales",
  estadio: "Francisco Urbano",
  isAway: false,
  id_prom: "1",
  datetime: "2026-08-08 17:00:00",
  ficha_partido: "",
  ficha_rival: "",
  youtube: "",
  result: "",
  competencia: "Primera Nacional",
  fecha: "1",
  ...overrides,
});

const mockGetMatches = vi.mocked(getMatches);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("getNextMatch", () => {
  it("devuelve el partido más próximo sin resultado", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", datetime: "2026-08-20 20:00:00" }),
      match({ versus: "Colegiales", datetime: "2026-08-08 17:00:00" }),
    ]);

    const next = await getNextMatch();

    expect(next.versus).toBe("Colegiales");
  });

  it("ignora partidos ya jugados (con resultado)", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", result: "2-1" }),
      match({ versus: "Colegiales", datetime: "2026-08-08 17:00:00" }),
    ]);

    const next = await getNextMatch();

    expect(next.versus).toBe("Colegiales");
  });

  it("considera como próximo el partido en curso (dentro de las 2 horas)", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", datetime: "2026-08-08 10:30:00" }),
    ]);

    const next = await getNextMatch();

    expect(next.versus).toBe("Almagro");
  });

  it("no considera un partido que ya terminó hace más de 2 horas", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", datetime: "2026-08-08 04:00:00" }),
    ]);

    const next = await getNextMatch();

    expect(next.versus).toBe("");
  });

  it("devuelve EMPTY_MATCH si no hay próximos partidos", async () => {
    mockGetMatches.mockResolvedValue([match({ result: "2-1" })]);

    const next = await getNextMatch();

    expect(next).toEqual(EMPTY_MATCH);
  });

  it("devuelve EMPTY_MATCH si getMatches falla", async () => {
    mockGetMatches.mockRejectedValue(new Error("boom"));

    const next = await getNextMatch();

    expect(next).toEqual(EMPTY_MATCH);
  });
});
