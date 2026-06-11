## 1. Backend Inventory and Settings

- [x] 1.1 Expand core inventory models to include binary source, configured path, cached version/path, install readiness, update metadata placeholders, selected/running state, and available actions
- [x] 1.2 Implement core cache discovery under `cores/<core>/<version>` with deterministic latest-version selection and executable-name validation
- [x] 1.3 Implement binary resolver priority for configured path, cached/uploaded binary, and explicit network download
- [x] 1.4 Add local GitHub token settings persistence with redacted status responses and backend-only token reads
- [x] 1.5 Add unit tests for inventory construction, resolver priority, cache discovery, and token redaction

## 2. Backend Install and Update Workflows

- [x] 2.1 Add local binary/archive upload installation into the existing core cache layout
- [x] 2.2 Add GitHub latest-release check logic with OS/architecture asset selection for `mihomo` and `sing-box`
- [x] 2.3 Add explicit update installation that downloads, extracts, marks executable where needed, and refreshes inventory
- [x] 2.4 Return actionable errors for missing assets, invalid archives, rate limits, network failures, and unsupported cores
- [x] 2.5 Add table-driven backend tests for upload extraction, invalid upload rollback, update metadata, and network error handling

## 3. Backend Runtime Operations

- [x] 3.1 Refactor `internal/core.Manager` around per-core adapters for config materialization, validation, run command, health check, and status normalization
- [x] 3.2 Implement `mihomo` execution parity for rendered YAML runtime output while preserving existing `sing-box` execution behavior
- [x] 3.3 Add bounded stdout/stderr log capture and expose normalized log entries for diagnostics
- [x] 3.4 Serialize install/update/start/stop/restart/reload operations and return conflict or authoritative status for overlapping requests
- [x] 3.5 Add restart, compile-and-start, and restart-and-apply backend flows that preserve active runtime snapshot semantics
- [x] 3.6 Add backend tests for selected-vs-running core state, pending apply, validation failure preservation, unexpected process exit, and debounced reloads

## 4. Backend API Contracts

- [x] 4.1 Extend `GET /api/cores` and bootstrap responses with the new inventory shape without keeping duplicate legacy fields beyond current consumers
- [x] 4.2 Add API endpoints for core upload, update check, update install, and GitHub token status/update
- [x] 4.3 Add runtime endpoints or request modes for restart, compile-and-start, and restart-and-apply if existing handlers cannot express them cleanly
- [x] 4.4 Update HTTP error codes and response bodies for unsupported core, missing binary, operation conflict, invalid upload, and release download failures
- [x] 4.5 Add API handler tests covering inventory, token settings, upload/update endpoints, and runtime action wiring

## 5. Vue Frontend Integration

- [x] 5.1 Update `src/types/fastproxy.ts` and `src/api/fastproxy.ts` for inventory, upload, update, token, logs, and runtime operation contracts
- [x] 5.2 Add a Vue kernel management view under `src/views/` using existing layout, responsive constraints, busy states, and error display patterns
- [x] 5.3 Add route, sidebar/navigation entry, and i18n strings for the kernel management page
- [x] 5.4 Implement inventory display with selected/running badges, configured-vs-cached source state, install readiness, and update metadata
- [x] 5.5 Implement local upload, update check/install, token save/clear, start, stop, restart, compile-and-start, restart-and-apply, and core switching controls
- [x] 5.6 Show pending-apply state when selected core or active runtime differs from the running process

## 6. Verification and Cleanup

- [x] 6.1 Remove stale core-management assumptions, duplicate runtime action helpers, and obsolete compatibility branches introduced during implementation
- [x] 6.2 Run `go test ./...` from `FastProxy-Server/`
- [x] 6.3 Run `pnpm type-check` and `pnpm lint`
- [ ] 6.4 Manually verify the page against a local full-stack server for configured path, cached binary, upload install, update check failure/success, core switch pending state, and runtime lifecycle actions
- [x] 6.5 Update README or runtime smoke-test notes if new environment variables, endpoints, or local cache behavior change developer setup
