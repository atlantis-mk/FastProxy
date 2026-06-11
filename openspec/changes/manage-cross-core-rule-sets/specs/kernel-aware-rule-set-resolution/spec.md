## ADDED Requirements

### Requirement: Routing rules reference managed rule sets logically
The system SHALL store routing rule references to rule sets as managed rule set identifiers or equivalent logical references, rather than as core-specific tags or source file paths.

#### Scenario: Saving a routing rule with rule set references
- **WHEN** a user saves a routing rule that uses one or more managed rule sets
- **THEN** the persisted routing rule stores logical rule set references that remain valid across supported cores

#### Scenario: Reading routing configuration
- **WHEN** the client reads routing rule configuration
- **THEN** the system returns logical rule set references that can be resolved against the managed rule set catalog

### Requirement: Runtime compilation resolves the variant matching the active core
The system SHALL resolve each referenced managed rule set to the variant matching the active profile's selected core before generating runtime configuration output.

#### Scenario: Compiling for sing-box
- **WHEN** the active profile selects `sing-box` and references a managed rule set with a `sing-box` variant
- **THEN** the compiler uses that `sing-box` variant to generate the runtime rule set configuration and route rule references

#### Scenario: Compiling for mihomo
- **WHEN** the active profile selects `mihomo` and references a managed rule set with a `mihomo` variant
- **THEN** the compiler uses that `mihomo` variant to generate the runtime rule provider configuration and route rule references

### Requirement: Compilation fails clearly when a referenced rule set lacks a variant for the active core
The system SHALL reject compilation when a referenced managed rule set has no variant for the active core, and it SHALL report which rule set and core caused the failure.

#### Scenario: Missing variant for active core
- **WHEN** a routing rule references a managed rule set that lacks a variant for the active profile's selected core
- **THEN** compilation fails without changing the active runtime output and returns diagnostics naming the missing rule set and core

#### Scenario: Unsupported source data for target core
- **WHEN** a matching variant exists but its source data cannot be rendered for the active core
- **THEN** compilation fails with diagnostics describing the incompatible rule set implementation
