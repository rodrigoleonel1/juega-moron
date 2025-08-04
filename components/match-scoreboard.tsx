"use client";

import { useEffect, useState } from "react";

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: string;
  awayScore: string;
  matchTime: string;
  homeReds: string;
  awayReds: string;
  status: string;
  lastUpdated: string;
}

export default function MatchScoreboard({
  ficha_partido,
}: {
  ficha_partido: string;
}) {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch("/api/match-scoreboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: ficha_partido,
          }),
        });

        const data = await res.json();
        setMatch(data);
      } catch (error) {
        console.error("Error al cargar datos del partido:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();

    const interval = setInterval(fetchMatch, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando datos del partido...</p>;
  if (!match) return <p>No se pudieron obtener los datos del partido.</p>;

  return (
    <main className="max-w-lg font-sans text-center bg-black/60 py-4 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">🔴 Partido en vivo</h1>

      <div className="flex items-center justify-center gap-8 text-lg font-semibold">
        {/* Equipo Local */}
        <div className="flex flex-col items-center gap-1 min-w-[140px]">
          <div className="flex items-center gap-2">
            <img
              src={match.homeLogo}
              alt={`${match.homeTeam} escudo`}
              width={48}
              height={48}
            />
          </div>
          <span className="max-w-38 leading-5">{match.homeTeam}</span>
        </div>

        {/* Marcador y minuto */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold flex">
            {match.homeReds &&
              Array.from({ length: Number(match.homeReds) || 0 }).map(
                (_, i) => (
                  <span
                    key={i}
                    className="ml-1 w-1 h-2 inline-block bg-red-500"
                  />
                )
              )}
            {match.homeScore} - {match.awayScore}
            {match.awayReds &&
              Array.from({ length: Number(match.awayReds) || 0 }).map(
                (_, i) => (
                  <span
                    key={i}
                    className="ml-1 w-1 h-2 inline-block bg-red-500"
                  />
                )
              )}
          </div>
          <div className="text-sm mt-1 text-gray-300">{match.matchTime}</div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex flex-col items-center gap-1 min-w-[140px]">
          <div className="flex items-center gap-2">
            <img
              src={match.awayLogo}
              alt={`${match.awayTeam} escudo`}
              width={48}
              height={48}
            />
          </div>
          <span className="max-w-38 leading-5">{match.awayTeam}</span>
        </div>
      </div>
    </main>
  );
}
