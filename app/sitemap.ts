import type { MetadataRoute } from "next";
import { getMatches } from "@/actions/getMatches";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://juegamoron.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/fixture`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const matches = await getMatches();
    const matchPages: MetadataRoute.Sitemap = matches.map((match) => ({
      url: `${baseUrl}/fixture`,
      lastModified: new Date(match.datetime),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
    return [...staticPages, ...matchPages];
  } catch {
    return staticPages;
  }
}
