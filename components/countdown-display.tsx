"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { parseArgentinaDateTime } from "@/lib/argentina-date";
import type { MatchLiveStatus } from "@/lib/promiedos";

interface CountdownDisplayProps {
  match_date: string;
  status?: MatchLiveStatus;
}

export function CountdownDisplay({
  match_date,
  status,
}: CountdownDisplayProps) {
  const matchStart = parseArgentinaDateTime(match_date);
  const countdown = useCountdown(matchStart);

  const hasStarted = new Date().getTime() >= matchStart.getTime();

  const countdownItems = [
    { value: countdown.days.toString().padStart(2, "0"), label: "Días" },
    { value: countdown.hours.toString().padStart(2, "0"), label: "Horas" },
    { value: countdown.minutes.toString().padStart(2, "0"), label: "Minutos" },
    { value: countdown.seconds.toString().padStart(2, "0"), label: "Segundos" },
  ];

  return (
    <section className="max-w-xl">
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5">
          <h2 className="font-display mb-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            {status === "finalizado" ? "Partido finalizado" : "Próximo partido en"}
          </h2>

          {hasStarted ? (
            <p className="text-center font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-red-400">
              <span
                aria-hidden="true"
                className={`inline-flex w-2 h-2 mr-2 rounded-full align-middle ${
                  status === "finalizado"
                    ? "bg-muted"
                    : "bg-red-500 animate-pulse"
                }`}
              />
              {status === "finalizado" ? "Finalizado" : "En vivo"}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {countdownItems.map((item, index) => (
                <div key={index} className="text-center overflow-hidden">
                  <p className="font-display font-bold text-5xl sm:text-6xl tabular-nums text-primary leading-none">
                    {item.value.split("").map((char, i) => (
                      <span
                        key={char + "-" + i}
                        className="animate-slide-up inline-block"
                      >
                        {char}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs text-muted font-medium mt-1.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
