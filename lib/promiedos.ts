import { parseArgentinaDateTime } from "@/lib/argentina-date";
import { MORON_TEAM_ID } from "@/lib/constants";

export type MatchLiveStatus = "próximamente" | "en vivo" | "finalizado";

export interface LiveMatch {
  status: MatchLiveStatus;
  score: [number, number] | null;
  startTime: Date;
  matchId: string;
  opponentId: string;
  opponentName: string;
  minute?: string;
}

const LEAGUE_URLS: Record<string, string> = {
  "primera nacional": "https://www.promiedos.com.ar/league/primera-nacional/ebj",
  "copa argentina": "https://www.promiedos.com.ar/league/copa-argentina/gea",
};

const LIVE_HINTS = [
  "en vivo",
  "en juego",
  "primer tiempo",
  "segundo tiempo",
  "entretiempo",
  "suplementario",
];

export function getLeagueUrl(competencia: string): string | undefined {
  return LEAGUE_URLS[competencia.trim().toLowerCase()];
}

export function extractNextDataJson(html: string): unknown {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);

  if (start === -1) return null;

  const jsonStart = start + marker.length;
  const end = html.indexOf("</script>", jsonStart);

  if (end === -1) return null;

  try {
    return JSON.parse(html.slice(jsonStart, end));
  } catch {
    return null;
  }
}

export function findMoronGames(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];

  const pageProps = (data as { props?: { pageProps?: unknown } })?.props?.pageProps;
  if (!pageProps || typeof pageProps !== "object") return [];

  const dataNode = (pageProps as { data?: unknown })?.data;
  if (!dataNode || typeof dataNode !== "object") return [];

  const games = (dataNode as { games?: { filters?: unknown[] } })?.games?.filters;
  if (!Array.isArray(games)) return [];

  const matches: unknown[] = [];

  for (const filter of games) {
    if (!filter || typeof filter !== "object") continue;

    const roundGames = (filter as { games?: unknown[] })?.games;
    if (!Array.isArray(roundGames)) continue;

    for (const game of roundGames) {
      const teams = (game as { teams?: unknown[] } | undefined)?.teams;
      if (
        Array.isArray(teams) &&
        teams.some(
          (team) => (team as { id?: string } | undefined)?.id === MORON_TEAM_ID,
        )
      ) {
        matches.push(game);
      }
    }
  }

  return matches;
}

export function parsePromiedosStartTime(value: string): Date {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);

  if (!match) return new Date(NaN);

  const [, day, month, year, hour, minute] = match;

  return parseArgentinaDateTime(
    `${year}-${month}-${day} ${hour}:${minute}:00`,
  );
}

interface PromiedosTeam {
  id?: string;
  name?: string;
}

interface PromiedosGame {
  id?: string;
  start_time?: string;
  scores?: [number, number];
  status?: {
    enum?: number;
    name?: string;
    short_name?: string;
  };
  teams?: PromiedosTeam[];
  game_time?: number;
  game_time_status_to_display?: string;
}

export function getGameStatus(game: PromiedosGame): MatchLiveStatus {
  const status = game.status ?? {};
  const enumValue = status.enum;
  const name = String(status.name ?? "").toLowerCase();
  const shortName = String(status.short_name ?? "").toLowerCase();

  if (
    enumValue === 3 ||
    name.includes("final") ||
    shortName.includes("final")
  ) {
    return "finalizado";
  }

  if (LIVE_HINTS.some((hint) => name.includes(hint) || shortName.includes(hint))) {
    return "en vivo";
  }

  const startTime = parsePromiedosStartTime(String(game.start_time ?? ""));

  if (startTime.getTime() <= Date.now() && Array.isArray(game.scores)) {
    return "en vivo";
  }

  return "próximamente";
}

export function normalizeGame(game: PromiedosGame): LiveMatch | null {
  const teams = game.teams;
  if (!Array.isArray(teams) || teams.length < 2) return null;

  const moronIndex = teams.findIndex((team) => team.id === MORON_TEAM_ID);
  if (moronIndex === -1) return null;

  const rivalIndex = moronIndex === 0 ? 1 : 0;
  const rival = teams[rivalIndex];

  const scores = Array.isArray(game.scores) ? game.scores : null;
  let score: [number, number] | null = null;

  if (scores) {
    // scores = [local, visitante]; teams[0] = local, teams[1] = visitante
    const moronScore = moronIndex === 0 ? scores[0] : scores[1];
    const rivalScore = moronIndex === 0 ? scores[1] : scores[0];

    score = [moronScore, rivalScore];
  }

  const status = getGameStatus(game);
  let minute: string | undefined;

  if (status === "en vivo") {
    minute =
      game.game_time_status_to_display && !/final/i.test(game.game_time_status_to_display)
        ? game.game_time_status_to_display
        : typeof game.game_time === "number"
          ? `${game.game_time}'`
          : undefined;
  }

  return {
    status,
    score,
    startTime: parsePromiedosStartTime(String(game.start_time ?? "")),
    matchId: String(game.id ?? ""),
    opponentId: String(rival.id ?? ""),
    opponentName: String(rival.name ?? ""),
    minute,
  };
}

function statusRank(status: MatchLiveStatus): number {
  if (status === "en vivo") return 3;
  if (status === "próximamente") return 2;
  return 1;
}

export async function getLiveMatch(options: {
  competencia: string;
  opponentId?: string;
}): Promise<LiveMatch | null> {
  const url = getLeagueUrl(options.competencia);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      next: { revalidate: 15 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const data = extractNextDataJson(html);
    let games = findMoronGames(data);

    if (options.opponentId) {
      const filtered = games.filter((game) => {
        const teams = (game as { teams?: PromiedosTeam[] })?.teams ?? [];
        return teams.some((team) => team.id === options.opponentId);
      });

      if (filtered.length > 0) games = filtered;
    }

    if (games.length === 0) return null;

    const ranked = games
      .map((game) => normalizeGame(game as PromiedosGame))
      .filter((game): game is LiveMatch => game !== null)
      .sort(
        (a, b) =>
          statusRank(b.status) - statusRank(a.status) ||
          b.startTime.getTime() - a.startTime.getTime(),
      );

    return ranked[0] ?? null;
  } catch {
    return null;
  }
}
