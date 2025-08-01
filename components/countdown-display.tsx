interface CountdownDisplayProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownDisplay({
  days,
  hours,
  minutes,
  seconds,
}: CountdownDisplayProps) {
  const countdownItems = [
    { value: days.toString().padStart(2, "0"), label: "Días" },
    { value: hours.toString().padStart(2, "0"), label: "Horas" },
    { value: minutes.toString().padStart(2, "0"), label: "Minutos" },
    { value: seconds.toString().padStart(2, "0"), label: "Segundos" },
  ];

  return (
    <section className="grid grid-cols-4 max-w-lg">
      {countdownItems.map((item, index) => (
        <article key={index} className="text-center">
          <p className="text-4xl sm:text-6xl font-bold tabular-nums">{item.value}</p>
          <p className="text-sm">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
