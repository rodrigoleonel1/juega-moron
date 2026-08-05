"use client";

import { useState } from "react";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { FixtureCard } from "@/components/fixture-card";
import { Match } from "@/lib/types";
import { parseArgentinaDateTime } from "@/lib/argentina-date";

interface MatchesProps {
  matches: Match[];
}

export default function Matches({ matches }: MatchesProps) {
  const [season, setSeason] = useState<"TEMP25" | "TEMP26">("TEMP26");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredAndSortedFixtures = matches
    .filter((match) => {
      const matchesSeason = match.temporada === season;
      const matchDate = parseArgentinaDateTime(match.datetime);
      const now = new Date();
      const isPlayed = !!match.result;
      const isUpcoming = !isPlayed && matchDate > now;
      const matchesSearch = match.versus
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === "played") {
        matchesStatus = isPlayed;
      } else if (filterStatus === "upcoming") {
        matchesStatus = isUpcoming;
      } else if (filterStatus === "won") {
        matchesStatus = match.result?.includes("(G)") || false;
      } else if (filterStatus === "lost") {
        matchesStatus = match.result?.includes("(P)") || false;
      } else if (filterStatus === "drawn") {
        matchesStatus = match.result?.includes("(E)") || false;
      }
      return matchesSearch && matchesStatus && matchesSeason;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return (
          parseArgentinaDateTime(a.datetime).getTime() -
          parseArgentinaDateTime(b.datetime).getTime()
        );
      } else {
        return (
          parseArgentinaDateTime(b.datetime).getTime() -
          parseArgentinaDateTime(a.datetime).getTime()
        );
      }
    });

  return (
    <section className="animate-fade-in mx-auto max-w-7xl mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-bold text-3xl sm:text-4xl tracking-tight">
          Fixture{" "}
          <span className="text-primary">
            {season === "TEMP26" ? "2026" : "2025"}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeason("TEMP26")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              season === "TEMP26"
                ? "bg-primary text-white"
                : "bg-surface backdrop-blur-sm border border-border text-muted hover:text-foreground"
            }`}
          >
            2026
          </button>
          <button
            onClick={() => setSeason("TEMP25")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              season === "TEMP25"
                ? "bg-primary text-white"
                : "bg-surface backdrop-blur-sm border border-border text-muted hover:text-foreground"
            }`}
          >
            2025
          </button>
        </div>
      </div>

      <form
        className="flex flex-col lg:flex-row gap-3 mb-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por rival..."
            aria-label="Buscar por rival"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-lg bg-surface backdrop-blur-sm border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterStatus}
            aria-label="Filtrar por estado del partido"
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-surface backdrop-blur-sm border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          >
            <option value="all">Todos</option>
            <option value="upcoming">Próximos</option>
            <option value="played">Jugados</option>
            <option value="won">Ganados</option>
            <option value="lost">Perdidos</option>
            <option value="drawn">Empatados</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2.5 rounded-lg bg-surface backdrop-blur-sm border border-border text-foreground hover:bg-surface-hover transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label={`Ordenar por fecha ${sortOrder === "asc" ? "descendente" : "ascendente"}`}
          >
            Fecha
            {sortOrder === "asc" ? (
              <ArrowUp size={14} aria-hidden="true" />
            ) : (
              <ArrowDown size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </form>

      {filteredAndSortedFixtures.length > 0 ? (
        <ul className="grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredAndSortedFixtures.map((match: Match) => (
            <li key={match.datetime}>
              <FixtureCard match={match} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 px-6 bg-surface backdrop-blur-sm border border-border rounded-2xl">
          <p className="font-bold text-lg text-muted">No se encontraron partidos</p>
          <p className="text-muted text-sm mt-1">Probá con otros filtros o cambiá de temporada.</p>
        </div>
      )}
    </section>
  );
}
