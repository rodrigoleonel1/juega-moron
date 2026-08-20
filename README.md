# Hoy juega Morón?

Sitio de fans del Club Deportivo Morón que responde la pregunta más importante del hincha: **¿cuándo juega el Gallo?**

Incluye próximo partido con countdown, resultados recientes, fixture completo por temporada, un Wordle de jugadores y feeds (RSS/sitemap). Los datos se cargan desde una Google Sheet pública que se edita a mano tras cada fecha.

## Stack

- **Next.js 16** (App Router + Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **pnpm** (gestor de paquetes)
- **Vitest** para tests

## Requisitos

- Node.js >= 20
- pnpm

## Configuración

1. Instalá las dependencias:

```bash
pnpm install
```

2. Creá `.env.local` a partir del ejemplo:

```bash
cp .env.example .env.local
```

3. Completá las variables:

| Variable                 | Descripción                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `SHEETS_BASE_URL`        | URL base pública de la Google Sheet con los partidos (sin `gid` ni `output`) |
| `REVALIDATE_SECRET`      | Token para autenticar el endpoint de revalidación                           |
| `NEXT_PUBLIC_SITE_URL`   | URL pública del sitio (por defecto `https://juegamoron.vercel.app`)         |

## Desarrollo

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando          | Descripción                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo (Turbopack)   |
| `pnpm build`     | Build de producción                  |
| `pnpm start`     | Servidor de producción               |
| `pnpm lint`      | ESLint                               |
| `pnpm test`      | Tests con Vitest                     |

## Tests

```bash
pnpm test
```

Los tests viven en `tests/` y cubren el parseo de datos de la hoja, la selección del próximo partido, los resultados recientes y la lógica del Wordle. El alias `@/` y `SHEETS_BASE_URL` para tests se configuran en `vitest.config.ts`.

## Fuente de datos

Los partidos salen de una **Google Sheet pública** publicada como página web (`SHEETS_BASE_URL`). Cada temporada es una hoja dentro del documento (gids en `actions/getMatches.ts`), exportada como TSV y parseada por `actions/getMatches.ts`.

### Actualizar los resultados

1. Editá la hoja correspondiente.
2. El caché se invalida automáticamente de dos formas:
   - **Webhook**: un Apps Script (`RevalidateMatches`) disparado al modificar la hoja llama a `/api/revalidate/matches?secret=...`.
   - **Respaldo**: los fetch usan tags de revalidación para regeneración bajo demanda.

> `SHEETS_BASE_URL`, `REVALIDATE_SECRET` y `NEXT_PUBLIC_SITE_URL` deben estar definidos en el entorno de producción (Vercel → Settings → Environment Variables).

### Estado en vivo (opcional, automático)

Además de la edición manual, el sitio muestra el estado del partido **en vivo** (próximamente / en vivo / finalizado) consultando **promiedos** (`lib/promiedos.ts`), el mismo proveedor de los escudos. No requiere API key:

- `/api/match-status?competencia=...&id_prom=...` devuelve `{ match: { status, score, ... } }` desde el `__NEXT_DATA__` de la página de la liga.
- La home hace polling de ese endpoint solo cerca del horario del partido (`hooks/use-match-status.ts`) y muestra marcador en vivo o "Finalizado — cargando resultado".
- El resultado **final** se persiste en la Google Sheet (fuente de verdad definitiva); el estado en vivo es solo lectura de promiedos.

### Tabla de posiciones y resultados en vivo

La página `/posiciones` muestra la tabla de la **Primera Nacional** (`tables_groups` del mismo `__NEXT_DATA__` de promiedos) con las zonas separadas, últimas 5 fechas por equipo y resultados en vivo. Los partidos en vivo se cruzan por **id de equipo** desde `games.filters` del mismo payload, sin llamadas extra: cada club muestra un badge con su marcador (verde si va ganando, rojo si va perdiendo, ámbar si empata).

El refresco es adaptativo (`components/posiciones-live.tsx`): el primer render sale del server (`"use cache"`), y después un componente cliente hace `fetch` a `/api/posiciones` (JSON) sin peticiones RSC — con partidos en vivo o próximos dentro de 24 h cada 2 min; sin partidos cerca, agenda un único despertar 3 h antes del próximo inicio (`nextStartAt` de `extractMatchActivity`); y si promiedos aún no publica la próxima fecha, cae a un heartbeat de 1 h para descubrirla.

**Mapa de competencias** (`lib/promiedos.ts`): cada competencia se mapea a su URL de liga de promiedos. Si agregás una competencia nueva en la hoja, sumá la entrada al mapa (y al Apps Script).

#### Auto-carga del resultado con Apps Script (sin doPost)

Para que el resultado se cargue solo a la hoja al terminar el partido (aunque nadie visite el sitio):

1. En el proyecto de Apps Script asociado a la hoja, agregá una función `updateLiveResults()` que:
   - lea la fila del partido sin resultado (usa su `competencia` e `id_prom`),
   - consulte la página de liga de promiedos con `UrlFetchApp.fetch`,
   - extraiga el `__NEXT_DATA__` y encuentre el partido de Morón (`id: "hbba"`),
   - si el estado es `Finalizado` y la celda `result` está vacía, escriba `"X-Y (G/E/P)"` (X = Morón, Y = rival, `(G/E/P)` según el ganador),
   - llame a `https://juegamoron.vercel.app/api/revalidate/matches?secret=...` para invalidar el caché.
2. Configurá un **trigger** una sola vez: Apps Script → *Triggers* → *+ Agregar trigger* → `updateLiveResults` → *Time-driven* → cada 1 minuto. Después es 100% automático.

> El `secret` de revalidación va en el código del Apps Script, no en el repo.

## Arquitectura

```
app/           Rutas, layout, metadata, API routes y PWA manifest
actions/       Server actions: lectura de la Google Sheet y lógica de partidos
components/    UI (countdown, fixture, próximo partido, wordle, ...)
lib/           Tipos, constantes, utilidades de fecha/hora Argentina y wordle
hooks/         Custom hooks de cliente (countdown)
public/        Assets estáticos + service worker (PWA offline)
tests/         Tests de Vitest
```

### Endpoints

| Ruta                           | Descripción                                             |
| ------------------------------ | ------------------------------------------------------- |
| `/`                            | Próximo partido + resultados recientes                  |
| `/fixture`                     | Calendario completo por temporada                       |
| `/posiciones`                  | Tabla de posiciones de la Primera Nacional con en vivo  |
| `/juegos`                      | Índice de juegos                                        |
| `/juegos/wordle`               | Wordle de apellidos de jugadores del club               |
| `/api/revalidate/matches`      | Revalidación on-demand del caché (requiere `secret`)    |
| `/api/match-status`            | Estado en vivo del partido desde promiedos (`?competencia=` y `?id_prom=`) |
| `/rss.xml`                     | Feed RSS con los últimos partidos                       |
| `/sitemap.xml`                 | Sitemap                                                 |
| `/manifest.webmanifest`        | Manifest de la PWA                                      |

### PWA

La app es instalable y funciona offline con un service worker (`public/sw.js`). Al cambiar el shell (HTML/CSS/JS), incrementá la versión de `CACHE_NAME` en ese archivo para forzar la actualización en los clientes.

## Deploy

La forma más simple es [Vercel](https://vercel.com/new), con las variables de entorno definidas. El proyecto usa el App Router de Next.js.
