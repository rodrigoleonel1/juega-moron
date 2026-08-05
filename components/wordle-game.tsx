"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Jugador } from "@/lib/types";
import { isValidWord, getDailyIndex } from "@/lib/wordle";
import { getArgentinaDateKey } from "@/lib/argentina-date";
import {
  loadStats,
  saveStats,
  recordResult,
  WordleStats as WordleStatsType,
} from "@/lib/wordle-stats";
import { WordleStatsPanel } from "@/components/wordle-stats-panel";

const MAX_ATTEMPTS = 6;

type LetterState = "correct" | "present" | "absent" | "empty";

interface Guess {
  letters: { char: string; state: LetterState }[];
}

interface SavedGame {
  target: string;
  won: boolean;
  guesses: Guess[];
  date: string;
}

function getDateKey(): string {
  return getArgentinaDateKey();
}

function buildResultMessage(won: boolean, jugador: Jugador | undefined, target: string): string {
  if (won) {
    return jugador ? `¡Ganaste! El jugador era ${jugador.nombre} ${jugador.apellido}` : "¡Ganaste!";
  }
  return jugador ? `¡Perdiste! El jugador era ${jugador.nombre} ${jugador.apellido}` : `Perdiste. Era ${target}`;
}

function loadSavedGame(target: string): SavedGame | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem("wordle-moron");
    if (!saved) return null;

    const g: SavedGame = JSON.parse(saved);
    if (g.date === getDateKey() && g.target === target) return g;

    return null;
  } catch {
    return null;
  }
}

function getLetterState(
  guess: string,
  target: string,
  index: number
): LetterState {
  if (guess[index] === target[index]) return "correct";
  if (target.includes(guess[index])) return "present";
  return "absent";
}

export function WordleGame({ target, jugador }: { target: string; jugador?: Jugador }) {
  const wordLength = target.length;
  const [saved] = useState<SavedGame | null>(() => loadSavedGame(target));
  const [guesses, setGuesses] = useState<Guess[]>(() => saved?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(() => saved !== null);
  const [won, setWon] = useState(() => saved?.won ?? false);
  const [message, setMessage] = useState<string | null>(() =>
    saved ? buildResultMessage(saved.won, jugador, target) : null
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const alreadyPlayed = saved !== null;
  const [stats, setStats] = useState<WordleStatsType>(loadStats);

  const shareText = useMemo(() => {
    if (!gameOver) return undefined;

    const day = getDailyIndex();
    const rows = guesses
      .map((guess) =>
        guess.letters
          .map((letter) =>
            letter.state === "correct"
              ? "🟩"
              : letter.state === "present"
              ? "🟨"
              : "⬛"
          )
          .join("")
      )
      .join("\n");

    return `Wordle Morón #${day} ${won ? guesses.length : "X"}/${MAX_ATTEMPTS}\n${rows}`;
  }, [gameOver, guesses, won]);

  const saveGame = useCallback((guesses: Guess[], won: boolean) => {
    const g: SavedGame = {
      target,
      won,
      guesses,
      date: getDateKey(),
    };
    localStorage.setItem("wordle-moron", JSON.stringify(g));

    const nextStats = recordResult(loadStats(), won, guesses.length, getDateKey());
    saveStats(nextStats);
    setStats(nextStats);
  }, [target]);

  const addLetter = useCallback(
    (letter: string) => {
      if (gameOver || alreadyPlayed || currentGuess.length >= wordLength) return;
      setValidationError(null);
      setCurrentGuess((prev) => prev + letter);
    },
    [gameOver, alreadyPlayed, currentGuess, wordLength]
  );

  const removeLetter = useCallback(() => {
    if (gameOver || alreadyPlayed || currentGuess.length === 0) return;
    setValidationError(null);
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameOver, alreadyPlayed, currentGuess]);

  const submitGuess = useCallback(() => {
    if (gameOver || alreadyPlayed || currentGuess.length !== wordLength) return;

    if (!isValidWord(currentGuess)) {
      setValidationError("El nombre no está en nuestra base de datos");
      return;
    }

    const letters = currentGuess.split("").map((char, i) => ({
      char,
      state: getLetterState(currentGuess, target, i),
    }));

    const newGuesses = [...guesses, { letters }];
    setGuesses(newGuesses);
    setCurrentGuess("");
    setValidationError(null);

    const isWon = currentGuess === target;
    if (isWon) {
      setWon(true);
      setGameOver(true);
      setMessage(buildResultMessage(true, jugador, target));
      saveGame(newGuesses, true);
      return;
    }

    if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
      setMessage(buildResultMessage(false, jugador, target));
      saveGame(newGuesses, false);
    }
  }, [gameOver, alreadyPlayed, currentGuess, target, guesses, wordLength, saveGame, jugador]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (alreadyPlayed) return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        removeLetter();
      } else if (/^[a-zA-ZÑñ]$/.test(e.key)) {
        addLetter(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [addLetter, removeLetter, submitGuess, alreadyPlayed]);

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
  ];

  const getKeyState = (key: string): LetterState | null => {
    let state: LetterState | null = null;
    for (const guess of guesses) {
      for (const letter of guess.letters) {
        if (letter.char === key) {
          if (letter.state === "correct") return "correct";
          if (letter.state === "present") state = "present";
          if (letter.state === "absent" && state !== "present") state = "absent";
        }
      }
    }
    return state;
  };

  const cellSize = wordLength > 8 ? "w-10" : "w-14";

  if (alreadyPlayed) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
        <p className="font-bold text-xl">Ya jugaste hoy</p>
        <p className="text-white text-sm">Volvé mañana para una nueva palabra.</p>

        <div className="grid grid-rows-6 gap-1.5">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => {
            const guess = guesses[row] || null;
            return (
              <div key={row} className="flex gap-1.5 justify-center">
                {Array.from({ length: wordLength }).map((_, col) => {
                  const char = guess ? guess.letters[col].char : "";
                  const state = guess ? guess.letters[col].state : "empty";
                  const stateStyles = {
                    correct: "bg-success border-success text-white",
                    present: "bg-warning border-warning text-white",
                    absent: "bg-absent border-absent text-white",
                    empty: "bg-surface backdrop-blur-sm border border-border text-foreground",
                  };
                  return (
                    <div
                      key={col}
                      className={`${cellSize} h-14 flex items-center justify-center text-lg font-bold rounded border transition-colors ${stateStyles[state]}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <p className="text-lg">
          {buildResultMessage(won, jugador, target)}
        </p>

        <WordleStatsPanel stats={stats} shareText={shareText} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
      <div className="grid grid-rows-6 gap-1.5">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => {
          const guess = guesses[row] || null;
          const isCurrentRow = row === guesses.length;

          return (
            <div key={row} className="flex gap-1.5 justify-center">
              {Array.from({ length: wordLength }).map((_, col) => {
                let char = "";
                let state: LetterState = "empty";

                if (guess) {
                  char = guess.letters[col].char;
                  state = guess.letters[col].state;
                } else if (isCurrentRow) {
                  char = currentGuess[col] || "";
                }

                const stateStyles = {
                  correct: "bg-success border-success text-white",
                  present: "bg-warning border-warning text-white",
                  absent: "bg-absent border-absent text-white",
                  empty: state === "empty" && isCurrentRow && char
                    ? "bg-surface backdrop-blur-sm border border-primary/50 text-foreground"
                    : "bg-surface backdrop-blur-sm border border-border text-foreground",
                };

                return (
                  <div
                    key={col}
                    className={`${cellSize} h-14 flex items-center justify-center text-lg font-bold rounded border transition-colors ${
                      stateStyles[state]
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-16 w-full items-center justify-center px-4 text-center">
        {message ? (
          <div className="text-sm font-semibold bg-surface backdrop-blur-sm border border-border px-4 py-2 rounded-lg">
            {message}
          </div>
        ) : validationError ? (
          <p className="text-sm font-semibold text-error">{validationError}</p>
        ) : null}
      </div>

      {gameOver && <WordleStatsPanel stats={stats} shareText={shareText} />}

      <div className="flex flex-col items-center gap-1.5">
        {keyboardRows.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((key) => {
              if (key === "ENTER") {
                return (
                  <button
                    key={key}
                    onClick={submitGuess}
                    className="px-3 h-12 bg-key hover:bg-key-hover text-white text-xs font-bold rounded transition-colors"
                  >
                    ENTER
                  </button>
                );
              }
              if (key === "BACK") {
                return (
                  <button
                    key={key}
                    onClick={removeLetter}
                    className="px-3 h-12 bg-key hover:bg-key-hover text-white text-xs font-bold rounded transition-colors"
                  >
                    ←
                  </button>
                );
              }
              const kState = getKeyState(key);
              const keyBg = kState === "correct" ? "bg-success"
                : kState === "present" ? "bg-warning"
                : kState === "absent" ? "bg-absent"
                : "bg-key";

              return (
                <button
                  key={key}
                  onClick={() => addLetter(key)}
                  className={`w-9 h-12 ${keyBg} hover:brightness-110 text-white text-sm font-bold rounded transition-all`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
