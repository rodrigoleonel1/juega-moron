export interface WordleStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastDateKey: string;
}

export const EMPTY_STATS: WordleStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [],
  lastDateKey: "",
};

const STATS_KEY = "wordle-moron-stats";

export function loadStats(): WordleStats {
  if (typeof window === "undefined") return EMPTY_STATS;

  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return EMPTY_STATS;

    const parsed = JSON.parse(raw) as Partial<WordleStats>;
    return { ...EMPTY_STATS, ...parsed, guessDistribution: parsed.guessDistribution ?? [] };
  } catch {
    return EMPTY_STATS;
  }
}

export function saveStats(stats: WordleStats): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordResult(
  stats: WordleStats,
  won: boolean,
  attempts: number,
  dateKey: string
): WordleStats {
  if (stats.lastDateKey === dateKey) return stats;

  const guessDistribution = [...(stats.guessDistribution ?? [])];
  if (won && attempts >= 1) {
    guessDistribution[attempts] = (guessDistribution[attempts] ?? 0) + 1;
  }

  const currentStreak = won ? stats.currentStreak + 1 : 0;

  return {
    played: stats.played + 1,
    won: stats.won + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    guessDistribution,
    lastDateKey: dateKey,
  };
}

export function winPercentage(stats: WordleStats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.won / stats.played) * 100);
}
