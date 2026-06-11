## ADDED Requirements

### Requirement: System supervises the selected runtime core process
The system SHALL manage the lifecycle of the selected runtime core, including start, stop, restart, and status reporting.

#### Scenario: Starting the selected core
- **WHEN** a user starts runtime execution
- **THEN** the system launches the currently selected core with the active runtime configuration

#### Scenario: Stopping the selected core
- **WHEN** a user stops runtime execution
- **THEN** the system terminates the managed core process and updates runtime status

### Requirement: Runtime file changes trigger core reconfiguration without restarting FastProxy
The system SHALL monitor the active runtime configuration and react to relevant changes by reloading or restarting only the managed core process.

#### Scenario: Source edit affects runtime
- **WHEN** a repository or profile change produces a new active runtime configuration
- **THEN** the system applies the new configuration to the managed core without restarting the FastProxy application process

### Requirement: Supervisor serializes runtime reconfiguration attempts
The system SHALL avoid overlapping reload or restart attempts for the managed core.

#### Scenario: Rapid consecutive changes
- **WHEN** multiple runtime-affecting changes occur in quick succession
- **THEN** the supervisor processes reconfiguration attempts in a serialized manner and exposes the latest resulting status

### Requirement: V1 runtime execution prioritizes sing-box while preserving core abstraction
The system SHALL support full V1 runtime execution for `sing-box` and SHALL preserve a selectable abstraction for `mihomo` even if V1 does not implement feature parity.

#### Scenario: Selecting sing-box in V1
- **WHEN** `sing-box` is configured and selected
- **THEN** the system permits full runtime compilation and supervisor-managed execution

#### Scenario: Selecting mihomo before parity
- **WHEN** `mihomo` is selected for a capability not yet implemented in V1
- **THEN** the system reports that the capability is not yet available instead of pretending full support
