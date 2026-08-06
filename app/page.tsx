import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { RecentMatches } from "@/components/recent-matches";
import { NextMatchLoader } from "@/components/next-match-loader";
import { getNextMatch } from "@/actions/getNextMatch";
import { getRecentMatches } from "@/actions/getRecentMatches";
import { SITE_URL } from "@/lib/constants";

const RECENT_MATCHES_TO_SHOW = 5;

function NextMatchSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="card max-w-xl p-6 space-y-4 animate-pulse"
    >
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="flex items-center justify-center gap-3">
        <div className="h-16 w-16 rounded-full bg-white/10" />
        <div className="h-8 w-40 rounded bg-white/10" />
        <div className="h-16 w-16 rounded-full bg-white/10" />
      </div>
      <div className="h-4 w-48 rounded bg-white/10 mx-auto" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  await connection();

  const nextMatch = await getNextMatch();
  const description = nextMatch?.versus
    ? `Próximo partido: Deportivo Morón vs ${nextMatch.versus}`
    : "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y más sobre el Gallo.";

  return {
    title: nextMatch?.versus
      ? `Próximo partido: Deportivo Morón vs ${nextMatch.versus}`
      : undefined,
    description,
    openGraph: {
      title: nextMatch?.versus
        ? `Próximo partido: Deportivo Morón vs ${nextMatch.versus}`
        : "Hoy juega Morón?",
      description,
      url: SITE_URL,
      siteName: "Hoy juega Morón?",
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Hoy juega Morón?",
        },
      ],
    },
  };
}

export default async function Home() {
  const recentMatches = await getRecentMatches(RECENT_MATCHES_TO_SHOW);

  return (
    <>
      <section className="animate-fade-in">
        <header className="mb-6 max-w-xl">
          <h1 className="font-display text-8xl font-bold uppercase leading-[0.9] tracking-tight text-white">
            Hoy juega Morón?
          </h1>
        </header>

        <Suspense fallback={<NextMatchSkeleton />}>
          <NextMatchLoader />
        </Suspense>
      </section>

      <section className="mt-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <RecentMatches recentMatches={recentMatches ?? []} />
      </section>
    </>
  );
}
