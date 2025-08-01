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

export function getResultTextColor(result: string) {
  if (result.includes("(G)")) return "text-green-600";
  if (result.includes("(P)")) return "text-red-600";
  if (result.includes("(E)")) return "text-yellow-500";
  return "text-blue-700";
}

export function getResultBgColor(result: string) {
  if (result.includes("(G)")) return "bg-green-600";
  if (result.includes("(P)")) return "bg-red-600";
  if (result.includes("(E)")) return "bg-yellow-500 ";
  return "bg-blue-100 text-blue-700";
}
