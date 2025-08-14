import GamesBrowser, { GamesFilter } from "@/components/games-browser";
import { Game } from "@/components/games-table";
import PlayersTable, { PlayerRow } from "@/components/players-table";
import StandingsTable from "../../components/standings-table";
import { StandingsRow, ApiColumn } from "../../components/standings-table";

type ApiRowValue = { key: string; value: string | number | number[] };
type ApiTeam = {
  name: string;
  short_name?: string;
  url_name?: string;
  id: string;
  colors?: { color?: string; text_color?: string };
};
type ApiRow = {
  num: number;
  values: ApiRowValue[];
  entity?: { type: number; object: ApiTeam };
  destination_color?: string;
};
type ApiTable = {
  name: string;
  table: {
    is_live?: boolean;
    destinations?: { num: number; color: string; name: string }[];
    columns: ApiColumn[];
    rows: ApiRow[];
  };
};
type ApiTablesGroup = { name: string; tables: ApiTable[] };
type ApiPlayersTable = {
  name: string;
  name_color?: string;
  columns: { key: string; title: string; type: number; is_bold?: boolean }[];
  rows: {
    num: number;
    entity: {
      type: number;
      object: {
        name: string;
        sname?: string;
        position?: string;
        team_id?: string;
      };
    };
    values: { key: string; value: string }[];
  }[];
};
type ApiResponse = {
  TTL?: number;
  league?: { name?: string };
  tables_groups?: ApiTablesGroup[];
  games?: { filters: (GamesFilter & { games?: Game[] })[] };
  players_statistics?: { preview_rows_num?: number; tables: ApiPlayersTable[] };
};

function valuesToMap(values: ApiRowValue[]) {
  const map: Record<string, string> = {};
  for (const v of values) {
    if (Array.isArray(v.value)) {
      map[v.key] = JSON.stringify(v.value);
    } else {
      map[v.key] = String(v.value);
    }
  }
  return map;
}

function extractTrend(values: ApiRowValue[]): number[] | undefined {
  const t = values.find((v) => v.key === "{trend}");
  if (!t) return undefined;
  return Array.isArray(t.value) ? (t.value as number[]) : undefined;
}

function toStandingsRows(apiRows: ApiRow[]): StandingsRow[] {
  return apiRows.map((r) => {
    const team = r.entity?.object;
    const map = valuesToMap(r.values);
    return {
      pos: r.num,
      teamId: team?.id,
      teamName: team?.name || "-",
      teamShortName: team?.short_name,
      teamColor: team?.colors?.color,
      teamTextColor: team?.colors?.text_color,
      destinationColor: r.destination_color,
      values: map,
      trend: extractTrend(r.values),
    };
  });
}

function findTables(group: ApiTablesGroup | undefined) {
  if (!group)
    return {
      zonaA: undefined as ApiTable | undefined,
      zonaB: undefined as ApiTable | undefined,
    };
  const zonaA = group.tables.find((t) =>
    t.name.toLowerCase().includes("zona a")
  );
  const zonaB = group.tables.find((t) =>
    t.name.toLowerCase().includes("zona b")
  );
  return { zonaA, zonaB };
}

function buildTeamMapFromTables(tables: (ApiTable | undefined)[]) {
  const map: Record<string, { name: string; short_name?: string }> = {};
  for (const t of tables) {
    if (!t?.table?.rows) continue;
    for (const r of t.table.rows) {
      const team = r.entity?.object;
      if (team?.id) {
        map[team.id] = { name: team.name, short_name: team.short_name };
      }
    }
  }
  return map;
}

function buildLiveByTeam(filters?: (GamesFilter & { games?: Game[] })[]) {
  const out: Record<string, { gf: number; ga: number; scoreText: string }> = {};
  if (!filters || filters.length === 0) return out;
  const current =
    filters.find((f) => f.selected) ||
    filters.find((f) => f.name?.toLowerCase().includes("actuales")) ||
    filters.find((f) => f.games && f.games.length > 0);

  const games = current?.games ?? [];
  for (const g of games) {
    if (g?.status?.enum !== 2) continue; // solo en vivo
    if (!g.scores || g.scores.length !== 2) continue;
    const [home, away] = g.teams;
    const [h, a] = g.scores;
    if (home?.id) {
      out[home.id] = { gf: h, ga: a, scoreText: `${h}-${a}` };
    }
    if (away?.id) {
      out[away.id] = { gf: a, ga: h, scoreText: `${h}-${a}` };
    }
  }
  return out;
}

async function getData(): Promise<ApiResponse> {
  const res = await fetch(`http://localhost:3000/api/league`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error("No se pudo obtener la información de la liga");
  return res.json();
}

export default async function Page() {
  const data = await getData();

  const leagueName = data.league?.name || "Liga";

  // Fase de grupos -> Zona A / Zona B
  const fase = data.tables_groups?.find((g) =>
    g.name.toLowerCase().includes("fase")
  );
  const { zonaA, zonaB } = findTables(fase);

  const zonaAColumns = zonaA?.table.columns ?? [];
  const zonaBColumns = zonaB?.table.columns ?? [];

  const zonaARows = toStandingsRows(zonaA?.table.rows ?? []);
  const zonaBRows = toStandingsRows(zonaB?.table.rows ?? []);

  // Filtros de partidos
  const filters: (GamesFilter & { games?: Game[] })[] =
    data.games?.filters ?? [];
  const liveByTeam = buildLiveByTeam(filters);

  // Map de equipos para tablas de jugadores
  const teamMap = buildTeamMapFromTables([zonaA, zonaB]);

  // Tablas de jugadores
  const pTables = data.players_statistics?.tables || [];
  const goles = pTables.find((t) => t.name.toLowerCase().includes("goles"));
  const asist = pTables.find((t) =>
    t.name.toLowerCase().includes("asistencias")
  );
  const amarillas = pTables.find((t) =>
    t.name.toLowerCase().includes("amarillas")
  );
  const rojas = pTables.find((t) => t.name.toLowerCase().includes("rojas"));

  const toPlayerRows = (tbl?: ApiPlayersTable): PlayerRow[] => {
    if (!tbl) return [];
    return tbl.rows.map((r) => ({
      rank: r.num,
      name: r.entity?.object?.name || "-",
      sname: r.entity?.object?.sname,
      position: r.entity?.object?.position,
      teamId: r.entity?.object?.team_id,
      value: r.values?.[0]?.value ?? "-",
    }));
  };

  const goleadores = toPlayerRows(goles);
  const asistidores = toPlayerRows(asist);
  const amonestados = toPlayerRows(amarillas);
  const expulsados = toPlayerRows(rojas);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold">{leagueName}</h1>
        <p className="text-sm text-muted-foreground">
          Tablas, partidos y estadísticas en vivo.
        </p>
      </header>

      <section aria-labelledby="standings" className="space-y-4">
        <h2 id="standings" className="text-xl font-semibold">
          Posiciones
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StandingsTable
            title="Zona A"
            columns={zonaAColumns}
            rows={zonaARows}
            liveByTeam={liveByTeam}
          />
          <StandingsTable
            title="Zona B"
            columns={zonaBColumns}
            rows={zonaBRows}
            liveByTeam={liveByTeam}
          />
        </div>
      </section>

      <section aria-labelledby="matches" className="space-y-4">
        <h2 id="matches" className="text-xl font-semibold">
          Partidos
        </h2>
        <GamesBrowser title="Partidos" filters={filters} />
      </section>

      <section aria-labelledby="players-stats" className="space-y-4">
        <h2 id="players-stats" className="text-xl font-semibold">
          Jugadores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlayersTable
            title="Goleadores"
            valueTitle="Goles"
            rows={goleadores}
            teamMap={teamMap}
          />
          <PlayersTable
            title="Asistidores"
            valueTitle="Asistencias"
            rows={asistidores}
            teamMap={teamMap}
          />
          <PlayersTable
            title="Tarjetas Amarillas"
            valueTitle="Amarillas"
            rows={amonestados}
            teamMap={teamMap}
          />
          <PlayersTable
            title="Tarjetas Rojas"
            valueTitle="Rojas"
            rows={expulsados}
            teamMap={teamMap}
          />
        </div>
      </section>
    </main>
  );
}
