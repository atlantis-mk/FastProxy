## 1. Repository model and API

- [x] 1.1 Add persisted backend models and storage helpers for rule source repositories, including built-in repository definitions and per-core mappings
- [x] 1.2 Implement repository CRUD APIs and a core-aware repository tree endpoint for browsing selectable files
- [x] 1.3 Add backend validation and tests for repository support matrices, partial core mappings, and tree lookup failures

## 2. Managed rule set model and API

- [x] 2.1 Replace the current rule-set resource model with managed rule set assets and per-core variants in backend types, persistence, and API handlers
- [x] 2.2 Implement create, update, list, and delete flows for rule sets created either directly or from repository-backed selections
- [x] 2.3 Add backend validation and tests for variant uniqueness, required source fields, and supported-core metadata returned to clients

## 3. Routing and runtime resolution

- [x] 3.1 Update routing rule storage to reference managed rule set identities instead of raw rule-set tags or file details
- [x] 3.2 Extend runtime compilation to resolve rule set variants by active core and render the correct `sing-box` or `mihomo` output fragments
- [x] 3.3 Add compilation diagnostics and tests for missing variants, incompatible variant data, and successful per-core resolution

## 4. Frontend management workspace

- [x] 4.1 Rebuild the config-management rule set tab into repository management plus managed rule set management backed by real FastProxy APIs
- [x] 4.2 Add create and edit flows for both “directly add rule set” and “create from repository file” with per-core variant editors
- [x] 4.3 Remove the current placeholder rule set table and stale types so only the new asset-based model remains in the frontend

## 5. Frontend routing integration and verification

- [x] 5.1 Update routing rule screens to select logical managed rule sets instead of entering or inferring raw rule-set tags
- [x] 5.2 Reflect supported cores, missing variants, and compile-time errors in the routing and runtime preview UX
- [ ] 5.3 Verify the end-to-end workflow for built-in repositories, custom repositories, direct rule set creation, and per-core runtime compilation
