export function formatMatchDate(datetime: string) {
  const date = new Date(datetime);
  return {
    date: date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
    }),
    time: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function formatMatchDateFull(datetime: string) {
  const date = new Date(datetime);
  return {
    date: date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}


