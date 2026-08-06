import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { formatMatchDateFull, getResultOutcome, RESULT_OUTCOME_CLASS } from "@/lib/utils";
import { Match } from "@/lib/types";
import { MORON_TEAM_ID } from "@/lib/constants";

export function FixtureCard({ match, priority = false }: { match: Match; priority?: boolean }) {
  const formatted = formatMatchDateFull(match.datetime);

  const outcome = getResultOutcome(match.result);
  const resultColor = outcome ? RESULT_OUTCOME_CLASS[outcome] : "text-primary";

  return (
    <article className="card overflow-hidden">
      <div className="grid grid-cols-3 items-center gap-2 p-4">
        <div className="flex flex-col items-center text-center gap-1">
          <Image
            src={`https://api.promiedos.com.ar/images/team/${MORON_TEAM_ID}/1`}
            alt="Deportivo Morón"
            width={48}
            height={48}
            priority={priority}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <span className="text-[10px] font-medium text-muted leading-tight">Morón</span>
        </div>

        <div className="text-center">
          {match.result ? (
            <span className={`font-bold text-lg sm:text-xl ${resultColor}`}>
              {match.result.split(" ")[0]}
            </span>
          ) : (
            <span className="font-display inline-block px-2 py-0.5 bg-primary/10 text-primary-light rounded text-xs font-bold uppercase">
              VS
            </span>
          )}
        </div>

        <div className="flex flex-col items-center text-center gap-1">
          <Image
            src={`https://api.promiedos.com.ar/images/team/${match.id_prom}/1`}
            alt={match.versus}
            width={48}
            height={48}
            loading="lazy"
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <span className="text-[10px] font-medium text-muted leading-tight">{match.versus}</span>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-1.5">
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted">
          <span className="bg-primary/5 px-1.5 py-0.5 rounded">{match.competencia}</span>
          <span>·</span>
          <span>{match.fecha}</span>
        </div>
        <p className="text-[11px] text-muted text-center">
          {formatted.date} — {formatted.time} hs.
        </p>
      </div>

      <div className="px-4 pb-4">
        {match.result ? (
          <div className="flex gap-1.5">
            {match.youtube && (
              <a
                href={match.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver resumen del partido contra ${match.versus}`}
                className="flex-1 text-center rounded-lg bg-primary text-white hover:bg-primary-hover py-1.5 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1"
              >
                Resumen
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            )}
            {match.ficha_partido && (
              <a
                href={match.ficha_partido}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg bg-black/20 backdrop-blur-sm border border-border text-foreground hover:bg-surface-hover py-1.5 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1"
              >
                Ficha
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-primary/10 text-primary-light py-1.5 text-xs font-semibold text-center border border-primary/20">
            Próximamente
          </div>
        )}
      </div>
    </article>
  );
}
