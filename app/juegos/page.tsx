import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Juegos - Hoy juega Morón?",
  description:
    "Juegos de fútbol de Deportivo Morón. Wordle, trivias y más.",
};

export default function JuegosPage() {
  return (
    <section className="animate-fade-in mx-auto max-w-7xl">
      <h1 className="font-bold text-3xl sm:text-4xl tracking-tight mb-8">
        Juegos <span className="text-primary">Morón</span>
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/juegos/wordle"
          className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-white/5 transition-colors block"
        >
          <h2 className="font-bold text-xl mb-2">Wordle</h2>
          <p className="text-sm text-muted">
            Adiviná el apellido de un jugador de Morón.
          </p>
        </Link>
      </div>
    </section>
  );
}
