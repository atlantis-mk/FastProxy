## ADDED Requirements

### Requirement: System compiles active source resources into one runtime configuration
The system SHALL generate exactly one active runtime configuration from the active profile and its referenced source resources.

#### Scenario: Successful compilation
- **WHEN** compilation succeeds for the active profile
- **THEN** the system writes one active runtime configuration artifact representing the merged configuration

#### Scenario: Inactive resources
- **WHEN** source resources are present in the repository but not referenced by the active profile
- **THEN** the system excludes them from the active runtime configuration

### Requirement: Runtime compilation is validated before activation
The system SHALL validate generated runtime content before replacing the currently active runtime configuration.

#### Scenario: Validation failure
- **WHEN** generated runtime content fails validation
- **THEN** the system keeps the previously active runtime configuration unchanged and returns diagnostics

### Requirement: Runtime replacement is atomic and recoverable
The system SHALL replace the active runtime configuration atomically and retain a recoverable last known good runtime artifact.

#### Scenario: Atomic swap
- **WHEN** a newly compiled runtime is activated
- **THEN** the system replaces the prior active runtime artifact through an atomic update that prevents partial reads

#### Scenario: Failed activation recovery
- **WHEN** a new runtime artifact is written but the target core cannot successfully adopt it
- **THEN** the system restores the last known good runtime artifact and marks the activation attempt as failed

