import Head from "next/head";
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
      <Head>
        <title>Hoy juega Morón? - Próximo partido y resultados</title>
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
      </Head>
      <main className="lg:ml-10 space-y-6">
        <header>
          <h1 className="font-bold tracking-tighter text-6xl sm:text-8xl mt-6 max-w-xl">
            Hoy juega Morón?
          </h1>
        </header>
        <section>
          {nextMatch ? (
            <>
              <NextMatch match={nextMatch} />
              <CountdownDisplay
                match_date={nextMatch.datetime}
                match_sheet={nextMatch.ficha_partido}
              />
            </>
          ) : (
            <div className="text-center mt-2 py-8 bg-black/50 rounded-md shadow-md max-w-lg">
              <h2 className="text-2xl font-bold">Cargando partido...</h2>
            </div>
          )}
        </section>
        <section>
          <RecentMatches recentMatches={recentMatches ?? []} />
        </section>
      </main>
    </>
  );
}
