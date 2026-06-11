## Context

FastProxy already has a Go backend with `internal/core.Manager`, runtime compilation, active runtime snapshots, and a Vue 3 frontend. The current core manager can select supported cores and start a configured `sing-box` binary, but it does not yet provide the full kernel management workflow users expect: install from local file, discover cached releases, download on demand, check/update from GitHub, manage a redacted token, or operate both `mihomo` and `sing-box` with parity.

OmniProxy is useful as a product reference because it already models cached core binaries under `cores/<core>/<version>`, resolves configured paths before cache/download, supports update checks and local uploads, and gives users a dedicated core management surface. FastProxy should port those capabilities, not copy OmniProxy's backend shape. The implementation should fit FastProxy's existing repository/profile/runtime split and Vue UI conventions.

## Goals / Non-Goals

**Goals:**

- Add a first-class Vue route for kernel management with inventory, install/update actions, runtime operations, and clear pending-apply state.
- Extend backend core inventory to represent configured paths, cached releases, uploaded local builds, latest-release metadata, and whether first start will require network download.
- Implement secure local GitHub token persistence for release requests without returning token plaintext to clients.
- Preserve FastProxy's active runtime snapshot model: the core process runs compiled output, not editable source resources.
- Bring `mihomo` and `sing-box` under one adapter-style execution contract for validation, config materialization, start commands, health checks, logs, and errors.
- Keep runtime actions serialized so install/update/start/restart operations cannot corrupt active state.

**Non-Goals:**

- Building a full release channel manager with downgrade history, custom forks, checksum policy UI, or automatic background upgrades.
- Replacing configuration repository, profile editing, or runtime compiler behavior.
- Copying OmniProxy's React UI or backend packages directly.
- Exposing GitHub token plaintext, local secret paths beyond what is already intentionally configured, or arbitrary filesystem browsing.

## Decisions

### 1. Model kernel inventory as backend-owned core supply state

FastProxy will expand `Definition` into an inventory DTO that includes core id, display name, support state, configured binary path status, cache status, cached version/path, selected/running relationship, and available actions. The backend computes this state by reading app config, `cores/<core>/<version>` cache folders, current runtime status, and optional release metadata.

This keeps the frontend from inferring filesystem or runtime details and gives tests a single contract. The alternative is to add small one-off endpoints for every button; that would scatter state and recreate the old/new logic overlap this project avoids.

### 2. Use a resolver chain for executable paths

Starting or updating a core will resolve binaries in this order: explicit configured path, latest valid cached/uploaded binary, then GitHub latest release download when the action allows network fetch. Regular inventory reads must not contact GitHub. Update check and update install are explicit network actions.

This matches user expectations from OmniProxy while making network work opt-in and observable. It also keeps configured paths authoritative for local development and package-managed installations.

### 3. Store local uploads in the same cache layout as downloads

Uploaded binaries or archives will be normalized into `cores/<core>/<version>/` using a generated version such as `local-YYYYMMDD-HHMMSS`. Archive extraction should find the expected executable name for the selected core and mark it executable on POSIX systems.

Using one cache layout avoids parallel “uploaded vs downloaded” code paths. The version label distinguishes local builds without requiring a separate migration model.

### 4. Introduce a small settings store for GitHub token metadata

The backend will persist the token in the app data settings area and expose only redacted metadata such as `configured: true` and optional `updatedAt`. Release HTTP clients use the stored token first, then environment fallback if supported.

This avoids pushing token handling into the Vue app. The alternative, browser-side token storage, would leak secrets through devtools/local storage and make server-side downloads harder to test.

### 5. Refactor core execution around adapters

`internal/core` should use per-core adapters for:

- selecting rendered config from `runtime/active.json`
- writing core-specific active files
- validation command
- run command
- controller health URL
- process log capture and status normalization

FastProxy already has a manager; this change should reshape it in place rather than layering another supervisor beside it. `mihomo` support should be implemented through the same contract instead of remaining a permanent special case.

### 6. Keep UI operational, compact, and Vue-native

The new view should live in `src/views/`, use existing `src/api/fastproxy.ts` and `src/types/fastproxy.ts` contracts, wire through the existing router/sidebar/i18n patterns, and favor dense operational controls over a marketing-style page. It should show inventory cards/table, token settings, upload/update actions, runtime controls, and pending-apply state in one page.

OmniProxy's React page is only a behavior reference. The FastProxy implementation should use Vue SFC composition and the existing design system conventions.

## Risks / Trade-offs

- [GitHub rate limits or offline users break first start] → Keep configured paths and local uploads first-class, make network download explicit in errors, and allow token configuration.
- [Cached binary metadata becomes stale after manual file deletion] → Recompute inventory from disk on each refresh and after install/update/start actions.
- [Core update while running can leave process/config mismatch] → Require explicit restart/apply after installing a different cached binary, and show the running binary/version separately from installed cache when possible.
- [Archive extraction can choose the wrong executable] → Match the expected core binary name and reject archives without a suitable binary.
- [Runtime operations race with update/install actions] → Serialize manager operations and return actionable conflict errors instead of overlapping process changes.
- [Mihomo parity expands scope] → Implement minimum executable parity through adapter validation/run/health and keep advanced controller-specific features outside this change.

## Migration Plan

No user data migration is required for existing profiles or runtime snapshots. Existing configured binary env vars continue to work and become the highest-priority inventory source.

Implementation can proceed in stages:

1. Add backend inventory/cache/settings/update/upload contracts while preserving existing `/api/cores` shape through updated frontend types.
2. Refactor `internal/core.Manager` around resolver and adapter seams, retaining existing start/stop/status endpoints.
3. Add Vue API clients, types, route, sidebar entry, and view.
4. Add tests for resolver order, upload extraction, redacted token settings, update metadata, and lifecycle serialization.
5. Validate with `go test ./...`, `pnpm type-check`, `pnpm lint`, and a manual full-stack run.

Rollback is straightforward: remove the new route/API additions and keep configured-path runtime execution. Cached files under `cores/` are inert unless referenced by the manager.

## Open Questions

- Should the backend record the exact binary path/version used by a currently running process, or is selected core plus PID enough for the first implementation?
- Should release downloads verify upstream checksums immediately, or should checksum enforcement be a follow-up release-management change?
