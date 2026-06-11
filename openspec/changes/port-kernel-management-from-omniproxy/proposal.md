## Why

FastProxy already has local runtime supervision and core selection, but users still need a complete core management workflow for installing, inspecting, updating, and safely operating supported kernels. OmniProxy has proven product behavior for this area; FastProxy should bring the capability over while redesigning the backend around its existing Vue frontend and Go runtime architecture.

## What Changes

- Add a dedicated Vue core management experience for `mihomo` and `sing-box` that shows selected core, running state, binary source, cached version, update state, and actionable errors.
- Extend backend core inventory beyond manually configured paths to support local cache discovery, uploaded binaries or archives, first-time GitHub release download, update checks, and explicit update installation.
- Persist GitHub download token/settings locally without exposing secrets back to the frontend.
- Wire runtime lifecycle actions into the management surface: start, stop, restart, compile-and-start, restart-and-apply, and core switching with clear pending-apply state.
- Support both cores in the manager contract, including core-specific validation, config materialization, command arguments, health checks, logs, and failure reporting.
- Keep FastProxy's repository/profile/runtime compiler as the source of truth; OmniProxy is a behavior reference, not a backend implementation to copy.

## Capabilities

### New Capabilities

- `kernel-inventory-management`: Covers supported kernel inventory, binary source resolution, cache metadata, uploads, GitHub token storage, update checks, and update installation.
- `kernel-runtime-operations`: Covers user-facing runtime lifecycle operations, core switching semantics, pending apply state, logs/status reporting, and multi-core execution parity.
- `vue-kernel-management-ui`: Covers the Vue frontend route, navigation, state, API wiring, and responsive management workflows for kernel inventory and runtime operations.

### Modified Capabilities

- None.

## Impact

- Backend changes in `FastProxy-Server/internal/core`, `internal/api`, `internal/appconfig`, `internal/appdata`, and any settings persistence needed for secure local token storage.
- Frontend changes in `src/api/fastproxy.ts`, `src/types/fastproxy.ts`, router/sidebar navigation, i18n strings, and a new Vue management view with reusable controls where appropriate.
- Runtime behavior expands from manually configured binary paths toward configured path, cached binary, uploaded local binary, and GitHub release download resolution.
- Tests should cover binary cache selection, upload extraction, update metadata, token persistence redaction, runtime lifecycle actions, multi-core validation/command mapping, and frontend API/state behavior.
