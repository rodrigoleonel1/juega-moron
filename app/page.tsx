import { RecentMatches } from "@/components/recent-matches";
import { NextMatch } from "@/components/next-match";
import { getNextMatch } from "@/actions/getNextMatch";
import { getRecentMatches } from "@/actions/getRecentMatches";
import { CountdownDisplay } from "@/components/countdown-display";

export default async function Home() {
  const nextMatch = await getNextMatch();
  const recentMatches = await getRecentMatches(5);

  const matchJsonLd = nextMatch
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `Deportivo Morón vs ${nextMatch.versus}`,
        startDate: nextMatch.datetime,
        location: {
          "@type": "Place",
          name: nextMatch.estadio || "Estadio a confirmar",
        },
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        performer: [
          { "@type": "SportsTeam", name: "Deportivo Morón" },
          { "@type": "SportsTeam", name: nextMatch.versus },
        ],
        description: `Próximo partido: Deportivo Morón vs ${
          nextMatch.versus
        } el ${new Date(nextMatch.datetime).toLocaleDateString("es-AR")}`,
      }
    : null;

  return (
    <>
      <title>Hoy juega Morón? - Próximo partido y resultados.</title>
      <meta
        name="description"
        content="Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y más sobre el Gallo."
      />
      {matchJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(matchJsonLd) }}
        />
      )}

      <section className="animate-fade-in">
        <header className="mb-6 max-w-xl">
            <h1 className="font-bold text-8xl tracking-tight leading-none">
              <span className="text-primary">Hoy</span>{" "}
              <span>juega</span>{" "}
              <span className="text-primary">Morón</span>
              <span>?</span>
            </h1>
        </header>

        {nextMatch ? (
          nextMatch.versus !== "" ? (
            <div className="space-y-4">
              <NextMatch match={nextMatch} />
              <CountdownDisplay
                match_date={nextMatch.datetime}
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-surface backdrop-blur-sm border border-border rounded-2xl max-w-xl">
              <img src="/moron.png" alt="Club Deportivo Morón" className="w-16 h-16" />
              <div className="text-center sm:text-left">
                <h2 className="font-bold text-xl">Sin partidos próximos</h2>
                <p className="text-muted text-sm">No hay partidos programados para disputarse próximamente.</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3 p-6 bg-surface backdrop-blur-sm border border-border rounded-2xl max-w-xl">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Cargando partido...</p>
          </div>
        )}
      </section>

      <section className="mt-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <RecentMatches recentMatches={recentMatches ?? []} />
      </section>
    </>
  );
}
