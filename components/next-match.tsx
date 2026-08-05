"use client";

import Image from "next/image";
import { Match } from "@/lib/types";
import { formatMatchDate } from "@/lib/utils";
import { MORON_TEAM_ID } from "@/lib/constants";
import { Calendar, MapPin } from "lucide-react";

export function NextMatch({ match }: { match: Match }) {
  const formattedDate = formatMatchDate(match.datetime);

  return (
    <section className="max-w-xl" aria-label={`Próximo partido contra ${match.versus}`}>
      <div className="bg-surface backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="bg-primary/5 px-4 py-3">
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="flex flex-col items-center text-center">
              <Image
                src={`https://api.promiedos.com.ar/images/team/${MORON_TEAM_ID}/1`}
                alt="Deportivo Morón"
                width={64}
                height={64}
                priority
                className="h-12 w-12 sm:h-16 sm:w-16"
              />
              <span className="text-xs font-semibold text-muted mt-1">Morón</span>
            </div>

            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary-light rounded-lg text-sm font-bold">
                VS
              </span>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 text-primary-light rounded text-xs font-medium border border-primary/20">
                  {match.competencia}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <Image
                src={`https://api.promiedos.com.ar/images/team/${match.id_prom}/1`}
                alt={match.versus}
                width={64}
                height={64}
                loading="lazy"
                className="h-12 w-12 sm:h-16 sm:w-16"
              />
              <span className="text-xs font-semibold text-muted mt-1">{match.versus}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted flex-wrap">
            <span className="inline-flex items-center gap-0.5">
              <Calendar size={14} aria-hidden="true" />
              <span className="font-medium">{formattedDate.date} — {formattedDate.time} hs.</span>
            </span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={14} aria-hidden="true" />
              <span className="font-medium">{match.isAway ? match.estadio : "Estadio Nuevo Francisco Urbano"}</span>
            </span>
          </div>

          <div className="flex gap-4 justify-center pt-1">
            <a
              href={match.ficha_partido}
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm font-medium text-muted underline underline-offset-2 decoration-foreground/30 hover:text-primary-light hover:decoration-primary transition-colors"
              aria-label={`Ver ficha del partido contra ${match.versus}`}
            >
              Ficha partido
            </a>
            <a
              href={match.ficha_rival}
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm font-medium text-muted underline underline-offset-2 decoration-foreground/30 hover:text-primary-light hover:decoration-primary transition-colors"
              aria-label={`Ver ficha de ${match.versus}`}
            >
              Ficha rival
            </a>
          </div>


        </div>
      </div>
    </section>
  );
}
