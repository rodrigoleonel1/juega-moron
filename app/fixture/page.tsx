"use client";
import { useState } from "react";
import { FIXTURE, type Match } from "@/data/fixture";
import { FixtureCard } from "@/components/fixture-card";
import { Search } from "lucide-react";

export default function FixturePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'played', 'upcoming', 'won', 'lost', 'drawn'

  const filteredAndSortedFixtures = FIXTURE.filter((match) => {
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
  }).sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  ); // Sort by date, most recent first

  return (
    <>
      <h1 className="text-2xl font-semibold">Fixture temporada 2025</h1>
      <section className="flex flex-col md:flex-row gap-4 max-w-xl">
        <article className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por rival..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border-2 border-white bg-white text-black placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:border-black transition duration-100"
          />
        </article>
        <select
          value={filterStatus}
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
      </section>

      {filteredAndSortedFixtures.length > 0 ? (
        <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
          {filteredAndSortedFixtures.map((match: Match, index: number) => {
            return <FixtureCard key={index} match={match} />;
          })}
        </section>
      ) : (
        <div className="text-center w-full py-8 text-xl font-semibold bg-black/60 rounded-md">
          No se encontraron partidos con los filtros aplicados.
        </div>
      )}
    </>
  );
}
