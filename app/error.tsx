"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="animate-fade-in flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="bg-surface backdrop-blur-sm border border-border rounded-2xl p-8 max-w-md">
        <h1 className="font-bold text-2xl mb-2">Algo salió mal</h1>
        <p className="text-muted text-sm mb-6">
          No se pudieron cargar los datos. Puede ser un problema de conexión o
          que el servicio esté temporalmente caído.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary text-white hover:bg-primary-hover px-6 py-2 text-sm font-semibold transition-colors cursor-pointer"
        >
          Intentar de nuevo
        </button>
      </div>
    </section>
  );
}
