## ADDED Requirements

### Requirement: System operates selected kernel runtime
The system SHALL manage start, stop, restart, compile-and-start, and restart-and-apply operations for the selected core using the active compiled runtime snapshot.

#### Scenario: Start uses active runtime
- **WHEN** a user starts runtime execution
- **THEN** the system resolves the selected core binary, materializes the core-specific config from the active runtime snapshot, validates it, starts the process, and reports running status

#### Scenario: Compile and start activates before execution
- **WHEN** a user starts runtime execution without a current active runtime snapshot
- **THEN** the system compiles and activates the selected profile before starting the selected core

#### Scenario: Stop terminates managed process
- **WHEN** a user stops runtime execution
- **THEN** the system terminates only the managed core process and reports stopped status

### Requirement: System supports multi-core execution adapters
The system SHALL implement core-specific execution behavior through a shared adapter contract for `mihomo` and `sing-box`.

#### Scenario: sing-box adapter runs JSON config
- **WHEN** `sing-box` is selected
- **THEN** the system validates with the sing-box check command and runs sing-box with the rendered JSON config

#### Scenario: mihomo adapter runs YAML config
- **WHEN** `mihomo` is selected
- **THEN** the system validates with the mihomo test command and runs mihomo with the rendered YAML config

#### Scenario: Unsupported core is rejected
- **WHEN** a request names a core outside the supported set
- **THEN** the system rejects the request without changing selected core or runtime state

### Requirement: System distinguishes selected and running core state
The system SHALL expose selected core, running core, runtime state, active config identity, and pending-apply state when saved selection differs from the running process.

#### Scenario: Switching core while running is pending
- **WHEN** a user changes the selected core while another core is running
- **THEN** the system records the saved selection and reports that restart/apply is required before the running process changes

#### Scenario: Restart apply uses latest selection
- **WHEN** a user performs restart-and-apply after switching core
- **THEN** the system compiles the active profile for the selected core and restarts the managed process with that core

### Requirement: System serializes runtime operations
The system SHALL prevent overlapping install, update, start, stop, restart, and reload operations from corrupting runtime status or active process state.

#### Scenario: Concurrent operation conflict
- **WHEN** a runtime operation is already in progress and a conflicting operation is requested
- **THEN** the system returns a conflict or queued result with the latest authoritative runtime status

#### Scenario: Rapid active config changes are debounced
- **WHEN** active runtime snapshots change repeatedly in quick succession
- **THEN** the system processes reconfiguration attempts serially and reports the final status

### Requirement: System reports runtime logs and failures
The system SHALL capture bounded core stdout/stderr logs and expose normalized status and error messages for frontend diagnostics.

#### Scenario: Process emits logs
- **WHEN** the managed core writes stdout or stderr
- **THEN** the system records bounded log entries with time, stream, core, and message

#### Scenario: Validation fails
- **WHEN** core config validation fails before start or restart
- **THEN** the system leaves the previous running process unchanged when possible and reports the validation error

#### Scenario: Process exits unexpectedly
- **WHEN** the managed core exits without a requested stop
- **THEN** the system marks runtime status as failed and preserves the error message for the UI
