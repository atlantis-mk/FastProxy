## ADDED Requirements

### Requirement: SQLite stores queryable local data
The system SHALL use SQLite as the local persistence layer for data that is large, historical, searchable, pageable, or relational, while retaining JSON files as the source-of-truth for small user-editable configuration resources.

#### Scenario: Queryable data is persisted in SQLite
- **WHEN** a feature stores large indexed data such as node caches, repository indexes, health samples, event logs, or runtime snapshot summaries
- **THEN** the data is written to the local SQLite database instead of a large JSON cache file

#### Scenario: User-editable configuration remains readable
- **WHEN** a feature stores small profile composition, base settings, or manually edited resource definitions
- **THEN** the data remains in JSON files unless the feature explicitly requires querying, pagination, history, or relational lookup

### Requirement: Database initialization is local and repeatable
The system SHALL initialize the SQLite database inside the FastProxy data directory with idempotent schema setup and without requiring an external database service.

#### Scenario: Store starts with no database file
- **WHEN** FastProxy starts with an empty data directory
- **THEN** it creates the local SQLite database and all required tables before serving repository APIs

#### Scenario: Store starts with an existing database file
- **WHEN** FastProxy starts with an existing SQLite database
- **THEN** schema initialization runs safely without dropping existing data

### Requirement: Query APIs are bounded
The system SHALL expose pageable or bounded query APIs for SQLite-backed lists and searches.

#### Scenario: Large list is requested
- **WHEN** a client requests a SQLite-backed collection that may contain many rows
- **THEN** the response includes a bounded page of results and pagination metadata

#### Scenario: Search is requested
- **WHEN** a client searches a SQLite-backed collection
- **THEN** the response applies a default limit and enforces a maximum limit
