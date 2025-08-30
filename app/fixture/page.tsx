import { getMatches } from "@/actions/getMatches";
import Matches from "./components/matches";

export default async function FixturePage() {
  const matches = await getMatches();

  return (
    <>
      <h1 className="text-2xl font-semibold">Fixture temporada 2025</h1>
      <Matches matches={matches} />
    </>
  );
}
