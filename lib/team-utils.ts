export function crestUrl(teamId?: string | null, variant = 1) {
  if (!teamId) return "";
  return `https://api.promiedos.com.ar/images/team/${encodeURIComponent(
    teamId
  )}/${variant}`;
}
