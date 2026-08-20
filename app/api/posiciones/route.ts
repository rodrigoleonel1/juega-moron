import { connection } from "next/server";
import { getStandings, serializeStandingsPayload } from "@/lib/promiedos";

export async function GET() {
  await connection();

  const result = await getStandings({ competencia: "Primera Nacional" });

  if (!result) {
    return Response.json(
      { standings: null, liveByTeam: {}, activity: { hasLive: false, nextStartAt: null } },
      { status: 503 },
    );
  }

  return Response.json(serializeStandingsPayload(result));
}