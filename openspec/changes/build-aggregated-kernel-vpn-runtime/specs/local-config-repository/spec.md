## ADDED Requirements

### Requirement: System stores source configuration as separate JSON documents
The system SHALL persist subscriptions, node sets, rule sets, group sets, and profiles as separate JSON documents under the local FastProxy data directory instead of embedding all configuration content in a single profile payload.

#### Scenario: Creating a new source document
- **WHEN** a user creates a subscription, node set, rule set, group set, or profile
- **THEN** the system stores that resource as an individual JSON document with a stable identifier and metadata

#### Scenario: Updating one source document
- **WHEN** a user updates a single source document
- **THEN** the system persists only that document and SHALL NOT require rewriting unrelated source documents

### Requirement: Profiles describe composition rather than full runtime content
The system SHALL treat a profile as a composition record that references enabled subscriptions, node sets, rule sets, and group sets, together with runtime options and selected core metadata.

#### Scenario: Reading a profile
- **WHEN** a client fetches a profile
- **THEN** the response includes referenced source resource identifiers and runtime options rather than one monolithic runtime configuration body

#### Scenario: Activating a profile
- **WHEN** a user sets a profile as active
- **THEN** the system records the active profile identifier separately from the profile document itself

### Requirement: Repository resources preserve source metadata
The system SHALL store metadata for each source document including origin type, creation time, update time, and human-readable name.

#### Scenario: Listing imported resources
- **WHEN** a client requests repository resources
- **THEN** the system returns resource metadata sufficient to distinguish imported subscriptions, parsed node sets, and manually created resources

