## ADDED Requirements

### Requirement: Health check samples are recorded
The system SHALL record node health checks and latency tests in SQLite with node identity, check type, success state, latency, error summary, and timestamp.

#### Scenario: Successful latency check is recorded
- **WHEN** a node latency check succeeds
- **THEN** SQLite stores a sample containing the node ID, latency, success status, check type, and timestamp

#### Scenario: Failed health check is recorded
- **WHEN** a node health check fails
- **THEN** SQLite stores a sample containing the node ID, failure status, error summary, check type, and timestamp

### Requirement: Health state can be summarized
The system SHALL provide queries for recent health state and bounded historical summaries.

#### Scenario: Client requests recent node health
- **WHEN** a client requests the latest health state for nodes
- **THEN** the backend returns each node's latest known check result without scanning unbounded history in memory

#### Scenario: Client requests a health trend
- **WHEN** a client requests a bounded time range or sample count for a node
- **THEN** the backend returns latency and failure summary data from SQLite

### Requirement: Health history has retention controls
The system SHALL define a retention strategy for health samples to prevent unbounded database growth.

#### Scenario: Retention cleanup runs
- **WHEN** stored health samples exceed the configured retention window or sample count
- **THEN** old samples are removed while recent health state remains queryable
