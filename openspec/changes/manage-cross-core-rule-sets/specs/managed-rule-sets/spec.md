## ADDED Requirements

### Requirement: System manages logical rule sets as user-selectable assets
The system SHALL manage rule sets as logical assets that can be enabled, edited, deleted, and selected from routing configuration independently from the underlying repository file, URL, or local path used to implement them.

#### Scenario: Directly creating a rule set
- **WHEN** a user creates a rule set without selecting any repository
- **THEN** the system stores a managed rule set asset that can later be referenced by routing rules

#### Scenario: Creating a rule set from repository selection
- **WHEN** a user creates a rule set by choosing a file from a configured repository
- **THEN** the system stores a managed rule set asset that references the chosen repository-backed implementation

### Requirement: Managed rule sets support per-core variants
The system SHALL allow a managed rule set to define separate variants for `sing-box` and `mihomo`, with each variant storing the source mode and core-specific fields needed to resolve that implementation.

#### Scenario: One logical rule set supports both cores
- **WHEN** a managed rule set is configured with both `sing-box` and `mihomo` variants
- **THEN** the system stores the two variants under one logical rule set identifier rather than creating separate assets per core

#### Scenario: One logical rule set supports only one core
- **WHEN** a managed rule set has only a `sing-box` variant configured
- **THEN** the system keeps the rule set available for `sing-box` workflows and marks `mihomo` support as unavailable

### Requirement: Managed rule sets expose only logical selection data to routing UIs
The system SHALL provide routing-facing selection data in terms of managed rule set identifiers, names, and supported cores instead of exposing repository refs, internal file paths, or remote URLs as the primary selection contract.

#### Scenario: Routing page loads available rule sets
- **WHEN** the routing UI requests available rule sets for selection
- **THEN** the response includes logical asset metadata sufficient to display and select rule sets without requiring the UI to parse implementation details

#### Scenario: Editing implementation details
- **WHEN** a user opens a managed rule set for editing
- **THEN** the system returns the full variant configuration for that asset, including source mode and source-specific fields
