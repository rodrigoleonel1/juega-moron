import { getMatches } from "@/actions/getMatches";
import Matches from "./components/matches";

export default async function FixturePage() {
  const matches = await getMatches();

  return (
    <>
      <Matches matches={matches} />
    </>
  );
}
