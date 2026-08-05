import { getMatches } from "@/actions/getMatches";
import { ARGENTINA_TIME_ZONE, parseArgentinaDateTime } from "@/lib/argentina-date";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  const baseUrl = SITE_URL;

  try {
    const matches = await getMatches();
    const items = matches
      .sort(
        (a, b) =>
          parseArgentinaDateTime(b.datetime).getTime() -
          parseArgentinaDateTime(a.datetime).getTime()
      )
      .slice(0, 20)
      .map(
        (m) => `
    <item>
      <title>${m.versus ? `Deportivo Morón vs ${m.versus}` : "Partido de Deportivo Morón"}</title>
      <link>${baseUrl}/fixture</link>
      <description>${m.result ? `Resultado: ${m.result}` : `Próximo partido: ${parseArgentinaDateTime(m.datetime).toLocaleDateString("es-AR", { timeZone: ARGENTINA_TIME_ZONE })}`}</description>
      <pubDate>${parseArgentinaDateTime(m.datetime).toUTCString()}</pubDate>
    </item>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Hoy juega Morón?</title>
    <link>${baseUrl}</link>
    <description>Partidos, resultados y fixture de Deportivo Morón</description>
    <language>es-ar</language>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600",
      },
    });
  } catch {
    return new Response("<rss version='2.0'><channel><title>Hoy juega Morón?</title></channel></rss>", {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
