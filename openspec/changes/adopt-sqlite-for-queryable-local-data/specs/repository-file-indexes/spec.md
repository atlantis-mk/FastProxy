## ADDED Requirements

### Requirement: Repository file indexes are stored in SQLite
The system SHALL store built-in and custom repository file indexes in SQLite, including repository metadata, directories, files, core availability, formats, behaviors, and raw URL metadata.

#### Scenario: Built-in rule repository is refreshed
- **WHEN** the built-in MetaCubeX rule repository index refresh completes
- **THEN** SQLite stores the refreshed directories and logical file entries for both supported cores

#### Scenario: Custom repository is refreshed
- **WHEN** a custom repository file index refresh completes
- **THEN** SQLite stores its directories and selectable file entries under that repository ID

### Requirement: Repository directory browsing is paged
The system SHALL return direct child directories and a bounded page of direct child files for a requested repository path.

#### Scenario: Large directory is opened
- **WHEN** a client opens a repository directory containing many files
- **THEN** the backend returns a bounded page with total count and next offset metadata

### Requirement: Repository search is global and bounded
The system SHALL search repository file indexes through SQLite without requiring the frontend to load every directory first.

#### Scenario: Client searches repository files
- **WHEN** a client searches by logical path, filename, core, format, behavior, or source path
- **THEN** the backend returns a bounded page of matching entries from SQLite

### Requirement: Old file index caches are removed
The system SHALL remove superseded large JSON and JSONL repository index caches after the corresponding SQLite index is written.

#### Scenario: Repository index is refreshed after migration
- **WHEN** a repository index refresh succeeds
- **THEN** stale directory JSON index files and JSONL search cache files for that repository are removed or ignored
