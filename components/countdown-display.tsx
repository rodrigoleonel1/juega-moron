"use client";

import MatchScoreboard from "./match-scoreboard";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownDisplayProps {
  match_date: string;
  match_sheet: string;
}

export function CountdownDisplay({
  match_date,
  match_sheet,
}: CountdownDisplayProps) {
  const countdown = useCountdown(new Date(match_date));

  if (countdown.isLive) {
    return <MatchScoreboard match_sheet={match_sheet} />;
  }

  const countdownItems = [
    { value: countdown.days.toString().padStart(2, "0"), label: "Días" },
    { value: countdown.hours.toString().padStart(2, "0"), label: "Horas" },
    { value: countdown.minutes.toString().padStart(2, "0"), label: "Minutos" },
    { value: countdown.seconds.toString().padStart(2, "0"), label: "Segundos" },
  ];

  return (
    <section className="grid grid-cols-4 max-w-lg mt-6">
      {countdownItems.map((item, index) => (
        <article key={index} className="text-center">
          <p className="text-5xl sm:text-6xl font-bold tabular-nums">
            {item.value}
          </p>
          <p className="text-sm">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
