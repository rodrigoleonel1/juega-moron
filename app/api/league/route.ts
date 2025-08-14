import { NextResponse } from "next/server";

const UPSTREAM = "https://api.promiedos.com.ar/league/tables_and_fixtures/ebj";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter");
    const filterIndex = url.searchParams.get("filterIndex");

    const upstreamUrl = new URL(UPSTREAM);

    if (filter) {
      upstreamUrl.searchParams.set("games_filter", filter);
      upstreamUrl.searchParams.set("games_filter_key", filter);
      upstreamUrl.searchParams.set("filter", filter);
    }
    if (filterIndex) {
      upstreamUrl.searchParams.set("games_filter_index", filterIndex);
      upstreamUrl.searchParams.set("filter_index", filterIndex);
      upstreamUrl.searchParams.set("index", filterIndex);
    }

    const res = await fetch(upstreamUrl.toString(), {
      next: { revalidate: 10 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al obtener datos de la liga" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error inesperado al consultar la API", detail: String(err) },
      { status: 500 }
    );
  }
}
