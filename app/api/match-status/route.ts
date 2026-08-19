import { getLiveMatch } from "@/lib/promiedos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competencia = searchParams.get("competencia") ?? "";
  const opponentId = searchParams.get("id_prom") ?? "";

  const match = await getLiveMatch({ competencia, opponentId });

  return Response.json({ match });
}
