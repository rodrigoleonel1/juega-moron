import { Match } from "@/lib/types";
import { Plane, Home } from "lucide-react";

export function RecentMatches({ recentMatches }: { recentMatches: Match[] }) {
  return (
    <section className="max-w-xl">
      <h3 className="font-bold text-lg mb-3">Últimos 5 partidos</h3>
      <div className="bg-surface backdrop-blur-sm border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {recentMatches.length > 0 ? (
          recentMatches.map((match) => (
            <div
              key={match.datetime}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {match.isAway ? (
                  <Plane size={14} className="text-muted shrink-0" aria-hidden="true" />
                ) : (
                  <Home size={14} className="text-muted shrink-0" aria-hidden="true" />
                )}
                <span className="text-sm font-medium">vs. {match.versus}</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  match.result?.includes("(G)")
                    ? "text-success"
                    : match.result?.includes("(P)")
                    ? "text-error"
                    : match.result?.includes("(E)")
                    ? "text-warning"
                    : "text-muted"
                }`}
              >
                {match.result || "—"}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-muted text-sm">
            No hay partidos recientes
          </div>
        )}
      </div>
    </section>
  );
}
