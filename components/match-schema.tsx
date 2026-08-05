import type { Match } from "@/lib/types";
import { ARGENTINA_TIME_ZONE, parseArgentinaDateTime } from "@/lib/argentina-date";

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
          description: `Próximo partido: Deportivo Morón vs ${match.versus} el ${parseArgentinaDateTime(match.datetime).toLocaleDateString("es-AR", { timeZone: ARGENTINA_TIME_ZONE })}`,
        }),
      }}
    />
  );
}
