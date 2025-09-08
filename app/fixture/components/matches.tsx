"use client";

import { useState } from "react";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { FixtureCard } from "@/components/fixture-card";
import { Match } from "@/lib/types";

interface MatchesProps {
  matches: Match[];
}

export default function Matches({ matches }: MatchesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredAndSortedFixtures = matches
    .filter((match) => {
      const matchDate = new Date(match.datetime);
      const now = new Date();
      const isPlayed = !!match.result;
      const isUpcoming = !isPlayed && matchDate > now;

      // Filter by search term
      const matchesSearch = match.versus
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by status
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

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      } else {
        return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
      }
    });
  return (
    <>
      <form
        className="flex flex-col md:flex-row gap-4 max-w-3xl"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por rival..."
            aria-label="Buscar por rival"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border-2 border-white bg-white text-black placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:border-black transition duration-100"
          />
        </div>
        <select
          value={filterStatus}
          aria-label="Filtrar por estado del partido"
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-white bg-white text-black shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:border-black transition duration-100"
        >
          <option value="all">Todos</option>
          <option value="upcoming">Próximos</option>
          <option value="played">Jugados</option>
          <option value="won">Ganados</option>
          <option value="lost">Perdidos</option>
          <option value="drawn">Empatados</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="py-2 px-3 rounded-md bg-white text-black  shadow-md flex justify-center items-center"
        >
          Ordenar por fecha
          {sortOrder === "asc" ? (
            <ArrowUp size={20} />
          ) : (
            <ArrowDown size={20} />
          )}
        </button>
      </form>

      {filteredAndSortedFixtures.length > 0 ? (
        <ul className="grid list-none p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
          {filteredAndSortedFixtures.map((match: Match) => {
            return (
              <li key={match.datetime}>
                <FixtureCard match={match} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center w-full py-8 text-xl font-semibold bg-black/60 rounded-md">
          <p>No se encontraron partidos con los filtros aplicados.</p>
        </div>
      )}
    </>
  );
}
