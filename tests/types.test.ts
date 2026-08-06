import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import { MatchResult, Season } from "@/lib/types";
import { getResultOutcome, isSeason, RESULT_OUTCOME_CLASS } from "@/lib/utils";

describe("tipos avanzados", () => {
  it("Season es una union de temporadas", () => {
    expectTypeOf<Season>().toEqualTypeOf<"TEMP25" | "TEMP26">();
  });

  it("MatchResult es una union de resultados", () => {
    expectTypeOf<MatchResult>().toEqualTypeOf<"G" | "E" | "P">();
  });

  it("template literal con Season genera tags de revalidacion tipados", () => {
    type SeasonTag = `season-${Season}`;
    expectTypeOf<SeasonTag>().toEqualTypeOf<
      "season-TEMP25" | "season-TEMP26"
    >();
  });

  it("isSeason actua como type guard", () => {
    const raw: string = "TEMP26";

    if (isSeason(raw)) {
      expectTypeOf(raw).toEqualTypeOf<Season>();
    }

    expect(isSeason("TEMP25")).toBe(true);
    expect(isSeason("TEMP26")).toBe(true);
    expect(isSeason("TEMP27")).toBe(false);
    expect(isSeason("")).toBe(false);
  });

  it("getResultOutcome devuelve MatchResult | null y no any", () => {
    expectTypeOf<ReturnType<typeof getResultOutcome>>().toEqualTypeOf<
      MatchResult | null
    >();

    expect(getResultOutcome("2-1 (G)")).toBe("G");
    expect(getResultOutcome("0-1 (P)")).toBe("P");
    expect(getResultOutcome("1-1 (E)")).toBe("E");
    expect(getResultOutcome("")).toBeNull();
    expect(getResultOutcome(undefined)).toBeNull();
    expect(getResultOutcome("4-0")).toBeNull();
  });

  it("RESULT_OUTCOME_CLASS cubre todas las claves de MatchResult", () => {
    expectTypeOf<keyof typeof RESULT_OUTCOME_CLASS>().toEqualTypeOf<MatchResult>();
    expect(Object.keys(RESULT_OUTCOME_CLASS).sort()).toEqual(["E", "G", "P"]);
  });
});
