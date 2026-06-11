# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the Vite + Vue 3 frontend. Use `components/` for reusable UI, `views/` for route-level screens, `store/` for persisted state, `composables/` for shared behavior, and `api/` for backend calls. Static assets live in `public/` and `src/assets/`. The Go backend is in `FastProxy-Server/`, with the entrypoint at `cmd/fastproxy-server` and domain code under `internal/`. Utility scripts live in `scripts/`, and active design work is tracked in `openspec/changes/`.

## Build, Test, and Development Commands

- `pnpm dev`: run the frontend locally with Vite.
- `pnpm dev:fullstack`: start the frontend and `FastProxy-Server` together.
- `pnpm build`: produce the production frontend bundle in `dist/`.
- `pnpm preview`: serve the built frontend for verification.
- `pnpm type-check`: run `vue-tsc` across the app.
- `pnpm lint`: run ESLint with autofixes.
- `pnpm format`: run Prettier on `src/`.
- `go test ./...` (from `FastProxy-Server/`): run backend unit tests.
- `scripts/verify-fastproxy-runtime.sh`: smoke-test backend runtime APIs against a local server.

## Coding Style & Naming Conventions

Use 2-space indentation, UTF-8, trailing newline, and no trailing whitespace per `.editorconfig`. Prettier enforces `singleQuote: true`, no semicolons, `printWidth: 100`, import organization, and Tailwind class sorting. Vue SFCs and TS modules should use PascalCase for components (`ConnectionHistory.vue`), camelCase for composables/helpers (`proxySearch.ts`), and keep route/page files descriptive (`OverviewPage.vue`). Keep backend packages small and scoped by capability under `internal/`.

## Development Phase Cleanup Rules

The project is still in an active development stage, so prefer replacing old implementations cleanly instead of preserving backward compatibility by default.

- Keep a single source of truth for each feature, business rule, state shape, type contract, and config model. Do not duplicate the same responsibility across components, stores, composables, handlers, or adapters.
- When a feature is redesigned or replaced, remove the old implementation, unused UI, stale state, dead APIs, obsolete tests, and related compatibility branches in the same change.
- Do not keep parallel old/new logic, dual write paths, fallback branches, or feature toggles that only exist to preserve a superseded implementation unless the change request explicitly requires a temporary migration plan.
- Do not retain compatibility code for old data structures, config fields, response shapes, or storage formats during development unless the requirement is explicitly documented.
- If a rename or model change happens, update all call sites to the new contract instead of layering aliases, adapters, or translation glue on top of the old contract.
- Do not allow old and new fields, DTOs, store shapes, or request/response contracts to coexist long term. Update all consumers to the new model in the same change whenever feasible.
- Temporary logic must stay temporary. TODOs, compatibility shims, fallback code, migration helpers, and transitional components must have a clear removal condition or should not be merged.
- Prefer direct replacement and simplification over additive patching. If a refactor can remove a layer, duplicate branch, or historical abstraction, remove it instead of preserving it for safety by default.
- Remove unused imports, props, state, styles, routes, utilities, handlers, tests, and files as part of normal development. Do not keep code “just in case” it becomes useful later.
- Keep module boundaries clear: components should not absorb unrelated data orchestration, stores should not become view-formatting layers, and backend entrypoints should not hide domain logic that belongs in scoped packages.
- Keep naming consistent for the same concept across the codebase. Do not introduce synonyms or near-duplicate terms that force future adapters or mental translation.
- Treat commented-out code, unused files, and “temporary” compatibility shims as cleanup debt; remove them rather than leaving them in the codebase.
- Before merging, verify that the final implementation has a single source of truth and that no stale entry points, hidden references, dead branches, or unreachable cleanup targets remain.

## Testing Guidelines

Frontend changes should at minimum pass `pnpm type-check` and `pnpm lint`; add targeted manual verification for affected pages. Backend tests use Go’s standard `testing` package and live beside implementation files as `*_test.go`. Prefer table-driven tests for repository, runtime, and config logic.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits such as `fix: ...`, `feat: ...`, and `chore(main): release ...`. Keep commit subjects imperative and scoped when useful. PRs should describe user-visible impact, list verification steps, link related issues or OpenSpec changes, and include screenshots for UI work. Call out config, API, or migration risks explicitly.

## Security & Configuration Tips

Do not commit secrets or local runtime paths. Backend behavior is driven by env vars such as `FASTPROXY_SERVER_ADDR`, `FASTPROXY_SERVER_DATA_DIR`, `FASTPROXY_SERVER_MIHOMO_BIN`, and `FASTPROXY_SERVER_SING_BOX_BIN`. Validate runtime-related changes with the local backend before merging.
