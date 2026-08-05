import { describe, it, expect } from "vitest";
import {
  parseArgentinaDateTime,
  getArgentinaDateKey,
} from "./argentina-date";

describe("parseArgentinaDateTime", () => {
  it("interpreta hora local argentina como UTC-3", () => {
    const date = parseArgentinaDateTime("2026-02-14 17:00:00");
    expect(date.toISOString()).toBe("2026-02-14T20:00:00.000Z");
  });

  it("respeta la fecha límite del día en Argentina", () => {
    const date = parseArgentinaDateTime("2026-08-08 21:00:00");
    expect(date.toISOString()).toBe("2026-08-09T00:00:00.000Z");
  });

  it("no aplica horario de verano (Argentina no usa DST)", () => {
    const date = parseArgentinaDateTime("2026-01-05 12:00:00");
    expect(date.toISOString()).toBe("2026-01-05T15:00:00.000Z");
  });

  it("no lanza error con un formato inválido", () => {
    expect(() => parseArgentinaDateTime("no es una fecha")).not.toThrow();
  });
});

describe("getArgentinaDateKey", () => {
  it("genera la clave con el día de Argentina", () => {
    const key = getArgentinaDateKey();
    expect(key).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
  });
});
