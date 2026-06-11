## 1. SQLite Storage Foundation

- [x] 1.1 Add a local SQLite dependency and initialize the database under `repository/rule-source-indexes/rule-source-indexes.sqlite`
- [x] 1.2 Create idempotent schema setup for repository index metadata, directories, and entries
- [x] 1.3 Replace rule source index directory JSON and JSONL cache reads/writes with SQLite-backed CRUD and search
- [x] 1.4 Extract shared SQLite initialization, migration, and query helpers so future data domains do not duplicate rule-index-specific setup
- [x] 1.5 Add corruption/reinitialization handling that preserves JSON source configuration and reports a clear diagnostic event

## 2. Repository File Indexes

- [x] 2.1 Store built-in MetaCubeX rule source indexes in SQLite with directory paging and global search
- [x] 2.2 Store custom repository selectable file indexes in SQLite instead of transient in-memory or large JSON cache structures
- [x] 2.3 Add filters for repository index search by core, format, behavior, file kind, and path prefix
- [x] 2.4 Update repository APIs and frontend callers so large custom repositories are browsed and searched through paged SQLite queries
- [x] 2.5 Add backend tests proving stale JSON/JSONL index caches are ignored or removed after SQLite refresh

## 3. Node Cache Storage

- [x] 3.1 Design and create SQLite tables for normalized nodes, source links, deduplication keys, tags, disabled state, and refresh timestamps
- [x] 3.2 Write normalized subscription and import results into the node cache while preserving subscription/node-set JSON resources as source configuration
- [x] 3.3 Implement paged node list and search APIs for name, protocol, address, tag, source, and subscription
- [x] 3.4 Update node-related frontend views to use paged queries instead of loading all nodes from JSON bootstrap data
- [x] 3.5 Add tests for duplicate node refresh, source tracing, cache rebuild after database reset, and bounded search results

## 4. Health Check History

- [x] 4.1 Create SQLite tables for health check samples with node ID, check type, latency, success state, error summary, and timestamp
- [x] 4.2 Record successful and failed health checks from the core/runtime health pipeline
- [x] 4.3 Implement recent health state and bounded trend summary queries
- [x] 4.4 Add retention cleanup by configured time window or per-node sample count
- [x] 4.5 Add backend tests for latest-state queries, failure summaries, and retention cleanup

## 5. Operation Event Log

- [x] 5.1 Create SQLite event tables for refresh, import, compile, activation, core lifecycle, rollback, and failure events
- [x] 5.2 Add event writers to repository refresh, subscription import, runtime compile, profile activation, and core supervisor paths
- [x] 5.3 Redact secrets and cap event context payload size before persistence
- [x] 5.4 Implement paged event query APIs filtered by time, severity, event type, resource type, resource ID, profile, and core
- [x] 5.5 Add frontend diagnostics surfaces for recent errors and operation history

## 6. Runtime Snapshot History

- [x] 6.1 Create SQLite tables for runtime preview, compile, activation, and last-good snapshot summaries
- [x] 6.2 Record snapshot metadata including profile, core, status, output hash/path, input resource summary, diagnostics, and timestamp
- [x] 6.3 Keep complete generated runtime configs file-backed and store only safe bounded metadata in SQLite
- [x] 6.4 Implement recent runtime history APIs filtered by profile, core, status, and time
- [x] 6.5 Add tests for successful snapshot recording, failed compile diagnostics, and sensitive data exclusion

## 7. Cleanup and Verification

- [x] 7.1 Remove stale JSON cache paths, compatibility branches, and full-list bootstrap payloads for each migrated data domain
- [x] 7.2 Add data directory documentation that explains which files are source JSON and which data lives in SQLite
- [x] 7.3 Run `go test ./...` from `FastProxy-Server/` and fix or explicitly separate unrelated flaky failures
- [x] 7.4 Run `pnpm type-check` and `pnpm lint` after frontend query migrations
- [x] 7.5 Manually verify large repository browsing, global search, node search, event log filtering, health history, and runtime history in the local UI
