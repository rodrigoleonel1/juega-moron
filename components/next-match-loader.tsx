import { connection } from "next/server";
import { MatchSchema } from "@/components/match-schema";
import { NextMatchSection } from "@/components/next-match-section";
import { getNextMatch } from "@/actions/getNextMatch";

export async function NextMatchLoader() {
  await connection();

  const nextMatch = await getNextMatch();

  return (
    <>
      <MatchSchema match={nextMatch} />
      <NextMatchSection nextMatch={nextMatch} />
    </>
  );
}
