const MORON_TEAM_ID = "hbba";
const AFTER_KICKOFF_MS = 3 * 60 * 60 * 1000;
const OVERDUE_THROTTLE_MS = 12 * 60 * 60 * 1000; // 12h - mínimo llamadas a promiedos para rescatar stales de días anteriores
const TZ = "America/Argentina/Buenos_Aires";
const SITE_URL = "https://juegamoron.vercel.app";

const LEAGUE_URLS = {
  "primera nacional": "https://www.promiedos.com.ar/league/primera-nacional/ebj",
  "copa argentina": "https://www.promiedos.com.ar/league/copa-argentina/gea",
};

// Trigger recomendado: cada 10 minutos (no cada 1 min) para minimizar llamadas y evitar "Exceeded maximum execution time"
// Apps Script -> Triggers -> updateLiveResults -> Time-driven -> Every 10 minutes
function updateLiveResults() {
  const lock = LockService.getScriptLock();
  // Evita solapamiento: si ya hay una ejecución corriendo, salir en 5s
  if (!lock.tryLock(5000)) {
    console.log("updateLiveResults: otra ejecución en curso, skip");
    return;
  }
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("TEMP26");
    if (!sheet) {
      console.log("TEMP26 no encontrada");
      return;
    }

    // true si se escribió al menos un resultado nuevo
    if (processSheet(sheet)) {
      revalidateTag("matches");
      revalidateTag("standings");
    }
  } finally {
    lock.releaseLock();
  }
}

// Para usar como trigger independiente cada 10min si querés
// que /posiciones se refresque aunque no haya nuevos resultados
function RevalidateStandings() { revalidateTag("standings"); }
function RevalidateMatches() { revalidateTag("matches"); }

function revalidateTag(tag) {
  const secret = PropertiesService.getScriptProperties().getProperty("REVALIDATE_SECRET");
  if (!secret) {
    console.log("revalidateTag(" + tag + "): falta REVALIDATE_SECRET");
    return;
  }
  const endpoint = tag === "standings" ? "/api/revalidate/standings" : "/api/revalidate/matches";
  const url = SITE_URL + endpoint + "?secret=" + encodeURIComponent(secret);
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    console.log("revalidateTag(" + tag + ") ->", res.getResponseCode(), res.getContentText().slice(0, 200));
  } catch (e) {
    console.log("revalidateTag(" + tag + ") fallo: " + e);
  }
}

// kickoff <= now <= kickoff+3h -> ventana live normal
function isDue(datetime) {
  const kickoff = parseSheetDateTime(datetime);
  if (!kickoff) return true;
  const now = Date.now();
  const kickoffMs = kickoff.getTime();
  return kickoffMs <= now && now <= kickoffMs + AFTER_KICKOFF_MS;
}

// kickoff <= now (pero fuera de ventana 3h) -> overdue, rescatar solo cada 12h
function isOverdue(datetime) {
  const kickoff = parseSheetDateTime(datetime);
  if (!kickoff) return false;
  const now = Date.now();
  return kickoff.getTime() <= now && now > kickoff.getTime() + AFTER_KICKOFF_MS;
}

function shouldCheckOverdue() {
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty("lastOverdueCheck") || "0");
  const now = Date.now();
  if (now - last < OVERDUE_THROTTLE_MS) return false;
  props.setProperty("lastOverdueCheck", String(now));
  return true;
}

function parseSheetDateTime(datetime) {
  const m = String(datetime || "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return null;
  // Proyecto debe estar en TZ = America/Argentina/Buenos_Aires (GMT-03:00) para que new Date() interprete bien
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0);
}

function processSheet(sheet) {
  const values = sheet.getDataRange().getValues();
  const header = values[0];
  const col = (name) => header.indexOf(name) + 1;

  const versusCol = col("versus");
  const idPromCol = col("id_prom");
  const datetimeCol = col("datetime");
  const fichaCol = col("ficha_partido");
  const resultCol = col("result");
  const competenciaCol = col("competencia");

  if (!versusCol || !resultCol || !datetimeCol) return false;

  const duePending = [];
  const overduePending = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const versus = String(row[versusCol - 1] ?? "").trim();
    const result = String(row[resultCol - 1] ?? "").trim();
    if (versus && result === "") {
      const datetime = String(row[datetimeCol - 1] ?? "").trim();
      // 0 fetches si el partido aún no empezó (futuro) -> no consultar promiedos
      const kickoff = parseSheetDateTime(datetime);
      if (!kickoff) continue;
      if (kickoff.getTime() > Date.now()) continue; // aún no empezó, no gastar fetch
      if (isDue(datetime)) {
        duePending.push({
          rowIndex: i + 1,
          idProm: String(row[idPromCol - 1] ?? "").trim(),
          datetime: datetime,
          ficha: String(row[fichaCol - 1] ?? "").trim(),
          competencia: String(row[competenciaCol - 1] ?? "").trim(),
        });
      } else if (isOverdue(datetime)) {
        overduePending.push({
          rowIndex: i + 1,
          idProm: String(row[idPromCol - 1] ?? "").trim(),
          datetime: datetime,
          ficha: String(row[fichaCol - 1] ?? "").trim(),
          competencia: String(row[competenciaCol - 1] ?? "").trim(),
        });
      }
    }
  }

  // Early exit 0 fetches: sin pendientes empezados no llamar a promiedos
  if (duePending.length === 0 && overduePending.length === 0) return false;

  // Throttle overdue: si hay overdue pero ya consultamos hace <12h, solo procesar due
  let pending = duePending;
  if (overduePending.length > 0) {
    if (shouldCheckOverdue()) {
      console.log("Overdue check habilitado (" + overduePending.length + " stales) -> consultando promiedos");
      pending = duePending.concat(overduePending);
    } else {
      console.log("Overdue throttled (" + overduePending.length + " stales), solo due=" + duePending.length);
      if (duePending.length === 0) return false;
    }
  }

  // cache por competencia para no fetchear 5 veces la misma liga (1 fetch por competencia por ejecución)
  const leagueCache = {};
  function getCachedGames(comp) {
    const key = (comp || "").trim().toLowerCase();
    if (!(key in leagueCache)) leagueCache[key] = fetchMoronGames(comp);
    return leagueCache[key];
  }

  let changed = false;
  for (const p of pending) {
    let result = null;

    if (p.ficha) {
      const game = fetchGame(p.ficha);
      if (game) result = findResult([game], p);
    }
    if (!result && p.competencia) {
      const games = getCachedGames(p.competencia);
      if (games) result = findResult(games, p);
    }

    if (result) {
      sheet.getRange(p.rowIndex, resultCol).setValue(result);
      console.log("Fila " + p.rowIndex + ": " + result);
      changed = true;
      Utilities.sleep(200);
    }
  }
  if (changed) SpreadsheetApp.flush();
  return changed;
}

function fetchGame(url) {
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36" },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) return null;
    const data = parseNextData(res.getContentText());
    return data?.props?.pageProps?.initialData?.game || null;
  } catch (e) {
    console.log("fetchGame fallo (" + url + "): " + e);
    return null;
  }
}

function fetchMoronGames(competencia) {
  const url = LEAGUE_URLS[(competencia || "").trim().toLowerCase()];
  if (!url) return null;
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36" },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) return null;
    const data = parseNextData(res.getContentText());
    const filters = data?.props?.pageProps?.data?.games?.filters || [];
    const games = [];
    for (const filter of filters) {
      for (const game of filter?.games || []) {
        const teams = game?.teams || [];
        if (teams.some((t) => t.id === MORON_TEAM_ID)) games.push(game);
      }
    }
    return games;
  } catch (e) {
    console.log("fetchMoronGames fallo (" + competencia + "): " + e);
    return null;
  }
}

function parseNextData(html) {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const jsonStart = start + marker.length;
  const end = html.indexOf("</script>", jsonStart);
  if (end === -1) return null;
  try {
    return JSON.parse(html.slice(jsonStart, end));
  } catch (e) {
    console.log("parseNextData JSON fallo: " + e);
    return null;
  }
}

function findResult(games, p) {
  const normalizedTime = normalizeTime(p.datetime);
  for (const game of games) {
    const isFinal = game.status && (game.status.enum === 3 || String(game.status.name || "").toLowerCase().indexOf("final") !== -1);
    if (!isFinal) continue;

    const teams = game.teams || [];
    const moronIndex = teams.findIndex((t) => t.id === MORON_TEAM_ID);
    if (moronIndex === -1) continue;

    const matchesRival = p.idProm && teams.some((t) => t.id === p.idProm);
    const matchesTime = !p.idProm && normalizedTime && normalizeTime(game.start_time || "") === normalizedTime;
    if (!matchesRival && !matchesTime) continue;

    const scores = game.scores || [];
    if (!Array.isArray(scores) || scores.length < 2) continue;

    const moronScore = moronIndex === 0 ? scores[0] : scores[1];
    const rivalScore = moronIndex === 0 ? scores[1] : scores[0];
    const outcome = moronScore > rivalScore ? "G" : moronScore === rivalScore ? "E" : "P";
    return moronScore + "-" + rivalScore + " (" + outcome + ")";
  }
  return null;
}

function normalizeTime(datetime) {
  const m = String(datetime || "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (m) return m[1] + "-" + m[2] + "-" + m[3] + " " + m[4] + ":" + m[5];
  const p = String(datetime || "").match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (p) return p[3] + "-" + p[2] + "-" + p[1] + " " + p[4] + ":" + p[5];
  return "";
}
