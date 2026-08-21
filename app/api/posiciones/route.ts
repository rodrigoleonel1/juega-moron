import { connection } from "next/server";
import { getStandings, serializeStandingsPayload } from "@/lib/promiedos";

export async function GET() {
  await connection();

  const result = await getStandings({ competencia: "Primera Nacional" });

  if (!result) {
    return Response.json(
      { standings: null, liveByTeam: {}, activity: { hasLive: false, nextStartAt: null } },
      { status: 503, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  }

  return Response.json(serializeStandingsPayload(result), {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}