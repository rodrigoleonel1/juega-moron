import type { Match } from "@/lib/types";
import Image from "next/image";
import { NextMatch } from "@/components/next-match";
import { CountdownDisplay } from "@/components/countdown-display";

interface NextMatchSectionProps {
  nextMatch: Match | null;
}

function SeasonEndedState() {
  return (
    <div className="card flex flex-col sm:flex-row items-center gap-4 p-6 max-w-xl">
      <Image
        src="/moron.png"
        alt="Club Deportivo Morón"
        width={64}
        height={64}
        className="w-16 h-16"
      />
      <div className="text-center sm:text-left">
        <h2 className="font-bold text-xl">Temporada finalizada</h2>
        <p className="text-muted text-sm">
          Volvé pronto para enterarte del próximo partido del Gallo.
        </p>
      </div>
    </div>
  );
}

function MatchFoundState({ match }: { match: Match }) {
  return (
    <div className="space-y-4">
      <CountdownDisplay match_date={match.datetime} />
      <NextMatch match={match} />
    </div>
  );
}

export function NextMatchSection({ nextMatch }: NextMatchSectionProps) {
  if (!nextMatch?.versus) return <SeasonEndedState />;

  return <MatchFoundState match={nextMatch} />;
}
