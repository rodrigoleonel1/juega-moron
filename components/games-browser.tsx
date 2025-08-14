"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import GamesTable, { Game } from "./games-table"

export type GamesFilter = {
  name: string
  key: string
  selected?: boolean
  games?: Game[]
}

export interface GamesBrowserProps {
  filters: GamesFilter[]
  title?: string
}

const DEFAULT_PROPS: GamesBrowserProps = {
  filters: [],
  title: "Partidos",
}

function parseRoundFromName(name?: string): number | null {
  if (!name) return null
  // Busca "Fecha N"
  const m = name.match(/fecha\s+(\d+)/i)
  if (m && m[1]) return Number.parseInt(m[1], 10)
  // fallback: primer número que aparezca en el texto (menos ideal, pero útil)
  const any = name.match(/(\d+)/)
  if (any && any[1]) return Number.parseInt(any[1], 10)
  return null
}

export default function GamesBrowser(props: GamesBrowserProps = DEFAULT_PROPS) {
  const { filters, title = "Partidos" } = props

  const initialIndex = useMemo(() => {
    const sel = filters.findIndex((f) => f.selected)
    if (sel >= 0) return sel
    const latest = filters.findIndex((f) => f.name.toLowerCase().includes("actuales"))
    if (latest >= 0) return latest
    return 0
  }, [filters])

  // Cache por número de fecha (round)
  const [roundCache, setRoundCache] = useState<Record<number, Game[]>>({})
  const [index, setIndex] = useState(initialIndex)
  const [games, setGames] = useState<Game[]>(() => filters[initialIndex]?.games ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const current = filters[index]
  const canPrev = index > 0
  const canNext = index < filters.length - 1

  const fetchRound = useCallback(async (round: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games/${round}`, { cache: "no-store" })
      if (!res.ok) throw new Error("No se pudo cargar la fecha")
      const data = await res.json()
      const list: Game[] = Array.isArray(data?.games) ? data.games : []
      setRoundCache((prev) => ({ ...prev, [round]: list }))
      setGames(list)
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar cuando cambia el índice
  useEffect(() => {
    const round = parseRoundFromName(current?.name)
    // Si no podemos inferir round (p. ej. "Partidos actuales"), usamos los partidos embebidos si existen.
    if (!round) {
      const embedded = current?.games
      if (embedded?.length) {
        setGames(embedded)
      } else {
        // Sin round y sin embebidos: limpiar a vacío
        setGames([])
      }
      return
    }

    // Si tenemos cache para esta fecha, úsalo
    const cached = roundCache[round]
    if (cached) {
      setGames(cached)
      return
    }

    // Sino, fetch contra el endpoint por fecha
    fetchRound(round)
  }, [index, current?.name, current?.games, roundCache, fetchRound])

  const goPrev = () => {
    if (!canPrev) return
    setIndex((i) => i - 1)
  }
  const goNext = () => {
    if (!canNext) return
    setIndex((i) => i + 1)
  }

  function handleSelectIndex(newIndex: number) {
    if (newIndex < 0 || newIndex >= filters.length) return
    setIndex(newIndex)
    setDropdownOpen(false)
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Ver fecha anterior"
            title="Fecha anterior"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Seleccionar fecha"
              className="text-lg font-semibold flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {title} {current?.name ? `• ${current.name}` : ""}
              <ChevronDown className="h-4 w-4 opacity-60" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-64 max-h-80 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {filters.map((f, i) => (
                  <button
                    key={f.key || `${f.name}-${i}`}
                    onClick={() => handleSelectIndex(i)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      i === index ? "font-semibold bg-gray-50" : ""
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={!canNext}
            aria-label="Ver fecha siguiente"
            title="Fecha siguiente"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-2" aria-live="polite">
            Cargando partidos...
          </p>
        ) : error ? (
          <p className="text-sm text-rose-600 mt-2">{error}</p>
        ) : null}
      </div>

      {games.length === 0 && !loading ? (
        <div className="px-4 py-6 text-sm text-gray-500">Sin partidos para esta fecha.</div>
      ) : (
        <GamesTable title="" games={games} />
      )}
    </div>
  )
}
