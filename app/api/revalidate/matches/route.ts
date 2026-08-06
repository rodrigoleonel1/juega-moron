import { revalidateTag } from "next/cache";
import { isSeason } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const seasonParam = searchParams.get("season");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  if (seasonParam && isSeason(seasonParam)) {
    revalidateTag(`season-${seasonParam}`, "max");
  } else {
    revalidateTag("matches", "max");
  }

  return Response.json({ revalidated: true, season: seasonParam || "all" });
}
