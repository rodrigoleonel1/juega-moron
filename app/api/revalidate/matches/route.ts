import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season");

  if (season) {
    revalidateTag(`season-${season}`, "max");
  } else {
    revalidateTag("matches", "max");
  }

  return Response.json({ revalidated: true, season: season || "all" });
}
