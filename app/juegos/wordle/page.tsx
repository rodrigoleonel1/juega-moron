import type { Metadata } from "next";
import { WordleGame } from "@/components/wordle-game";
import { getDailyWord, getJugador } from "@/lib/wordle";

export const metadata: Metadata = {
  title: "Wordle - Juegos Morón",
  description: "Adiviná el apellido del jugador de Deportivo Morón.",
};

export default function WordlePage() {
  const target = getDailyWord();
  const jugador = getJugador(target);

  return (
    <section className="animate-fade-in mx-auto max-w-7xl">
      <h1 className="font-bold text-2xl sm:text-3xl tracking-tight text-center mb-8">
        Wordle <span className="text-primary">Morón</span>
      </h1>
      <WordleGame target={target} jugador={jugador ?? undefined} />
    </section>
  );
}
