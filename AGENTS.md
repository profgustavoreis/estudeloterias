# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Estude Loterias** (estudeloterias.com.br) — a Portuguese-language site of statistics and tools for Brazilian Caixa lotteries (Mega-Sena, Lotofácil, Quina, etc.). A React SPA frontend backed by an Express API that mirrors Caixa's public lottery data into Postgres and serves stats/results from it.

## Commands

This is a **pnpm workspace** (Node 24, TS 5.9). `pnpm` is enforced — npm/yarn are rejected by the `preinstall` hook.

- `pnpm --filter @workspace/api-server run dev` — build + run the API server (requires `PORT`, `DATABASE_URL`)
- `pnpm --filter @workspace/estude-loterias run dev` — run the Vite frontend (requires `PORT`, `BASE_PATH`)
- `pnpm run typecheck` — full typecheck across all packages (run this before considering work done)
- `pnpm run build` — typecheck + build every package
- `pnpm --filter @workspace/api-spec run codegen` — **regenerate API client + Zod schemas from the OpenAPI spec** (see codegen flow below)
- `pnpm --filter @workspace/db run push` — push Drizzle schema to the DB (dev only; also runs automatically in `scripts/post-merge.sh`)

There is **no test suite** in this repo. Verification is via `typecheck` + running the apps.

## Architecture

### Monorepo layout
- `artifacts/` — deployable apps (Replit "artifacts"), each with a `.replit-artifact/artifact.toml` describing dev/prod run commands and ports:
  - `artifacts/api-server` — Express 5 API + data sync (port 8080 in prod)
  - `artifacts/estude-loterias` — React + Vite SPA (the website)
  - `artifacts/mockup-sandbox` — scratch/prototyping
- `lib/` — shared workspace packages (`@workspace/*`), consumed via `workspace:*`:
  - `lib/db` — Drizzle ORM schema + Postgres pool
  - `lib/api-spec` — the OpenAPI spec (`openapi.yaml`) + Orval config — **source of truth for the API contract**
  - `lib/api-client-react` — *generated* React Query hooks + a hand-written `custom-fetch.ts` mutator
  - `lib/api-zod` — *generated* Zod schemas/types
- `scripts/` — workspace utility scripts (tsx)

### API contract is codegen-driven — do not hand-edit generated files
The flow is: **edit `lib/api-spec/openapi.yaml`** → run `pnpm --filter @workspace/api-spec run codegen` (Orval) → regenerates `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`. The frontend imports React Query hooks from `@workspace/api-client-react`; the Express routes must be implemented to match the spec by hand (the spec does not generate server code). The only non-generated file in `api-client-react` is `custom-fetch.ts` (the fetch mutator: base-URL handling, error parsing into `ApiError`, content-type inference).

### Data flow: Caixa → Postgres → API → frontend
- `artifacts/api-server/src/services/lottery-sync.ts` is the heart of data ingestion. It fetches from Caixa's public API (`servicebus2.caixa.gov.br/portaldeloterias/api`) and upserts into the single `lottery_results` table (`lib/db/src/schema/lottery-results.ts`), keyed by a unique `(modalidade, concurso)`.
- All draw data lives in one wide table; per-game JSON columns (`dezenas`, `premios`, `metadata`) hold the variable shapes across lottery types.
- **Routes serve from the DB first, falling back to the Caixa API** (`fetchGuidi`/`fetchCaixa`) when a record is missing. Stats (frequency, etc.) are computed in SQL over the DB — this is why the local mirror exists.
- Sync runs on server startup (`runInitialSeed`, seeds latest ~300 concursos per modalidade) and on cron schedules defined in `artifacts/api-server/src/index.ts` (around draw times + periodic). Mega-Sena is prioritized; others sync in the background with rate-limit delays.
- Long-running data ops (e.g. `backfillGaps`) are exposed as **admin endpoints** (`POST /api/admin/backfill-gaps`) rather than external scripts, because the Replit sandbox kills external long-running scripts (~90s). Always prefer an internal endpoint for long jobs.

### Frontend
- React SPA using **wouter** for routing (not React Router), **TanStack Query** for data, **Radix UI + Tailwind v4** (shadcn-style components in `src/components/ui/`), `react-helmet-async` for SEO.
- Routes are declared in `artifacts/estude-loterias/src/App.tsx`. Pages live under `src/pages/<modalidade>/`. Currently **mega-sena** and **lotofacil** are the fully-built sections (the backend syncs 9 modalities, but only these two have frontend pages).
- Served as a static SPA in prod with a catch-all rewrite to `index.html`; the app mounts under `BASE_PATH` (wouter `base`).

## Gotchas

- **Caixa API requires `Origin` + `Referer` headers** (`loterias.caixa.gov.br`) or it returns 403 after a few calls. See `CAIXA_HEADERS` in `lottery-sync.ts`. There are agent memory notes on this in `.agents/memory/`.
- `seedInitialData` only fills MIN→MAX gaps; **internal gaps need `backfillGaps`** (uses Postgres `generate_series` to find every missing concurso).
- Both apps **require env vars at startup and throw if absent**: API needs `PORT` + `DATABASE_URL`; frontend needs `PORT` + `BASE_PATH`.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (1-day supply-chain delay before installing new package versions). **Do not disable it.** Use `minimumReleaseAgeExclude` for urgent trusted exceptions only.
- The `data` column stores dates as `dd/mm/yyyy` **text**; year filtering uses `SPLIT_PART(...)::integer` in SQL.

## Source-of-truth pointers
- API contract: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/`
- Data sync logic: `artifacts/api-server/src/services/lottery-sync.ts`
- Frontend routes: `artifacts/estude-loterias/src/App.tsx`
- Agent memory (Caixa API quirks, sync strategy): `.agents/memory/`

<!-- graymatter:instructions:begin — managed by `graymatter init`; edits inside this block are overwritten -->
## Memory (GrayMatter)

This project has persistent agent memory via the `graymatter` MCP tools:

- `memory_search` (`agent_id`, `query`) — call at the **start of a task** when prior context might matter.
- `memory_add` (`agent_id`, `text`) — call whenever you learn something **durable**: user preferences, decisions, conventions, gotchas.
- `memory_reflect` (`action`, `agent`, `text`/`target`) — update or forget stale facts. ⚠ takes `agent`, not `agent_id`.
- `checkpoint_save` / `checkpoint_resume` (`agent_id`) — snapshot/restore session state before major refactors or across restarts.

Use a stable `agent_id` of the form `<project>-<role>` (e.g. `myapp-backend`). Store conclusions, not conversation logs. Err on the side of remembering.
<!-- graymatter:instructions:end -->
