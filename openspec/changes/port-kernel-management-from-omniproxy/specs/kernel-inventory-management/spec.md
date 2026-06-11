## ADDED Requirements

### Requirement: System exposes kernel inventory
The system SHALL expose a kernel inventory for all supported cores, including core identity, display metadata, configured path state, cached binary state, selected runtime state, and available management actions.

#### Scenario: Inventory includes configured and cached sources
- **WHEN** a client requests kernel inventory
- **THEN** the response includes each supported core with whether it has a configured binary path, whether a cached binary exists, and which source would be used first for execution

#### Scenario: Inventory read is local only
- **WHEN** a client refreshes kernel inventory
- **THEN** the system reads local configuration and cache state without contacting GitHub or downloading files

### Requirement: System resolves core binaries by priority
The system SHALL resolve the executable for a core using configured path first, then the latest valid cached or uploaded binary, then an explicit GitHub download only when the requested action permits downloading.

#### Scenario: Configured path wins over cache
- **WHEN** a core has both a configured binary path and a cached binary
- **THEN** runtime execution uses the configured binary path

#### Scenario: Cache is used when no configured path exists
- **WHEN** a core has no configured binary path but has a cached binary
- **THEN** runtime execution uses the cached binary without contacting GitHub

#### Scenario: Missing binary reports install action
- **WHEN** a core has no configured path and no cached binary
- **THEN** the inventory marks the core as requiring upload, configured path, or explicit download before normal execution can succeed

### Requirement: System installs local core uploads
The system SHALL allow a client to install a local core binary or supported archive into the app data core cache for the selected core.

#### Scenario: Upload binary is cached
- **WHEN** a user uploads a valid executable for a core
- **THEN** the system stores it under the core cache, marks it executable where required, and returns updated inventory metadata

#### Scenario: Upload archive is extracted
- **WHEN** a user uploads a supported archive containing the expected core executable
- **THEN** the system extracts the executable into the core cache and rejects unrelated archive contents

#### Scenario: Invalid upload is rejected
- **WHEN** an uploaded file does not contain a valid executable for the requested core
- **THEN** the system rejects the upload without changing the selected runtime or active cache entry

### Requirement: System manages GitHub release updates explicitly
The system SHALL support explicit release update checks and update installation for supported cores using GitHub Releases.

#### Scenario: Check update returns release metadata
- **WHEN** a user checks updates for a core
- **THEN** the system returns current cached version, latest release version, selected asset name, and whether an update is available

#### Scenario: Update installs latest release
- **WHEN** a user requests update installation for a core
- **THEN** the system downloads the matching OS and architecture asset, extracts the core executable into the cache, and refreshes inventory metadata

#### Scenario: Network failures are actionable
- **WHEN** GitHub cannot be reached or rate limits the request
- **THEN** the system returns an error that explains upload, configured path, or token configuration as recovery paths

### Requirement: System stores GitHub token securely
The system SHALL persist a local GitHub token for backend release requests and SHALL NOT return token plaintext to clients.

#### Scenario: Token status is redacted
- **WHEN** a client requests GitHub token settings
- **THEN** the response indicates whether a token is configured without including the token value

#### Scenario: Token can be updated or cleared
- **WHEN** a client saves or clears the GitHub token
- **THEN** subsequent release requests use the updated setting and the response remains redacted
