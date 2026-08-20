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

// ────────────────────────────────────────────────
// Posiciones (tables_groups) y resultados en vivo
// ────────────────────────────────────────────────

export type StandingsTrendValue = "G" | "E" | "P";

export interface StandingsRow {
  rank: number;
  teamId: string;
  name: string;
  shortName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  destination?: string;
  destinationColor?: string;
  isMoron: boolean;
  trend: StandingsTrendValue[];
}

export interface StandingsZone {
  name: string;
  rows: StandingsRow[];
}

export interface Standings {
  zones: StandingsZone[];
}

export interface LiveScoreByTeam {
  score: number;
  rivalScore: number;
}

export interface MatchActivity {
  hasLive: boolean;
  nextStartAt: number | null;
}

export type LiveByTeamRecord = Record<string, LiveScoreByTeam>;

export interface StandingsPayload {
  standings: Standings | null;
  liveByTeam: LiveByTeamRecord;
  activity: MatchActivity;
}

export function serializeStandingsPayload(result: {
  standings: Standings | null;
  liveByTeam: Map<string, LiveScoreByTeam>;
  activity: MatchActivity;
}): StandingsPayload {
  return {
    standings: result.standings,
    liveByTeam: Object.fromEntries(result.liveByTeam),
    activity: result.activity,
  };
}

const TREND_MAP: Record<number, StandingsTrendValue> = {
  1: "G",
  0: "E",
  2: "P",
};

function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseGoals(value: unknown): { goalsFor: number; goalsAgainst: number } {
  const text = String(value ?? "");
  const match = text.match(/^(\d+):(\d+)/);

  if (!match) return { goalsFor: 0, goalsAgainst: 0 };

  return { goalsFor: toInt(match[1]), goalsAgainst: toInt(match[2]) };
}

export function extractStandings(data: unknown): Standings | null {
  if (!data || typeof data !== "object") return null;

  const pageProps = (data as { props?: { pageProps?: unknown } })?.props?.pageProps;
  if (!pageProps || typeof pageProps !== "object") return null;

  const dataNode = (pageProps as { data?: unknown })?.data;
  if (!dataNode || typeof dataNode !== "object") return null;

  const groups = (dataNode as { tables_groups?: unknown })?.tables_groups;
  if (!Array.isArray(groups) || groups.length === 0) return null;

  const zones: StandingsZone[] = [];

  for (const group of groups) {
    if (!group || typeof group !== "object") continue;

    const tables = (group as { tables?: unknown })?.tables;
    if (!Array.isArray(tables)) continue;

    for (const zone of tables) {
      if (!zone || typeof zone !== "object") continue;

      const zoneName = String((zone as { name?: string })?.name ?? "");
      const table = (zone as { table?: unknown })?.table;
      if (!table || typeof table !== "object") continue;

      const rowsRaw = (table as { rows?: unknown })?.rows;
      if (!Array.isArray(rowsRaw)) continue;

      const rows: StandingsRow[] = rowsRaw
        .map((row): StandingsRow | null => {
          if (!row || typeof row !== "object") return null;

          const rank = toInt((row as { num?: number })?.num);
          const entity = (row as { entity?: { object?: unknown } })?.entity?.object;
          if (!entity || typeof entity !== "object") return null;

          const teamId = String((entity as { id?: string })?.id ?? "");
          const name = String((entity as { name?: string })?.name ?? "");
          const shortName = String(
            (entity as { short_name?: string })?.short_name ?? "",
          );

          const values = (row as { values?: unknown[] })?.values ?? [];
          const getValue = (key: string): unknown => {
            const found = values.find(
              (v) =>
                typeof v === "object" &&
                (v as { key?: string })?.key === key,
            );
            return (found as { value?: unknown })?.value;
          };

          const goals = parseGoals(getValue("Goals"));

          const trendRaw = getValue("{trend}");
          const trend = (Array.isArray(trendRaw) ? trendRaw : [])
            .map((v) => TREND_MAP[toInt(v)])
            .filter((v): v is StandingsTrendValue => v !== undefined);

          return {
            rank,
            teamId,
            name,
            shortName,
            points: toInt(getValue("Points")),
            played: toInt(getValue("GamePlayed")),
            won: toInt(getValue("GamesWon")),
            drawn: toInt(getValue("GamesEven")),
            lost: toInt(getValue("GamesLost")),
            goalsFor: goals.goalsFor,
            goalsAgainst: goals.goalsAgainst,
            goalDifference: toInt(getValue("Ratio")),
            destination: String((row as { destination?: string })?.destination ?? ""),
            destinationColor: String(
              (row as { destination_color?: string })?.destination_color ?? "",
            ),
            isMoron: teamId === MORON_TEAM_ID,
            trend,
          };
        })
        .filter((row): row is StandingsRow => row !== null);

      zones.push({ name: zoneName, rows });
    }
  }

  return zones.length > 0 ? { zones } : null;
}

export function extractLiveGamesByTeam(data: unknown): Map<string, LiveScoreByTeam> {
  const liveByTeam = new Map<string, LiveScoreByTeam>();

  if (!data || typeof data !== "object") return liveByTeam;

  const pageProps = (data as { props?: { pageProps?: unknown } })?.props?.pageProps;
  if (!pageProps || typeof pageProps !== "object") return liveByTeam;

  const dataNode = (pageProps as { data?: unknown })?.data;
  if (!dataNode || typeof dataNode !== "object") return liveByTeam;

  const filters = (dataNode as { games?: { filters?: unknown[] } })?.games?.filters;
  if (!Array.isArray(filters)) return liveByTeam;

  for (const filter of filters) {
    if (!filter || typeof filter !== "object") continue;

    const games = (filter as { games?: unknown[] })?.games;
    if (!Array.isArray(games)) continue;

    for (const game of games) {
      const parsed = game as PromiedosGame;
      if (getGameStatus(parsed) !== "en vivo") continue;

      const scores = parsed.scores;
      const teams = parsed.teams ?? [];
      if (!Array.isArray(scores) || scores.length < 2 || teams.length < 2) {
        continue;
      }

      // scores = [local, visitante]; teams[0] = local, teams[1] = visitante
      liveByTeam.set(String(teams[0]?.id ?? ""), {
        score: scores[0],
        rivalScore: scores[1],
      });
      liveByTeam.set(String(teams[1]?.id ?? ""), {
        score: scores[1],
        rivalScore: scores[0],
      });
    }
  }

  return liveByTeam;
}

export function extractMatchActivity(data: unknown): MatchActivity {
  let hasLive = false;
  let nextStartAt: number | null = null;

  if (!data || typeof data !== "object") return { hasLive, nextStartAt };

  const pageProps = (data as { props?: { pageProps?: unknown } })?.props?.pageProps;
  if (!pageProps || typeof pageProps !== "object") return { hasLive, nextStartAt };

  const dataNode = (pageProps as { data?: unknown })?.data;
  if (!dataNode || typeof dataNode !== "object") return { hasLive, nextStartAt };

  const filters = (dataNode as { games?: { filters?: unknown[] } })?.games?.filters;
  if (!Array.isArray(filters)) return { hasLive, nextStartAt };

  const now = Date.now();

  for (const filter of filters) {
    if (!filter || typeof filter !== "object") continue;

    const games = (filter as { games?: unknown[] })?.games;
    if (!Array.isArray(games)) continue;

    for (const game of games) {
      const parsed = game as PromiedosGame;
      const status = getGameStatus(parsed);

      if (status === "en vivo") {
        hasLive = true;
        continue;
      }

      if (status !== "próximamente") continue;

      const startTime = parsePromiedosStartTime(String(parsed.start_time ?? ""));
      if (Number.isNaN(startTime.getTime())) continue;

      const startMs = startTime.getTime();
      if (startMs > now && (nextStartAt === null || startMs < nextStartAt)) {
        nextStartAt = startMs;
      }
    }
  }

  return { hasLive, nextStartAt };
}

export async function getStandings(options: {
  competencia: string;
  now?: number;
}): Promise<{
  standings: Standings | null;
  liveByTeam: Map<string, LiveScoreByTeam>;
  activity: MatchActivity;
} | null> {
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

    return {
      standings: extractStandings(data),
      liveByTeam: extractLiveGamesByTeam(data),
      activity: extractMatchActivity(data),
    };
  } catch {
    return null;
  }
}
