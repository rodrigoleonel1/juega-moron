import { afterEach, describe, it, expect, vi } from "vitest";
import { getMatches } from "@/actions/getMatches";

const TSV_HEADER =
  "versus\tisAway\tid_prom\tdatetime\tficha_partido\tficha_rival\tyoutube\tresult\testadio\tcompetencia\tfecha";

const TSV_ROW_LOCAL =
  "Deportivo Morón vs Colegiales\tFALSE\t123\t2026-08-08 17:00:00\t\t\thttps://youtu.be/abc\t\tFrancisco Urbano\tPrimera Nacional\t1";
const TSV_ROW_VISITA =
  "Talleres vs Deportivo Morón\tTRUE\t456\t2026-08-15 19:00:00\t\t\t\t\t\tPrimera Nacional\t2";

const okResponse = (body: string) =>
  new Response(body, { status: 200 });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getMatches", () => {
  it("parsea una sola hoja y le agrega la temporada", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse([TSV_HEADER, TSV_ROW_LOCAL].join("\n")));
    vi.stubGlobal("fetch", fetchMock);

    const matches = await getMatches("TEMP25");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("gid=805417991"),
      expect.objectContaining({ next: expect.any(Object) }),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      versus: "Deportivo Morón vs Colegiales",
      isAway: false,
      datetime: "2026-08-08 17:00:00",
      result: "",
      temporada: "TEMP25",
    });
  });

  it("lanza error si la hoja responde mal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("error", { status: 500 })),
    );

    await expect(getMatches("TEMP25")).rejects.toThrow("Failed to fetch TEMP25");
  });

  it("ignora la temporada que falla y devuelve las que responden bien", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          okResponse([TSV_HEADER, TSV_ROW_LOCAL].join("\n")),
        )
        .mockRejectedValueOnce(new Error("network down")),
    );

    const matches = await getMatches();

    expect(matches).toHaveLength(1);
    expect(matches[0].temporada).toBe("TEMP25");
  });

  it("unifica todas las temporadas", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(okResponse([TSV_HEADER, TSV_ROW_LOCAL].join("\n")))
        .mockResolvedValueOnce(okResponse([TSV_HEADER, TSV_ROW_VISITA].join("\n"))),
    );

    const matches = await getMatches();

    expect(matches).toHaveLength(2);
    expect(matches.map((m) => m.temporada).sort()).toEqual([
      "TEMP25",
      "TEMP26",
    ]);
  });
});
