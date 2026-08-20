import { afterEach, describe, it, expect, vi } from "vitest";
import {
  extractLiveGamesByTeam,
  extractMatchActivity,
  extractNextDataJson,
  extractStandings,
  findMoronGames,
  getGameStatus,
  getLeagueUrl,
  getLiveMatch,
  getStandings,
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

const buildStandingsHtml = () => {
  const payload = {
    props: {
      pageProps: {
        data: {
          tables_groups: [
            {
              name: "Fase de grupos",
              tables: [
                {
                  name: "Zona A",
                  table: {
                    rows: [
                      {
                        num: 1,
                        values: [
                          { key: "Points", value: 49 },
                          { key: "GamePlayed", value: 25 },
                          { key: "Goals", value: "38:18" },
                          { key: "Ratio", value: 20 },
                          { key: "GamesWon", value: 15 },
                          { key: "GamesEven", value: 4 },
                          { key: "GamesLost", value: 6 },
                          { key: "{trend}", value: [1, 1, 0, 0, 1] },
                        ],
                        entity: {
                          object: {
                            id: "abcde",
                            name: "Ferro Carril Oeste",
                            short_name: "Ferro",
                          },
                        },
                        destination: "Final",
                        destination_color: "#03A9F4",
                      },
                      {
                        num: 2,
                        values: [
                          { key: "Points", value: 44 },
                          { key: "GamePlayed", value: 24 },
                          { key: "Goals", value: "30:20" },
                          { key: "Ratio", value: 10 },
                          { key: "GamesWon", value: 13 },
                          { key: "GamesEven", value: 5 },
                          { key: "GamesLost", value: 6 },
                          { key: "{trend}", value: [1, 1, 0, 1, 2] },
                        ],
                        entity: {
                          object: {
                            id: "hbba",
                            name: "Deportivo Morón",
                            short_name: "Morón",
                          },
                        },
                        destination: "Playoffs",
                        destination_color: "#AB2CF5",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  };

  return `<!doctype html><html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    payload,
  )}</script></body></html>`;
};

const standingsData = () => {
  const html = buildStandingsHtml();
  return extractNextDataJson(html);
};

describe("extractStandings", () => {
  it("extrae zonas, filas y valores correctamente", () => {
    const standings = extractStandings(standingsData());

    expect(standings).not.toBeNull();
    expect(standings!.zones).toHaveLength(1);
    expect(standings!.zones[0].name).toBe("Zona A");

    const ferro = standings!.zones[0].rows[0];
    expect(ferro.rank).toBe(1);
    expect(ferro.name).toBe("Ferro Carril Oeste");
    expect(ferro.points).toBe(49);
    expect(ferro.played).toBe(25);
    expect(ferro.won).toBe(15);
    expect(ferro.drawn).toBe(4);
    expect(ferro.lost).toBe(6);
    expect(ferro.goalsFor).toBe(38);
    expect(ferro.goalsAgainst).toBe(18);
    expect(ferro.goalDifference).toBe(20);
    expect(ferro.destination).toBe("Final");
    expect(ferro.destinationColor).toBe("#03A9F4");
    expect(ferro.isMoron).toBe(false);
    expect(ferro.trend).toEqual(["G", "G", "E", "E", "G"]);
  });

  it("marca a Morón por su id", () => {
    const standings = extractStandings(standingsData());

    expect(standings!.zones[0].rows[1].isMoron).toBe(true);
  });

  it("devuelve null si no hay tables_groups", () => {
    expect(extractStandings(null)).toBeNull();
    expect(extractStandings({})).toBeNull();
  });
});

describe("extractLiveGamesByTeam", () => {
  it("arma el mapa de equipos en vivo con sus marcadores", () => {
    const liveGame = nextDataGame({
      id: "live1",
      teams: [
        { id: "abcde", name: "Ferro Carril Oeste" },
        { id: "efghi", name: "Almirante Brown" },
      ],
      scores: [2, 1],
      status: { enum: 1, name: "En Vivo", short_name: "2T" },
    });
    const html = buildNextDataHtml([liveGame]);
    const data = extractNextDataJson(html);

    const map = extractLiveGamesByTeam(data);

    expect(map.get("abcde")).toEqual({ score: 2, rivalScore: 1 });
    expect(map.get("efghi")).toEqual({ score: 1, rivalScore: 2 });
  });

  it("ignora partidos finalizados y programados", () => {
    const html = buildNextDataHtml([nextDataGame()]);
    const data = extractNextDataJson(html);

    expect(extractLiveGamesByTeam(data).size).toBe(0);
  });

  it("devuelve mapa vacío si no hay datos", () => {
    expect(extractLiveGamesByTeam(null).size).toBe(0);
  });
});

describe("getStandings", () => {
  it("consulta promiedos y devuelve standings y mapa en vivo", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse(buildStandingsHtml()));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getStandings({ competencia: "Primera Nacional" });

    expect(result).not.toBeNull();
    expect(result!.standings).not.toBeNull();
    expect(result!.standings!.zones).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/league/primera-nacional/ebj"),
      expect.anything(),
    );
  });

  it("devuelve null si la competencia es desconocida", async () => {
    const result = await getStandings({ competencia: "Copa Desconocida" });

    expect(result).toBeNull();
  });

  it("devuelve null si promiedos responde mal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("error", { status: 500 })),
    );

    const result = await getStandings({ competencia: "Primera Nacional" });

    expect(result).toBeNull();
  });
});

const futureStart = (hoursFromNow: number) => {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
};

describe("extractMatchActivity", () => {
  it("detecta un partido en vivo", () => {
    const game = nextDataGame({
      status: { enum: 1, name: "En Vivo", short_name: "2T" },
      scores: [1, 0],
    });
    const html = buildNextDataHtml([game]);
    const data = extractNextDataJson(html);

    const activity = extractMatchActivity(data);

    expect(activity.hasLive).toBe(true);
    expect(activity.nextStartAt).toBeNull();
  });

  it("devuelve el próximo inicio dentro de la ventana", () => {
    const game = nextDataGame({
      scores: undefined,
      status: { enum: 0, name: "Programado" },
      start_time: futureStart(5),
    });
    const html = buildNextDataHtml([game]);
    const data = extractNextDataJson(html);

    const activity = extractMatchActivity(data);

    expect(activity.hasLive).toBe(false);
    expect(activity.nextStartAt).not.toBeNull();
    expect(activity.nextStartAt!).toBeGreaterThan(Date.now());
  });

  it("devuelve el más cercano cuando hay varios próximos", () => {
    const far = nextDataGame({
      id: "far",
      scores: undefined,
      status: { enum: 0, name: "Programado" },
      start_time: futureStart(50),
    });
    const near = nextDataGame({
      id: "near",
      scores: undefined,
      status: { enum: 0, name: "Programado" },
      start_time: futureStart(3),
    });
    const html = buildNextDataHtml([far, near]);
    const data = extractNextDataJson(html);

    const activity = extractMatchActivity(data);

    expect(activity.nextStartAt).toBeLessThanOrEqual(
      parsePromiedosStartTime(futureStart(3)).getTime(),
    );
  });

  it("devuelve null cuando la ronda terminó", () => {
    const html = buildNextDataHtml([nextDataGame()]);
    const data = extractNextDataJson(html);

    const activity = extractMatchActivity(data);

    expect(activity.hasLive).toBe(false);
    expect(activity.nextStartAt).toBeNull();
  });

  it("devuelve estado vacío sin datos", () => {
    expect(extractMatchActivity(null)).toEqual({ hasLive: false, nextStartAt: null });
  });
});
