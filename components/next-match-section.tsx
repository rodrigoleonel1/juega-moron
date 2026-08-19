import type { Match } from "@/lib/types";
import Image from "next/image";
import { NextMatchLive } from "@/components/next-match-live";

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

export function NextMatchSection({ nextMatch }: NextMatchSectionProps) {
  if (!nextMatch?.versus) return <SeasonEndedState />;

  return <NextMatchLive match={nextMatch} />;
}
