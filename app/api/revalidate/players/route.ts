import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("players");

  return Response.json({ revalidated: true });
}
