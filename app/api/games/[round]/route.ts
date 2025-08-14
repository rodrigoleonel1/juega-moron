import { NextResponse } from "next/server";

const BASE = "https://api.promiedos.com.ar/league/games/ebj/419_45_1_";

export const revalidate = 300;

export async function GET(
  _req: Request,
  { params }: { params: { round?: string } }
) {
  const round = params.round;
  if (!round || !/^\d+$/.test(round)) {
    return NextResponse.json(
      { error: "Parámetro de fecha/ronda inválido" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${BASE}${round}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "No se pudieron obtener los partidos de la fecha" },
        { status: 502 }
      );
    }
    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error inesperado al consultar partidos", detail: String(err) },
      { status: 500 }
    );
  }
}
