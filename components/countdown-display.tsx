"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { parseArgentinaDateTime } from "@/lib/argentina-date";

interface CountdownDisplayProps {
  match_date: string;
}

export function CountdownDisplay({
  match_date,
}: CountdownDisplayProps) {
  const countdown = useCountdown(parseArgentinaDateTime(match_date));

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
            Próximo partido en
          </h2>
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
        </div>
      </div>
    </section>
  );
}
