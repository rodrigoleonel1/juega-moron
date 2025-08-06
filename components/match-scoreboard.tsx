"use client";

import { useEffect, useState } from "react";

interface Team {
  name: string;
  short_name: string;
  url_name: string;
  id: string;
  country_id: string;
  allow_open: boolean;
  colors: {
    color: string;
    text_color: string;
  };
  red_cards: number;
}

interface GameData {
  TTL: number;
  cache_time: number;
  game: {
    id: string;
    league: {
      name: string;
      id: string;
      url_name: string;
      country_id: string;
      show_country_flags: boolean;
      allow_open: boolean;
      country_name: string;
      is_international: boolean;
    };
    stage_round_name: string;
    winner: number;
    teams: Team[];
    url_name: string;
    scores: number[];
    status: {
      enum: number;
      name: string;
      short_name: string;
      symbol_name: string;
    };
    start_time: string;
    game_time: number;
    game_time_to_display: string;
    game_time_status_to_display: string;
  };
}

export default function MatchScoreboard({
  ficha_partido,
}: {
  ficha_partido: string;
}) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = ficha_partido;
  const parts = url.split("/");
  const id = parts[parts.length - 1];

  const fetchGameData = async () => {
    try {
      const response = await fetch(
        `https://api.promiedos.com.ar/gamecenter/${id}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: GameData = await response.json();
      setGameData(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los datos"
      );
      console.error("Error fetching game data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();

    const interval = setInterval(() => {
      fetchGameData();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando datos del partido...</p>;
  if (error) return <p>No se pudieron obtener los datos del partido.</p>;
  if (!gameData) {
    return null;
  }

  const { game } = gameData;
  const [homeTeam, awayTeam] = game.teams;
  const [homeScore, awayScore] = game.scores || [0, 0];

  return (
    <div className="w-full max-w-lg p-4 bg-black/70 rounded-md shadow-md space-y-4">
      {/* Header con información de la liga */}
      <div className=" flex items-center justify-between rounded-md ">
        <h2 className="font-semibold">
          {game.league.name} - {game.stage_round_name}
        </h2>
        <div className="bg-white/20 px-1 rounded-md">EN VIVO</div>
      </div>

      {/* Marcador principal */}
      <div className="grid grid-cols-3 items-center text-center gap-4">
        {/* Equipo local */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={`https://api.promiedos.com.ar/images/team/${homeTeam.id}/1`}
            alt={homeTeam.name}
          />
          <h3 className="font-semibold text-lg leading-4">{homeTeam.name}</h3>
          {homeTeam.red_cards > 0 && (
            <div className="flex justify-center mt-1">
              {Array.from({ length: homeTeam.red_cards }).map((_, i) => (
                <span key={i} className="w-2 h-3 bg-red-500 mr-1" />
              ))}
            </div>
          )}
        </div>

        {/* Marcador */}
        <div className="flex flex-col items-center text-center font-semibold gap-2">
          <div className="text-4xl">
            {homeScore} - {awayScore}
          </div>
          <div className="border-1 border-green-500 text-green-700 bg-green-50 rounded-md px-2 text-sm">
            {game.status.name}
          </div>
          <div className="text-lg">{game.game_time_status_to_display}</div>
        </div>

        {/* Equipo visitante */}
        <div className="flex flex-col items-center text-center gap-2">
          <img
            src={`https://api.promiedos.com.ar/images/team/${awayTeam.id}/1`}
            alt={homeTeam.name}
          />
          <h3 className="font-semibold text-lg leading-4">{awayTeam.name}</h3>
          {awayTeam.red_cards > 0 && (
            <div className="flex justify-center mt-1">
              {Array.from({ length: awayTeam.red_cards }).map((_, i) => (
                <span key={i} className="w-2 h-3 bg-red-500 mr-1" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
