import { afterEach, describe, it, expect, vi } from "vitest";
import type { Match } from "@/lib/types";

vi.mock("@/actions/getMatches", () => ({
  getMatches: vi.fn(),
}));

import { getMatches } from "@/actions/getMatches";
import { getRecentMatches } from "@/actions/getRecentMatches";
import { EMPTY_MATCH } from "@/lib/constants";

const match = (overrides: Partial<Match> = {}): Match => ({
  versus: "Colegiales",
  estadio: "Francisco Urbano",
  isAway: false,
  id_prom: "1",
  datetime: "2026-08-01 17:00:00",
  ficha_partido: "",
  ficha_rival: "",
  youtube: "",
  result: "2-1",
  competencia: "Primera Nacional",
  fecha: "1",
  ...overrides,
});

const mockGetMatches = vi.mocked(getMatches);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getRecentMatches", () => {
  it("devuelve los últimos partidos jugados ordenados de más reciente a más viejo", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", datetime: "2026-07-20 20:00:00", result: "0-0" }),
      match({ versus: "Atlanta", datetime: "2026-08-01 17:00:00", result: "2-1" }),
      match({ versus: "Colegiales", datetime: "2026-07-25 17:00:00", result: "3-0" }),
    ]);

    const recent = await getRecentMatches(5);

    expect(recent?.map((m) => m.versus)).toEqual(["Atlanta", "Colegiales", "Almagro"]);
  });

  it("filtra los partidos sin resultado", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", result: "0-0" }),
      match({ versus: "Atlanta", result: "" }),
      match({ versus: "Colegiales", result: undefined }),
    ]);

    const recent = await getRecentMatches();

    expect(recent).toHaveLength(1);
    expect(recent?.[0].versus).toBe("Almagro");
  });

  it("respeta el límite", async () => {
    mockGetMatches.mockResolvedValue([
      match({ versus: "Almagro", result: "0-0" }),
      match({ versus: "Atlanta", result: "1-0" }),
      match({ versus: "Colegiales", result: "3-0" }),
    ]);

    const recent = await getRecentMatches(2);

    expect(recent).toHaveLength(2);
  });

  it("devuelve matches vacíos si getMatches falla", async () => {
    mockGetMatches.mockRejectedValue(new Error("boom"));

    const recent = await getRecentMatches(3);

    expect(recent).toHaveLength(3);
    expect(recent?.[0]).toEqual(EMPTY_MATCH);
  });
});
