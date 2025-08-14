"use client"

import { crestUrl } from "@/lib/team-utils"
import { formatDDMM } from "@/lib/date-utils"

export type Team = {
  id?: string
  name: string
  short_name?: string
  colors?: { color?: string; text_color?: string }
  red_cards?: number
}

export type Game = {
  id: string
  stage_round_name?: string
  url_name?: string
  start_time?: string
  scores?: [number, number]
  game_time_status_to_display?: string
  status?: { enum: number; name: string; short_name?: string; symbol_name?: string }
  teams: [Team, Team]
}

export interface GamesTableProps {
  title: string
  games: Game[]
}

const DEFAULT_PROPS: GamesTableProps = {
  title: "Partidos",
  games: [],
}

function RedCards({ count = 0 }: { count?: number }) {
  if (!count || count <= 0) return null
  return (
    <span
      className="ml-1 inline-flex items-center justify-center rounded-sm bg-rose-600 text-white text-[10px] leading-3 px-1.5 py-[2px]"
      title={`${count} roja${count === 1 ? "" : "s"}`}
      aria-label={`${count} tarjeta${count === 1 ? "" : "s"} roja${count === 1 ? "" : "s"}`}
    >
      {count}
    </span>
  )
}

export default function GamesTable(props: GamesTableProps = DEFAULT_PROPS) {
  const { title, games } = props

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="min-w-[90px] px-4 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Local</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-900">Resultado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Visitante</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {games.map((g) => {
              const local = g.teams[0]
              const visita = g.teams[1]
              const marcador = g.scores && g.scores.length === 2 ? `${g.scores[0]} - ${g.scores[1]}` : "-"

              const estadoTxt = g.game_time_status_to_display || g.status?.short_name || g.status?.name || "-"
              const vivo = g.status?.enum === 2 // En juego
              const finalizado = g.status?.enum === 3
              const prog = g.status?.enum === 1

              const localCrest = crestUrl(local?.id)
              const visitaCrest = crestUrl(visita?.id)

              return (
                <tr key={g.id} className="align-middle hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{formatDDMM(g.start_time)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {localCrest ? (
                        <img
                          src={localCrest || "/placeholder.svg?height=20&width=20&query=team%20crest"}
                          alt={`Escudo ${local.short_name || local.name}`}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-black/10"
                          style={{ backgroundColor: local?.colors?.color || "#e5e7eb" }}
                          aria-hidden
                        />
                      )}
                      <span className="text-sm text-gray-900">{local.short_name || local.name}</span>
                      <RedCards count={local.red_cards} />
                    </div>
                  </td>
                  <td className="text-center tabular-nums px-4 py-3">
                    {vivo ? (
                      <span className="inline-flex items-center justify-center rounded bg-emerald-600 text-white px-2 py-0.5 font-semibold text-sm">
                        {marcador}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-900">{marcador}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {visitaCrest ? (
                        <img
                          src={visitaCrest || "/placeholder.svg?height=20&width=20&query=team%20crest"}
                          alt={`Escudo ${visita.short_name || visita.name}`}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-black/10"
                          style={{ backgroundColor: visita?.colors?.color || "#e5e7eb" }}
                          aria-hidden
                        />
                      )}
                      <span className="text-sm text-gray-900">{visita.short_name || visita.name}</span>
                      <RedCards count={visita.red_cards} />
                    </div>
                  </td>
                  <td className="text-right px-4 py-3">
                    {finalizado ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Final
                      </span>
                    ) : vivo ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
                        {estadoTxt}
                      </span>
                    ) : prog ? (
                      <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        Prog.
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {estadoTxt}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
