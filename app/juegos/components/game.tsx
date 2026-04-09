"use client";

import { useEffect, useState } from "react";
import { Match } from "@/lib/types";

interface Props {
  matches: Match[];
}

export default function Game({ matches }: Props) {
  const [playedMatches, setPlayedMatches] = useState<Match[]>([]);
  const [targetMatch, setTargetMatch] = useState<Match | null>(null);
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // elegir partido aleatorio no repetido
  const getRandomMatch = (used: Match[]) => {
    const played = matches.filter((m) => m.result);
    const available = played.filter(
      (m) => !used.find((u) => u.datetime === m.datetime),
    );

    if (available.length === 0) return null;

    return available[Math.floor(Math.random() * available.length)];
  };

  useEffect(() => {
    if (matches.length > 0) {
      const first = getRandomMatch([]);
      setTargetMatch(first);
    }
  }, [matches]);

  const nextMatch = () => {
    if (!targetMatch) return;

    const updatedPlayed = [...playedMatches, targetMatch];
    setPlayedMatches(updatedPlayed);

    const next = getRandomMatch(updatedPlayed);

    if (!next) {
      setGameOver(true);
      return;
    }

    setTargetMatch(next);
    setHomeGoals("");
    setAwayGoals("");
    setResult(null);
  };

  const handleSubmit = () => {
    if (!targetMatch || !targetMatch.result) return;

    const [realHome, realAway] = targetMatch.result
      .split(" ")[0]
      .split("-")
      .map(Number);

    const guessedHome = Number(homeGoals);
    const guessedAway = Number(awayGoals);

    if (guessedHome === realHome && guessedAway === realAway) {
      setTotalPoints((prev) => prev + 3);
      nextMatch();
    } else {
      const realOutcome =
        realHome > realAway ? "G" : realHome < realAway ? "P" : "E";
      const guessOutcome =
        guessedHome > guessedAway ? "G" : guessedHome < guessedAway ? "P" : "E";

      if (realOutcome === guessOutcome) {
        setTotalPoints((prev) => prev + 1);
        nextMatch();
      } else {
        setResult("wrong");
        setGameOver(true);
      }
    }
  };

  const resetGame = () => {
    setPlayedMatches([]);
    setTotalPoints(0);
    setGameOver(false);
    const first = getRandomMatch([]);
    setTargetMatch(first);
    setHomeGoals("");
    setAwayGoals("");
    setResult(null);
  };

  if (!targetMatch) {
    return <p>Cargando juego...</p>;
  }
}
