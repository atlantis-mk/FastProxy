## 1. Data model and storage foundation

- [x] 1.1 Replace the monolithic profile payload model with repository resource models for subscriptions, node sets, rule sets, group sets, and composition-style profiles
- [x] 1.2 Extend the FastProxy data directory layout and persistence layer to store each repository resource as its own JSON document plus active-state metadata
- [x] 1.3 Add repository CRUD and activation APIs for profiles and source resources, including metadata returned to the frontend

## 2. Import and normalization pipeline

- [x] 2.1 Implement import flows for Clash subscriptions, plain node inputs, and manual node creation
- [x] 2.2 Define and implement the unified internal configuration model used by imported resources and profiles
- [x] 2.3 Add normalization diagnostics, validation responses, and protection against overwriting valid repository state on failed imports

## 3. Runtime compilation and activation

- [x] 3.1 Build a compiler that resolves the active profile and referenced resources into one active runtime configuration
- [x] 3.2 Add runtime validation, temporary-file writing, atomic active-runtime replacement, and last-known-good snapshot retention
- [x] 3.3 Expose runtime preview and activation status through the API so the frontend can show current compile results and failures

## 4. Core supervision and hot apply

- [x] 4.1 Evolve the core manager into a real supervisor that can start, stop, restart, and report status for the selected core
- [x] 4.2 Implement active-runtime file watching, serialized reload handling, and debounce protection for rapid configuration changes
- [x] 4.3 Deliver full V1 sing-box execution support while surfacing explicit “not yet supported” behavior for mihomo gaps

## 5. Frontend workspace evolution

- [x] 5.1 Add frontend API clients and state management for repository resources, profile activation, runtime preview, and supervisor status
- [x] 5.2 Introduce configuration workspace screens for profiles, subscriptions, nodes, groups, rules, and runtime state on top of the existing project UI
- [x] 5.3 Shift the default product entry flow from remote Clash backend setup toward local FastProxy-managed configuration and runtime control

## 6. Migration and verification

- [x] 6.1 Add migration or import support for existing profile JSON content so current local data is not stranded
- [x] 6.2 Add backend tests for repository persistence, normalization, compilation, rollback, and supervisor sequencing behavior
- [x] 6.3 Add frontend integration coverage or manual verification scripts for profile activation, runtime regeneration, and live core reconfiguration
