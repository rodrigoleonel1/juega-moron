import { crestUrl } from "@/lib/team-utils"

export type PlayerRow = {
  rank: number
  name: string
  sname?: string
  position?: string
  teamId?: string
  value: string // numeric in string format from API
}

export interface PlayersTableProps {
  title: string
  valueTitle: string
  rows: PlayerRow[]
  teamMap?: Record<string, { name: string; short_name?: string }>
}

const DEFAULT_PROPS: PlayersTableProps = {
  title: "Tabla",
  valueTitle: "Valor",
  rows: [],
  teamMap: {},
}

function abbrPosition(pos?: string) {
  if (!pos) return "-"
  const p = pos.trim().toLowerCase()
  if (p === "defensores") return "DEF"
  if (p === "arqueros") return "ARQ"
  if (p === "mediocampistas") return "MED"
  if (p === "delanteros") return "DEL"
  return pos
}

export default function PlayersTable(props: PlayersTableProps = DEFAULT_PROPS) {
  const { title, valueTitle, rows, teamMap = {} } = props
  const displayedRows = (rows || []).slice(0, 10)

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="w-14 text-center px-4 py-3 text-sm font-medium text-gray-900">Equipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Jugador</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-medium text-gray-900">Posición</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">{valueTitle}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedRows.map((r) => {
              const team = r.teamId ? teamMap[r.teamId] : undefined
              const teamName = team?.short_name || team?.name || "-"
              const crest = crestUrl(r.teamId)
              return (
                <tr key={`${r.rank}-${r.name}`} className="hover:bg-gray-50">
                  {/* Equipo (crest only, with sr-only label) */}
                  <td className="text-center px-4 py-3">
                    {crest ? (
                      <div className="flex items-center justify-center">
                        <img
                          src={crest || "/placeholder.svg?height=20&width=20&query=team%20crest"}
                          alt={`Escudo ${teamName}`}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                        <span className="sr-only">{teamName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">{teamName}</span>
                    )}
                  </td>

                  {/* Jugador */}
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{r.name}</td>

                  {/* Posición */}
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-900">{abbrPosition(r.position)}</td>

                  {/* Valor */}
                  <td className="text-right tabular-nums px-4 py-3 text-sm text-gray-900">{r.value}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
