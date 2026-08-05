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
| `/juegos`                      | Índice de juegos                                        |
| `/juegos/wordle`               | Wordle de apellidos de jugadores del club               |
| `/api/revalidate/matches`      | Revalidación on-demand del caché (requiere `secret`)    |
| `/rss.xml`                     | Feed RSS con los últimos partidos                       |
| `/sitemap.xml`                 | Sitemap                                                 |
| `/manifest.webmanifest`        | Manifest de la PWA                                      |

### PWA

La app es instalable y funciona offline con un service worker (`public/sw.js`). Al cambiar el shell (HTML/CSS/JS), incrementá la versión de `CACHE_NAME` en ese archivo para forzar la actualización en los clientes.

## Deploy

La forma más simple es [Vercel](https://vercel.com/new), con las variables de entorno definidas. El proyecto usa el App Router de Next.js.
