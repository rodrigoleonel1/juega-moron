import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const season = searchParams.get("season");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  if (season) {
    revalidateTag(`season-${season}`, "max");
  } else {
    revalidateTag("matches", "max");
  }

  return Response.json({ revalidated: true, season: season || "all" });
}
