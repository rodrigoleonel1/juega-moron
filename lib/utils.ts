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

export function getResultColor(result: string) {
  if (result.includes("(G)")) return "text-green-500";
  if (result.includes("(P)")) return "text-red-500";
  if (result.includes("(E)")) return "text-yellow-500";
  return "text-slate-600";
}
