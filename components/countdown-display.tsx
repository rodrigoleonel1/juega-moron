interface CountdownDisplayProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

export function CountdownDisplay({
  days,
  hours,
  minutes,
  seconds,
  isLive,
}: CountdownDisplayProps) {
  if (isLive) {
    return (
      <div className="bg-black/60 text-white rounded-md shadow-md max-w-lg text-center py-4">
        <h3 className="text-2xl font-bold">🔴JUGANDO EN VIVO</h3>
        <p className="text-sm opacity-90">El partido está en curso</p>
      </div>
    );
  }

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
          <p className="text-5xl sm:text-6xl font-bold tabular-nums">
            {item.value}
          </p>
          <p className="text-sm">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
