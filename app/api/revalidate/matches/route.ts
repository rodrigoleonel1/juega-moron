import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("matches", "max");

  return Response.json({ revalidated: true });
}
