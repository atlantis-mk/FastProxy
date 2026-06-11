## ADDED Requirements

### Requirement: Imported nodes are cached in SQLite
The system SHALL persist normalized nodes from subscriptions, plain imports, and manual imports in SQLite with source metadata, stable identifiers, and searchable display fields.

#### Scenario: Subscription refresh stores normalized nodes
- **WHEN** a subscription refresh successfully parses nodes
- **THEN** the normalized nodes are stored in SQLite with their subscription source ID and refresh timestamp

#### Scenario: Imported nodes can be searched
- **WHEN** a client searches nodes by name, protocol, address, tag, or source
- **THEN** the backend returns a bounded page of matching nodes from SQLite

### Requirement: Node cache supports deduplication
The system SHALL maintain a deterministic deduplication key for normalized nodes so repeated imports can update existing cache rows instead of creating duplicate entries.

#### Scenario: Same node is imported again
- **WHEN** a refresh imports a node with the same deduplication key as an existing cached node
- **THEN** the existing SQLite row is updated with the latest metadata instead of inserting a duplicate node

### Requirement: Node source configuration remains separate
The system SHALL keep subscription and node-set configuration resources separate from the SQLite node cache.

#### Scenario: Cached nodes are rebuilt
- **WHEN** the SQLite cache is cleared or rebuilt
- **THEN** subscription and node-set JSON configuration remains intact and can be used to regenerate cached nodes
