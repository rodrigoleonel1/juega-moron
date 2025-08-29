"use client";

import { useEffect, useState } from "react";
import { getMatches, type Match } from "@/data/fixture";
import { FixtureCard } from "@/components/fixture-card";
import { Search } from "lucide-react";

export default function FixturePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const recent = await getMatches();

        setMatches(recent);
      } catch (err) {
        console.error(err);
        setError("Hubo un error al cargar los partidos");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-6 w-full h-screen">
        <div className="w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

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
    .sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

  return (
    <>
      <h1 className="text-2xl font-semibold">Fixture temporada 2025</h1>
      <form
        className="flex flex-col md:flex-row gap-4 max-w-xl"
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
