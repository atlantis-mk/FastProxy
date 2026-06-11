## ADDED Requirements

### Requirement: Vue app provides kernel management route
The frontend SHALL provide a Vue route and navigation entry for kernel management using FastProxy API contracts and existing application layout conventions.

#### Scenario: User opens kernel management
- **WHEN** a user navigates to the kernel management page
- **THEN** the page loads kernel inventory, runtime status, activation status, and token status from FastProxy APIs

#### Scenario: Route is visible in navigation
- **WHEN** the FastProxy local backend is active
- **THEN** the sidebar or primary navigation includes the kernel management route

### Requirement: UI shows inventory and binary source state
The frontend SHALL show each supported core with selected/running badges, configured path state, cached version state, first-download requirement, and available install/update actions.

#### Scenario: Core has configured binary
- **WHEN** inventory reports a configured binary path
- **THEN** the UI identifies it as the execution source and keeps cache/update metadata visually secondary

#### Scenario: Core requires installation
- **WHEN** inventory reports no usable configured or cached binary
- **THEN** the UI presents upload, path configuration, or explicit download/update actions without implying the core is ready

### Requirement: UI supports local upload and update workflows
The frontend SHALL allow users to upload a local core file, check updates, install latest releases, and manage GitHub token status.

#### Scenario: Upload install succeeds
- **WHEN** a user uploads a valid core file and the backend accepts it
- **THEN** the UI refreshes inventory and shows the updated cached state

#### Scenario: Update check succeeds
- **WHEN** a user checks for core updates
- **THEN** the UI displays latest version, current cached version, and update availability for that core

#### Scenario: Token remains hidden
- **WHEN** a user saves or clears a GitHub token
- **THEN** the UI displays only redacted configured status and never renders token plaintext

### Requirement: UI exposes runtime operations safely
The frontend SHALL expose start, stop, restart, compile-and-start, restart-and-apply, and core switching actions with disabled states, progress state, and backend error display.

#### Scenario: Runtime action is in progress
- **WHEN** a runtime action is pending
- **THEN** conflicting controls are disabled or show busy state until the backend response refreshes runtime status

#### Scenario: Core switch is pending apply
- **WHEN** selected core differs from the running core
- **THEN** the UI shows a pending apply state and offers restart-and-apply as the clear next action

#### Scenario: Backend action fails
- **WHEN** a runtime, install, token, or update request fails
- **THEN** the UI shows the backend error and preserves the last successfully loaded inventory and runtime state

### Requirement: UI remains responsive and operational
The frontend SHALL use a responsive Vue design that keeps common kernel management workflows efficient on desktop and mobile.

#### Scenario: Desktop management view
- **WHEN** the page is viewed on a desktop viewport
- **THEN** inventory, runtime controls, token settings, and diagnostics are arranged for scanning and repeated operation

#### Scenario: Mobile management view
- **WHEN** the page is viewed on a mobile viewport
- **THEN** controls remain reachable, text fits within containers, and action states remain visible without overlap
