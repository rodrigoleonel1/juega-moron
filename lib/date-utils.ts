export function formatDDMM(input?: string | number | Date): string {
  if (!input) return "-";

  // Manejo específico para strings comunes del upstream
  if (typeof input === "string") {
    const s = input.trim();

    // 1) dd[-|/]MM[-|/]YYYY ...
    let m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (m) {
      const dd = pad2(m[1]);
      const mm = pad2(m[2]);
      return `${dd}/${mm}`;
    }

    // 2) YYYY[-|/]MM[-|/]DD ...
    m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (m) {
      const dd = pad2(m[3]);
      const mm = pad2(m[2]);
      return `${dd}/${mm}`;
    }

    // 3) Captura genérica del primer patrón dd[-|/]MM en cualquier lugar del string
    m = s.match(/(?:^|\s)(\d{1,2})[/-](\d{1,2})(?:\D|$)/);
    if (m) {
      const dd = pad2(m[1]);
      const mm = pad2(m[2]);
      return `${dd}/${mm}`;
    }
  }

  // Fallback: intentar parsear como Date (ISO/u otros) y formatear
  try {
    const d =
      typeof input === "string"
        ? new Date(input.replace(" ", "T"))
        : new Date(input);

    if (!Number.isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}`;
    }
  } catch {
    // ignore
  }

  // Último recurso: devolver el input tal cual (evita crashear)
  return String(input);
}

function pad2(n: string | number) {
  return String(n).padStart(2, "0");
}
