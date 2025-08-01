import { getResultTextColor } from "@/lib/utils";
import { Match } from "@/data/fixture";
import { Plane, Home } from "lucide-react";

export function RecentMatches({ recentMatches }: { recentMatches: Match[] }) {
  return (
    <section className="max-w-lg pt-4">
      <h3 className="font-semibold">Últimos 5 partidos</h3>
      {recentMatches.map((match, index) => (
        <article
          key={index}
          className="flex items-center justify-between py-2 border-b-1 last:border-b-0"
        >
          <div className="flex items-center">
            {match.isAway ? (
              <Plane className="w-4 h-4 mr-2" />
            ) : (
              <Home className="w-4 h-4 mr-2" />
            )}
            <span>vs. {match.versus}</span>
          </div>

          <span
            className={`bg-black/60 rounded-md px-2 font-semibold ${getResultTextColor(
              match.result || ""
            )}`}
          >
            {match.result}
          </span>
        </article>
      ))}
    </section>
  );
}
