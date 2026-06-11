## ADDED Requirements

### Requirement: System manages rule source repositories independently from rule sets
The system SHALL store built-in and user-defined rule source repositories as resources independent from managed rule sets, so repository configuration can be reused by multiple rule sets.

#### Scenario: Listing repositories
- **WHEN** a client requests the available rule repositories
- **THEN** the system returns both built-in and user-created repositories with stable identifiers, metadata, and supported cores

#### Scenario: Creating a custom repository
- **WHEN** a user creates a repository with per-core source mappings
- **THEN** the system persists the repository and makes it available for later rule set creation without requiring any rule set to be created immediately

### Requirement: Repository mappings are defined per supported core
The system SHALL allow each rule source repository to define source mappings separately for `sing-box` and `mihomo`, including the ref or equivalent source locator used for each core.

#### Scenario: Built-in repository uses different branches per core
- **WHEN** the client reads a built-in repository such as `MetaCubeX/meta-rules-dat`
- **THEN** the repository data includes distinct source mappings for `sing-box` and `mihomo`

#### Scenario: Custom repository supports only one core
- **WHEN** a user creates a repository with only one core mapping configured
- **THEN** the system stores that partial mapping and marks unsupported cores as unavailable rather than fabricating defaults

### Requirement: Repository file browsing is core-aware
The system SHALL expose repository browsing data for a selected core using that core's configured source mapping instead of requiring the client to hard-code branch or path conventions.

#### Scenario: Browsing repository files for sing-box
- **WHEN** the client requests the repository tree for a repository and `sing-box`
- **THEN** the system returns the file tree derived from the repository mapping configured for `sing-box`

#### Scenario: Browsing unsupported core
- **WHEN** the client requests repository tree data for a core that has no mapping on the selected repository
- **THEN** the system rejects the request with an error indicating the repository does not support that core
