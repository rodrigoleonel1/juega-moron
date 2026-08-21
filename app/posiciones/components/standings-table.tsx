"use client";

import Image from "next/image";
import type {
  LiveByTeamRecord,
  Standings,
  StandingsRow,
  StandingsTrendValue,
} from "@/lib/promiedos";

interface StandingsTableProps {
  standings: Standings;
  liveByTeam: LiveByTeamRecord;
}

const TREND_CLASS: Record<StandingsTrendValue, string> = {
  G: "bg-success",
  E: "bg-warning",
  P: "bg-error",
};

const DESTINATION_COLOR_OVERRIDES: Record<string, string> = {};

function destinationColorFor(row: StandingsRow): string | undefined {
  if (!row.destinationColor) return undefined;
  return DESTINATION_COLOR_OVERRIDES[row.destinationColor] ?? row.destinationColor;
}

function TrendDot({ value }: { value: StandingsTrendValue }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${TREND_CLASS[value]}`}
    />
  );
}

function LiveBadge({
  score,
  rivalScore,
}: {
  score: number;
  rivalScore: number;
}) {
  const outcome = score > rivalScore ? "ganando" : score === rivalScore ? "empatando" : "perdiendo";
  const bgClass =
    score > rivalScore
      ? "bg-success/15 text-success border-success/30"
      : score === rivalScore
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-error/15 text-error border-error/30";

  const displayScore = `${score}-${rivalScore}`;

  return (
    <span
      className={`ml-1.5 sm:ml-2 inline-flex items-center gap-1 rounded px-1 py-0.5 text-[10px] sm:text-xs font-bold tabular-nums border ${bgClass}`}
      role="status"
      aria-label={`En vivo, ${outcome} ${displayScore}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      {displayScore}
    </span>
  );
}

const cell = "px-1 sm:px-2 py-2 sm:py-2.5 text-center tabular-nums whitespace-nowrap";

export function StandingsTable({ standings, liveByTeam }: StandingsTableProps) {
  return (
    <section className="animate-fade-in mx-auto max-w-7xl mb-12">
      <h1 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-tight mb-6">
        Posiciones{" "}
        <span className="text-primary">2026</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {standings.zones.map((zone) => (
          <div key={zone.name} className="space-y-3">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              {zone.name}
            </h2>

            <div className="card overflow-hidden">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wider text-muted border-b border-border">
                    <th scope="col" className="px-3 py-2 sm:py-2.5 font-medium w-6 sm:w-8">#</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium">Equipo</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">PTS</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">J</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">G</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">E</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">P</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">Gol</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">+/-</th>
                    <th scope="col" className="px-1 sm:px-2 py-2 sm:py-2.5 font-medium text-center">
                      <span className="sr-only">Últimas</span>
                      <span aria-hidden="true">Últ.</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zone.rows.map((row: StandingsRow) => {
                    const live = liveByTeam[row.teamId];

                    return (
                      <tr
                        key={row.teamId}
                        className={`border-b border-border/50 last:border-b-0 ${
                          row.isMoron ? "bg-primary/10" : "hover:bg-white/5 transition-colors"
                        }`}
                      >
                        <td className="px-1 sm:px-2 py-2 sm:py-2.5 whitespace-nowrap text-center">
                          {destinationColorFor(row) ? (
                            <span
                              className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md text-xs sm:text-sm font-bold"
                              style={{ backgroundColor: destinationColorFor(row) }}
                              title={row.destination}
                            >
                              {row.rank}
                            </span>
                          ) : (
                            <span>{row.rank}</span>
                          )}
                        </td>
                        <td className="px-1 sm:px-2 py-2 sm:py-2.5 min-w-0">
                          <span
                            className={`flex items-center gap-1.5 sm:gap-2 font-medium ${
                              row.isMoron ? "text-primary-light" : ""
                            }`}
                          >
                            <Image
                              src={`https://api.promiedos.com.ar/images/team/${row.teamId}/1`}
                              alt=""
                              width={24}
                              height={24}
                              loading="lazy"
                              className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
                            />
                            <span className="truncate">{row.name}</span>
                            {live && (
                              <LiveBadge
                                score={live.score}
                                rivalScore={live.rivalScore}
                              />
                            )}
                          </span>
                        </td>
                        <td className={`${cell} font-bold`}>{row.points}</td>
                        <td className={`${cell} text-muted`}>{row.played}</td>
                        <td className={`${cell} text-muted`}>{row.won}</td>
                        <td className={`${cell} text-muted`}>{row.drawn}</td>
                        <td className={`${cell} text-muted`}>{row.lost}</td>
                        <td className={`${cell} text-muted`}>
                          {row.goalsFor}:{row.goalsAgainst}
                        </td>
                        <td className={`${cell} text-muted`}>
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="px-1 sm:px-2 py-2 sm:py-2.5 whitespace-nowrap">
                          <span className="flex items-center justify-center gap-0.5 sm:gap-1">
                            {row.trend.map((value, index) => (
                              <TrendDot key={index} value={value} />
                            ))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}