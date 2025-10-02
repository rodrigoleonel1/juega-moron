import { Calendar, Clock, Home, Plane, Ticket } from "lucide-react";
import { formatMatchDateFull, getResultBgColor } from "@/lib/utils";
import { Match } from "@/lib/types";

export function FixtureCard({ match }: { match: Match }) {
  const formatted = formatMatchDateFull(match.datetime);

  return (
    <article className="bg-black/60 p-4 rounded-md shadow-md space-y-4">
      {match.result ? (
        <header
          className={`text-lg rounded-md font-semibold py-1 flex gap-2 justify-center items-center ${getResultBgColor(
            match.result
          )} `}
        >
          <img
            src="https://api.promiedos.com.ar/images/team/hbba/1"
            alt="Deportivo Morón"
            className="h-8 w-8"
          />
          <span>{match.result.split(" ")[0]}</span>
          <img
            src={`https://api.promiedos.com.ar/images/team/${match.id_prom}/1`}
            alt={match.versus}
            className="h-8"
          />
        </header>
      ) : (
        <header className="bg-blue-100 text-blue-700 text-lg rounded-md font-semibold py-1 flex gap-2 justify-center items-center">
          <img
            src="https://api.promiedos.com.ar/images/team/hbba/1"
            alt="Deportivo Morón"
            className="h-8 w-8"
          />
          <span>vs.</span>
          <img
            src={`https://api.promiedos.com.ar/images/team/${match.id_prom}/1`}
            alt={match.versus}
            className="h-8 w-8"
          />
        </header>
      )}

      <div className="font-medium flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <Ticket className="w-4 h-4" aria-hidden="true" />
          <span>
            {match.competencia}, {match.fecha}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>{formatted.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span>{formatted.time} hs.</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {match.isAway ? (
            <Plane className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Home className="w-4 h-4" aria-hidden="true" />
          )}
          <span>{match.isAway ? "Visitante" : "Local"}</span>
        </div>
      </div>

      {match.result ? (
        <footer className="grid gap-2 grid-cols-2">
          {match.youtube && (
            <a
              href={match.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver resumen del partido contra ${match.versus}`}
              className="w-full text-center rounded-md bg-white text-black hover:bg-white/80 p-1 font-semibold"
            >
              Resumen
            </a>
          )}
          {match.ficha_partido && (
            <a
              href={match.ficha_partido}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver ficha del partido contra ${match.versus}`}
              className="w-full text-center rounded-md bg-white text-black hover:bg-white/80 p-1 font-semibold"
            >
              Ficha
            </a>
          )}
        </footer>
      ) : (
        <footer className="bg-blue-100 text-blue-700 rounded-md font-semibold p-1 text-center">
          Próximamente
        </footer>
      )}
    </article>
  );
}
