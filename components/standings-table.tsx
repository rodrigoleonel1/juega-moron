import { crestUrl } from "@/lib/team-utils";

export type ApiColumn = {
  key: string;
  title: string;
  type: number;
  is_bold?: boolean;
};

export type StandingsRow = {
  pos: number;
  teamId?: string;
  teamName: string;
  teamShortName?: string;
  teamColor?: string;
  teamTextColor?: string;
  destinationColor?: string;
  values: Record<string, string>;
  trend?: number[];
};

export interface StandingsTableProps {
  title: string;
  columns: ApiColumn[];
  rows: StandingsRow[];
  liveByTeam?: Record<
    string,
    {
      gf: number;
      ga: number;
      scoreText: string;
    }
  >;
}

const DEFAULT_PROPS: StandingsTableProps = {
  title: "Tabla",
  columns: [],
  rows: [],
};

function TrendDots({ values }: { values?: number[] }) {
  if (!values || values.length === 0) return <span>-</span>;
  const getColor = (v: number) =>
    v === 2 ? "bg-emerald-600" : v === 1 ? "bg-amber-500" : "bg-rose-600";
  return (
    <div className="flex items-center gap-1">
      {values.slice(-5).map((v, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${getColor(
            v
          )} ring-1 ring-black/10`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function StandingsTable(
  props: StandingsTableProps = DEFAULT_PROPS
) {
  const { title, columns, rows, liveByTeam = {} } = props;
  const nonTrendColumns = columns.filter((c) => c.key !== "{trend}");
  const trendColumn = columns.find((c) => c.key === "{trend}");

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-black/70 blackdrop-blur">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-white">
              <th className="text-center  text-sm font-medium text-gray-900">
                #
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Equipo
              </th>
              {nonTrendColumns.map((c) => (
                <th
                  key={c.key}
                  className={`px-2 py-3 text-left text-sm ${
                    c.is_bold ? "font-semibold" : "font-medium"
                  } text-gray-900`}
                >
                  {c.title}
                </th>
              ))}
              {trendColumn ? (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  {trendColumn.title}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y text-white">
            {rows.map((r) => {
              const crest = crestUrl(r.teamId);
              const live = r.teamId ? liveByTeam[r.teamId] : undefined;
              let liveBg = "";
              if (live) {
                if (live.gf > live.ga) liveBg = "bg-emerald-600 text-white";
                else if (live.gf === live.ga)
                  liveBg = "bg-amber-500 text-black";
                else liveBg = "bg-rose-600 text-white";
              }

              return (
                <tr
                  key={`${r.pos}-${r.teamName}`}
                  className="hover:bg-black/80"
                >
                  <td className="text-center tabular-nums px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      {r.destinationColor ? (
                        <span
                          className="inline-block h-2 w-2 rounded-sm ring-1 ring-black/10"
                          style={{ backgroundColor: r.destinationColor }}
                          aria-hidden
                        />
                      ) : null}
                      <span className="text-sm text-white">{r.pos}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {crest ? (
                        <img
                          src={
                            crest ||
                            "/placeholder.svg?height=20&width=20&query=team%20crest"
                          }
                          alt={`Escudo ${r.teamShortName || r.teamName}`}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="inline-block h-3 w-3 rounded-sm ring-1 ring-black/10 "
                          style={{ backgroundColor: r.teamColor || "#e5e7eb" }}
                          aria-hidden
                        />
                      )}
                      <span className="text-sm text-white">
                        {r.teamShortName || r.teamName}
                      </span>
                      {live ? (
                        <span
                          className={`ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${liveBg}`}
                          aria-label={`En vivo: ${live.scoreText}`}
                          title={`En vivo: ${live.scoreText}`}
                        >
                          {live.scoreText}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  {nonTrendColumns.map((c) => {
                    const v = r.values[c.key];
                    return (
                      <td
                        key={c.key}
                        className="tabular-nums  text-sm text-white"
                      >
                        {v ?? "-"}
                      </td>
                    );
                  })}
                  {trendColumn ? (
                    <td className="py-3">
                      <TrendDots values={r.trend} />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-white flex flex-wrap gap-2 border-t">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#0CF737] ring-1 ring-black/10" />
          Final ascenso
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#03A9F4] ring-1 ring-black/10" />
          Reducido
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#E61034] ring-1 ring-black/10" />
          Descenso
        </span>
      </div>
    </div>
  );
}
