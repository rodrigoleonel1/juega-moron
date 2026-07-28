import type { Metadata } from "next";
import { getMatches } from "@/actions/getMatches";
import Matches from "./components/matches";

export const metadata: Metadata = {
  title: "Fixture - Hoy juega Morón?",
  description:
    "Calendario completo de partidos de Deportivo Morón. Resultados, próximos partidos y más.",
  openGraph: {
    title: "Fixture - Hoy juega Morón?",
    description:
      "Calendario completo de partidos de Deportivo Morón. Resultados, próximos partidos y más.",
  },
};

export default async function FixturePage() {
  const matches = await getMatches();

  return (
    <>
      <Matches matches={matches} />
    </>
  );
}
