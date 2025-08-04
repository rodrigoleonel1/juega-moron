import { Match } from "@/data/fixture";
import { formatMatchDate } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";

export function NextMatch({ match }: { match: Match }) {
  const formattedDate = formatMatchDate(match.datetime);
  return (
    <section>
      <article className="flex items-center">
        <img
          src="https://paladarnegro.net/escudoteca/argentina/primeranacional/png/moron.png"
          alt="Club Deportivo Morón"
          className="w-26 sm:w-30 -ml-6"
        />
        <article className="flex flex-col justify-between h-full">
          <div className="text-2xl font-bold tracking-tighter sm:text-3xl">
            <span className="inline">
              vs. {match.versus}
              <img
                src={`https://api.promiedos.com.ar/images/team/${match.id_prom}/1`}
                alt={match.versus}
                className="hidden h-8 w-8 align-middle sm:inline ml-1"
              />
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold sm:text-xl">
            <Calendar size={18} aria-hidden="true" />
            <span>{formattedDate.date}</span>
            <span>{formattedDate.time}hs.</span>
          </div>
          {match.isAway ? (
            <span className="sm:text-xl font-semibold flex items-center gap-1">
              <MapPin size={18} aria-hidden="true" />
              {match.estadio}
            </span>
          ) : (
            <span className="sm:text-xl font-semibold flex items-center gap-1">
              <MapPin size={18} aria-hidden="true" />
              Estadio Nuevo Francisco Urbano
            </span>
          )}
        </article>
      </article>
      <footer className="mt-6 flex justify-between font-semibold w-58">
        <a
          href={match.ficha_partido}
          rel="noopener noreferrer"
          target="_blank"
          className="hover:bg-black/60 hover:rounded-md p-2 hover:shadow-md transition-all"
          aria-label={`Ver ficha del partido contra ${match.versus}`}
        >
          Ficha partido
        </a>
        <div className="w-0.5 bg-white" role="separator" />
        <a
          href={match.ficha_rival}
          rel="noopener noreferrer"
          target="_blank"
          className="hover:bg-black/50 hover:rounded-md p-2 hover:shadow-md transition-all"
          aria-label={`Ver ficha de ${match.versus}`}
        >
          Ficha rival
        </a>
      </footer>
    </section>
  );
}
