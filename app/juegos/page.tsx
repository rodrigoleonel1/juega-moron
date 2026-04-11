import { getMatches } from "@/actions/getMatches";
import Game from "./components/game";

export default async function Page() {
  const matches = await getMatches();

  return <Game matches={matches} />;
}
