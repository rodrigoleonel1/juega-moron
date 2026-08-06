"use client";

import { useState } from "react";
import { WordleStats as Stats, winPercentage } from "@/lib/wordle-stats";

const MAX_GUESSES = 6;

interface WordleStatsPanelProps {
  stats: Stats;
  shareText?: string;
}

export function WordleStatsPanel({ stats, shareText }: WordleStatsPanelProps) {
  const [copied, setCopied] = useState(false);

  const maxDist = Math.max(1, ...(stats.guessDistribution ?? []));

  const handleShare = async () => {
    if (!shareText) return;

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // clipboard puede no estar disponible; ignoramos
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card w-full p-5 space-y-4">
      <h3 className="font-bold text-center">Estadísticas</h3>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.played}</p>
          <p className="text-xs text-muted">Jugadas</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{winPercentage(stats)}%</p>
          <p className="text-xs text-muted">Acierto</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.currentStreak}</p>
          <p className="text-xs text-muted">Racha</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.maxStreak}</p>
          <p className="text-xs text-muted">Mejor racha</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold">Distribución de intentos</p>
        {Array.from({ length: MAX_GUESSES }).map((_, i) => {
          const count = (stats.guessDistribution ?? [])[i + 1] ?? 0;
          const width = count > 0 ? Math.round((count / maxDist) * 100) : 0;

          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-muted">{i + 1}</span>
              <div className="flex-1 bg-white/5 rounded-sm h-5 overflow-hidden">
                <div
                  className="bg-primary h-5 flex items-center justify-end px-1.5 transition-all"
                  style={{ width: `${width}%` }}
                >
                  {count > 0 && (
                    <span className="text-white font-semibold text-[11px]">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {shareText && (
        <button
          onClick={handleShare}
          aria-live="polite"
          className="w-full rounded-lg bg-primary text-white hover:bg-primary-hover py-2.5 text-sm font-semibold transition-colors cursor-pointer"
        >
          {copied ? "¡Copiado!" : "Compartir resultado"}
        </button>
      )}
    </div>
  );
}
