"use client";

import { useEffect, useState } from "react";
import MatchScoreboard from "./match-scoreboard";

interface CountdownDisplayProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  ficha_partido: string;
}

export function CountdownDisplay({
  days,
  hours,
  minutes,
  seconds,
  isLive,
  ficha_partido,
}: CountdownDisplayProps) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (isLive) {
      const timer = setTimeout(() => {
        setLive(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setLive(false);
    }
  }, [isLive]);

  if (live) {
    return <MatchScoreboard ficha_partido={ficha_partido} />;
  }

  const countdownItems = [
    { value: days.toString().padStart(2, "0"), label: "Días" },
    { value: hours.toString().padStart(2, "0"), label: "Horas" },
    { value: minutes.toString().padStart(2, "0"), label: "Minutos" },
    { value: seconds.toString().padStart(2, "0"), label: "Segundos" },
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
