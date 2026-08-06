import { connection } from "next/server";
import { WordleGame } from "@/components/wordle-game";
import { getDailyWord, getJugador } from "@/lib/wordle";

export async function WordleLoader() {
  await connection();

  const target = getDailyWord();
  const jugador = getJugador(target);

  return <WordleGame key={target} target={target} jugador={jugador ?? undefined} />;
}
