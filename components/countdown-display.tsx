"use client";

import { useEffect, useState } from "react";
import MatchScoreboard from "./match-scoreboard";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownDisplayProps {
  date: string;
  ficha_partido: string;
}

export function CountdownDisplay({
  date,
  ficha_partido,
}: CountdownDisplayProps) {
  const [countdownTargetDate, setCountdownTargetDate] = useState(new Date());
  const [live, setLive] = useState(false);

  const countdown = useCountdown(countdownTargetDate);

  useEffect(() => {
    const fetchData = async () => {
      setCountdownTargetDate(new Date(date));
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (countdown.isLive) {
      const timer = setTimeout(() => {
        setLive(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setLive(false);
    }
  }, [countdown.isLive]);

  if (live) {
    return <MatchScoreboard ficha_partido={ficha_partido} />;
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
