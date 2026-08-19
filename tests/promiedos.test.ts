import { afterEach, describe, it, expect, vi } from "vitest";
import {
  extractNextDataJson,
  findMoronGames,
  getGameStatus,
  getLeagueUrl,
  getLiveMatch,
  normalizeGame,
  parsePromiedosStartTime,
} from "@/lib/promiedos";

type GameFixture = {
  id: string;
  teams: { id: string; name?: string }[];
  scores?: [number, number];
  status: { enum?: number; name?: string; short_name?: string };
  start_time: string;
  game_time?: number;
  game_time_status_to_display?: string;
};

const nextDataGame = (overrides: Partial<GameFixture> = {}): GameFixture => ({
  id: "egeeaae",
  teams: [
    { id: "hbba", name: "Deportivo Morón" },
    { id: "hbbi", name: "Acassuso" },
  ],
  scores: [4, 1],
  status: { enum: 3, name: "Finalizado", short_name: "Final" },
  start_time: "09-08-2026 15:00",
  ...overrides,
});

const buildNextDataHtml = (games: unknown[]) => {
  const payload = {
    props: {
      pageProps: {
        data: {
          games: {
            filters: [{ name: "Fecha 24", key: "419_46_1_24", games }],
          },
        },
      },
    },
  };

  return `<!doctype html><html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    payload,
  )}</script></body></html>`;
};

const okResponse = (body: string) =>
  new Response(body, { status: 200 });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getLeagueUrl", () => {
  it("mapea competencias conocidas a su URL de promiedos", () => {
    expect(getLeagueUrl("Primera Nacional")).toContain(
      "/league/primera-nacional/ebj",
    );
    expect(getLeagueUrl("Copa Argentina")).toContain(
      "/league/copa-argentina/gea",
    );
  });

  it("es case-insensitive y tolera espacios", () => {
    expect(getLeagueUrl("  primera NACIONAL ")).toContain(
      "/league/primera-nacional/ebj",
    );
  });

  it("devuelve undefined para competencias desconocidas", () => {
    expect(getLeagueUrl("Copa Desconocida")).toBeUndefined();
  });
});

describe("extractNextDataJson", () => {
  it("extrae y parsea el JSON embebido", () => {
    const html = buildNextDataHtml([nextDataGame()]);
    const data = extractNextDataJson(html) as {
      props: { pageProps: { data: unknown } };
    };

    expect(data.props.pageProps.data).toBeDefined();
  });

  it("devuelve null si no hay __NEXT_DATA__", () => {
    expect(extractNextDataJson("<html><body>nada</body></html>")).toBeNull();
  });

  it("devuelve null si el JSON está corrupto", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{corrupto</script>`;
    expect(extractNextDataJson(html)).toBeNull();
  });
});

describe("findMoronGames", () => {
  it("encuentra los partidos donde Morón participa", () => {
    const html = buildNextDataHtml([nextDataGame(), nextDataGame({ id: "otro" })]);
    const data = extractNextDataJson(html);

    expect(findMoronGames(data)).toHaveLength(2);
  });

  it("devuelve [] si no hay partidos de Morón", () => {
    const game = nextDataGame();
    game.teams[1] = { ...game.teams[1], id: "hbbi" };
    const html = buildNextDataHtml([game]);
    const data = extractNextDataJson(html);

    expect(findMoronGames(data)).toHaveLength(1);
  });
});

describe("parsePromiedosStartTime", () => {
  it("parsea el formato DD-MM-YYYY HH:MM como hora Argentina", () => {
    const date = parsePromiedosStartTime("09-08-2026 15:00");

    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(7);
    expect(date.getUTCDate()).toBe(9);
  });
});

describe("getGameStatus", () => {
  it("reconoce finalizado (enum 3)", () => {
    expect(getGameStatus(nextDataGame())).toBe("finalizado");
  });

  it("reconoce finalizado por nombre", () => {
    const game = nextDataGame({ status: { enum: 9, name: "Finalizado" } });
    expect(getGameStatus(game)).toBe("finalizado");
  });

  it("reconoce en vivo", () => {
    const game = nextDataGame({
      status: { enum: 1, name: "En Vivo", short_name: "2T" },
    });
    expect(getGameStatus(game)).toBe("en vivo");
  });

  it("reconoce próximamente sin scores ni start", () => {
    const game = nextDataGame({
      scores: undefined,
      status: { enum: 0, name: "Programado" },
      start_time: "2026-08-25 20:00",
    });
    expect(getGameStatus(game)).toBe("próximamente");
  });
});

describe("normalizeGame", () => {
  it("ordena el marcador con Morón primero (local)", () => {
    const live = normalizeGame(nextDataGame())!;

    expect(live.score).toEqual([4, 1]);
    expect(live.status).toBe("finalizado");
    expect(live.opponentName).toBe("Acassuso");
    expect(live.opponentId).toBe("hbbi");
  });

  it("ordena el marcador con Morón primero (visitante)", () => {
    const game = nextDataGame();
    // invertimos local/visitante: Morón pasa a teams[1] y scores se acomodan
    game.teams = [game.teams[1], game.teams[0]];
    game.scores = [2, 3];

    const live = normalizeGame(game)!;

    expect(live.score).toEqual([3, 2]);
  });

  it("devuelve score null si no hay scores", () => {
    const game = nextDataGame({ scores: undefined });
    const live = normalizeGame(game)!;

    expect(live.score).toBeNull();
  });

  it("incluye el minuto en vivo desde game_time", () => {
    const game = nextDataGame({
      status: { enum: 1, name: "En Vivo", short_name: "2T" },
      game_time: 67,
      game_time_status_to_display: "67'",
    });
    const live = normalizeGame(game)!;

    expect(live.status).toBe("en vivo");
    expect(live.minute).toBe("67'");
  });

  it("no incluye minuto si el partido finalizó", () => {
    const live = normalizeGame(nextDataGame())!;

    expect(live.status).toBe("finalizado");
    expect(live.minute).toBeUndefined();
  });
});

describe("getLiveMatch", () => {
  it("consulta promiedos y devuelve el partido de Morón", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse(buildNextDataHtml([nextDataGame()])));
    vi.stubGlobal("fetch", fetchMock);

    const live = await getLiveMatch({ competencia: "Primera Nacional" });

    expect(live?.score).toEqual([4, 1]);
    expect(live?.status).toBe("finalizado");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/league/primera-nacional/ebj"),
      expect.anything(),
    );
  });

  it("filtra por rival si se pasa id_prom", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse(
        buildNextDataHtml([nextDataGame(), nextDataGame({ id: "otro" })]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const live = await getLiveMatch({
      competencia: "Primera Nacional",
      opponentId: "hbbi",
    });

    expect(live?.opponentId).toBe("hbbi");
  });

  it("devuelve null si la competencia es desconocida", async () => {
    const live = await getLiveMatch({ competencia: "Copa Desconocida" });

    expect(live).toBeNull();
  });

  it("devuelve null si promiedos responde mal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("error", { status: 500 })),
    );

    const live = await getLiveMatch({ competencia: "Primera Nacional" });

    expect(live).toBeNull();
  });

  it("devuelve null si la red falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    const live = await getLiveMatch({ competencia: "Primera Nacional" });

    expect(live).toBeNull();
  });
});
