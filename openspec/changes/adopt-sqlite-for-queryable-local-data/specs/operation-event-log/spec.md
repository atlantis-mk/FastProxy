## ADDED Requirements

### Requirement: Operations are logged as structured events
The system SHALL record refresh, import, compile, activation, core lifecycle, and failure events in SQLite with structured metadata.

#### Scenario: Repository refresh fails
- **WHEN** a repository refresh fails
- **THEN** the backend records an error event with event type, resource type, resource ID, message, error code, and timestamp

#### Scenario: Runtime activation succeeds
- **WHEN** a profile activation compiles and applies successfully
- **THEN** the backend records an info event associated with the profile, target core, and runtime snapshot

### Requirement: Event log is queryable
The system SHALL allow clients to query events by time range, severity, event type, resource type, resource ID, profile, and core.

#### Scenario: Client filters errors for a resource
- **WHEN** a client requests error events for a specific resource
- **THEN** the backend returns a bounded page of matching structured events

### Requirement: Event context is safe and bounded
The system SHALL store only small, non-secret event context in SQLite.

#### Scenario: Event contains sensitive input
- **WHEN** an operation involves credentials, tokens, proxy passwords, or full generated configs
- **THEN** the event context omits or redacts those values before persistence
