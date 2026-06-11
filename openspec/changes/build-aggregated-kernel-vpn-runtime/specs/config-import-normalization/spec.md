## ADDED Requirements

### Requirement: System imports multiple configuration source types
The system SHALL support importing configuration from Clash subscriptions, plain node inputs, and manually entered nodes.

#### Scenario: Importing a Clash subscription
- **WHEN** a user submits a Clash subscription source
- **THEN** the system fetches or accepts the subscription content and creates repository resources derived from that source

#### Scenario: Importing plain nodes
- **WHEN** a user submits one or more supported node URIs
- **THEN** the system parses them into normalized node records in the repository

#### Scenario: Adding a manual node
- **WHEN** a user manually enters node properties
- **THEN** the system creates a normalized node record without requiring an external subscription source

### Requirement: Imported content is normalized into a unified internal model
The system SHALL transform imported configuration into a unified internal representation before it is used by profiles or runtime compilation.

#### Scenario: Mixed source activation
- **WHEN** a profile references resources from subscriptions, plain nodes, and manual nodes
- **THEN** the system composes them through the same internal model instead of keeping separate runtime pipelines per source type

### Requirement: Import failures surface diagnostics without corrupting stored data
The system SHALL reject invalid imports with diagnostics and SHALL NOT overwrite previously stored valid resources when normalization fails.

#### Scenario: Invalid subscription payload
- **WHEN** an import payload cannot be parsed or normalized
- **THEN** the system reports the failure reason and keeps the existing repository state unchanged

