import { Match } from "@/data/fixture";
import { formatMatchDate } from "@/lib/utils";

export default function NextMatch({ match }: { match: Match }) {
  const formattedDate = formatMatchDate(match.datetime);
  return (
    <section>
      <div className="flex items-center">
        <div className="-ml-6">
          <img
            src={`https://paladarnegro.net/escudoteca/argentina/primeranacional/png/moron.png`}
            alt="Club Deportivo Morón"
            className="max-h-24"
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="text-2xl flex items-center font-bold">
            vs. {match.versus}
            <img
              src={`https://paladarnegro.net/escudoteca/argentina/primeranacional/png/${match.id_escudoteca}.png`}
              alt={match.versus}
              className="h-10"
            />
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span>{formattedDate.date}</span>
            <span>{formattedDate.time} Hs.</span>
          </div>
          {match.isAway ? (
            <span className="text-sm font-semibold">{match.estadio}</span>
          ) : (
            <span className="text-sm font-semibold">
              Estadio Nuevo Francisco Urbano
            </span>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-between font-semibold w-58">
        <a
          href={match.ficha_partido}
          className="hover:bg-black/50 hover:rounded-md p-2 hover:shadow-md transition-all"
        >
          Ficha partido
        </a>
        <p className="border"></p>
        <a
          href={match.ficha_rival}
          className="hover:bg-black/50 hover:rounded-md p-2 hover:shadow-md transition-all"
        >
          Ficha rival
        </a>
      </div>
    </section>
  );
}
