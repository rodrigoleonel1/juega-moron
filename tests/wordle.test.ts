import { describe, it, expect } from "vitest";
import { isValidWord, getDailyIndex } from "@/lib/wordle";
import { EMPTY_STATS, recordResult, winPercentage } from "@/lib/wordle-stats";

describe("isValidWord", () => {
  it("acepta un apellido existente sin importar mayúsculas", () => {
    expect(isValidWord("vitale")).toBe(true);
  });

  it("rechaza una palabra que no es un apellido", () => {
    expect(isValidWord("ZZZZZ")).toBe(false);
  });
});

describe("getDailyIndex", () => {
  it("devuelve un índice numérico no negativo", () => {
    const index = getDailyIndex();
    expect(Number.isInteger(index)).toBe(true);
    expect(index).toBeGreaterThanOrEqual(0);
  });
});

describe("recordResult", () => {
  it("cuenta una partida ganada con su distribución", () => {
    const next = recordResult(EMPTY_STATS, true, 3, "2026-8-5");

    expect(next.played).toBe(1);
    expect(next.won).toBe(1);
    expect(next.currentStreak).toBe(1);
    expect(next.maxStreak).toBe(1);
    expect(next.guessDistribution[3]).toBe(1);
  });

  it("reinicia la racha al perder", () => {
    const won = recordResult(EMPTY_STATS, true, 2, "2026-8-5");
    const lost = recordResult(won, false, 6, "2026-8-6");

    expect(lost.currentStreak).toBe(0);
    expect(lost.maxStreak).toBe(1);
    expect(lost.played).toBe(2);
  });

  it("no cuenta dos veces el mismo día", () => {
    const once = recordResult(EMPTY_STATS, true, 4, "2026-8-5");
    const twice = recordResult(once, true, 4, "2026-8-5");

    expect(twice.played).toBe(1);
  });
});

describe("winPercentage", () => {
  it("devuelve 0 si no se jugó", () => {
    expect(winPercentage(EMPTY_STATS)).toBe(0);
  });

  it("calcula el porcentaje redondeado", () => {
    const stats = recordResult(recordResult(EMPTY_STATS, true, 3, "a"), true, 2, "b");
    expect(winPercentage(stats)).toBe(100);
  });
});
