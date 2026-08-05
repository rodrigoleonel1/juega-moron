import type { Metadata } from "next";
import { WordleGame } from "@/components/wordle-game";
import { getDailyWord, getJugador } from "@/lib/wordle";

export const metadata: Metadata = {
  title: "Wordle - Juegos Morón",
  description: "Adiviná el apellido del jugador de Deportivo Morón.",
};

export const dynamic = "force-dynamic";

export default function WordlePage() {
  const target = getDailyWord();
  const jugador = getJugador(target);

  return (
    <section className="animate-fade-in mx-auto max-w-7xl">
      <h1 className="font-bold text-2xl sm:text-3xl tracking-tight text-center mb-8">
        Wordle <span className="text-primary">Morón</span>
      </h1>
      <WordleGame key={target} target={target} jugador={jugador ?? undefined} />

      <section className="mx-auto mt-8 mb-12 max-w-lg">
        <div className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-lg text-center">
            ¿Cómo se juega el Wordle de fútbol?
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted">
            <li>Adiviná el apellido de un jugador que juegue o haya jugado en Deportivo Morón.</li>
            <li>
              Tenés <span className="font-semibold text-foreground">6 intentos</span>{" "}
              para descubrirlo.
            </li>
            <li>
              Cada intento debe ser un apellido válido de la base de datos del club.
            </li>
            <li>
              Cambiás de palabra todos los días a la medianoche, hora argentina.
            </li>
          </ol>
          <div className="space-y-2 pt-1">
            <p className="text-sm font-semibold">Los colores indican:</p>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-success bg-success text-[10px] font-bold text-white">
                A
              </span>
              <span className="text-sm text-muted">
                La letra está en la posición correcta.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-warning bg-warning text-[10px] font-bold text-white">
                A
              </span>
              <span className="text-sm text-muted">
                La letra está en el apellido, pero en otra posición.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-absent bg-absent text-[10px] font-bold text-white">
                A
              </span>
              <span className="text-sm text-muted">
                La letra no está en el apellido.
              </span>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
