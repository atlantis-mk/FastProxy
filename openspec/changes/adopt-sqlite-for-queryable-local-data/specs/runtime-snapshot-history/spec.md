## ADDED Requirements

### Requirement: Runtime snapshot summaries are recorded
The system SHALL record bounded metadata for runtime compile, preview, activation, and last-good snapshots in SQLite.

#### Scenario: Runtime compile succeeds
- **WHEN** a runtime compile succeeds
- **THEN** SQLite stores a snapshot summary containing profile ID, core, status, output hash or path, input resource summary, and timestamp

#### Scenario: Runtime compile fails
- **WHEN** a runtime compile fails
- **THEN** SQLite stores a snapshot summary containing profile ID, core, failure status, diagnostics summary, and timestamp

### Requirement: Runtime snapshot history is queryable
The system SHALL allow clients to query recent runtime snapshot summaries by profile, core, status, and time.

#### Scenario: Client opens runtime history
- **WHEN** a client requests recent runtime snapshots for a profile
- **THEN** the backend returns a bounded list of snapshot summaries ordered by newest first

### Requirement: Full runtime configs remain file-backed
The system SHALL keep complete generated runtime configuration files in the runtime directory and store only safe metadata or bounded excerpts in SQLite.

#### Scenario: Snapshot contains generated config
- **WHEN** a runtime snapshot is recorded
- **THEN** SQLite stores the output path or hash and does not persist unbounded full config text or secrets
