## Why

FastProxy 的本地仓库正在从少量 JSON 配置文件演进为包含大量节点、规则索引、刷新记录、健康检查和运行时快照的本地数据系统。继续把所有可查询数据都放在散落 JSON 文件里，会让分页、筛选、去重、历史追踪和跨资源关联越来越难维护。

规则集索引已经率先迁到 SQLite；现在需要把同类“数量会增长、需要查询或关联”的数据纳入统一的 SQLite 持久化策略，同时保留小型用户配置 JSON 的可读性。

## What Changes

- 将 SQLite 明确为 FastProxy 本地可查询数据的标准存储层，用于大量、历史型、索引型和关联型数据。
- 保留 JSON 作为小型用户编辑配置的 source-of-truth，例如基础配置、少量 profile 装配关系和手写资源定义。
- 将订阅节点缓存和节点归一化结果纳入 SQLite，用于分页、搜索、去重、来源追踪和后续分组选择。
- 将节点健康检查和测速历史纳入 SQLite，用于最近状态、趋势摘要和失败率统计。
- 将刷新、导入、编译、激活和核心操作事件纳入 SQLite，用于可查询事件日志与错误排查。
- 将自定义规则仓库和其他远程仓库文件索引纳入 SQLite，与内置规则集索引共享查询模型。
- 将运行时编译/预览快照摘要纳入 SQLite，用于历史 diff、最近成功配置追踪和问题诊断。
- 明确不把所有 JSON 配置一次性迁入 SQLite；只有具备查询、分页、历史或关联需求的数据进入 SQLite。

## Capabilities

### New Capabilities

- `queryable-local-data-store`: 定义 FastProxy 使用 SQLite 保存可查询本地数据的边界、数据库生命周期、schema 管理和 JSON/SQLite 分工。
- `node-cache-storage`: 管理订阅和导入后的节点缓存、归一化节点元数据、去重键、来源关系和分页搜索。
- `health-check-history`: 记录节点健康检查、测速结果和摘要查询，用于展示最近状态、失败率和延迟趋势。
- `operation-event-log`: 记录刷新、导入、编译、激活、核心启动/重载失败等操作事件，并支持按资源、级别和时间查询。
- `repository-file-indexes`: 将内置和自定义仓库的文件树/规则文件索引统一保存到 SQLite，支持目录分页和全局搜索。
- `runtime-snapshot-history`: 保存运行时编译和预览快照摘要，支持历史查看、差异定位和 last-good 诊断。

### Modified Capabilities

- None.

## Impact

- 后端 `internal/repository` 会从“JSON 文件仓库 + 少量 SQLite 索引”演进为“JSON 配置仓库 + SQLite 查询库”的双层存储。
- 后端需要新增 SQLite schema 管理、迁移/初始化、查询接口和针对节点、事件、仓库索引、健康检查、运行时快照的测试。
- 前端会逐步把大列表、历史页、搜索框和诊断页改为分页查询，不再一次性加载大量 JSON。
- 数据目录会继续保留现有 JSON 资源目录，同时新增或扩展本地 SQLite 数据库文件；旧 JSON 索引缓存需要在对应迁移完成后清理。
- 依赖层面继续使用当前 Go 后端已引入的 `modernc.org/sqlite`，避免 CGO 运行时要求。
