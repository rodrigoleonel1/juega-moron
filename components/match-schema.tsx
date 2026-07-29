import type { Match } from "@/lib/types";

export function MatchSchema({ match }: { match: Match | null }) {
  if (!match?.versus) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `Deportivo Morón vs ${match.versus}`,
          startDate: match.datetime,
          location: {
            "@type": "Place",
            name: match.estadio || "Estadio a confirmar",
          },
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          performer: [
            { "@type": "SportsTeam", name: "Deportivo Morón" },
            { "@type": "SportsTeam", name: match.versus },
          ],
          description: `Próximo partido: Deportivo Morón vs ${match.versus} el ${new Date(match.datetime).toLocaleDateString("es-AR")}`,
        }),
      }}
    />
  );
}
