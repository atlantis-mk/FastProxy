## Why

FastProxy 目前已经有前端面板、后端 API 骨架、配置持久化与核心选择状态，但配置模型仍然停留在“单 profile 持有整份 JSON 内容”的阶段，无法支撑订阅导入、节点拆分管理、规则与分组独立存储，以及配置变更后的稳定热生效。现在正是把项目从“面板 + 占位后端”升级为“本地聚合内核 VPN 管理器”的合适时机，因为核心抽象、数据目录和前端壳子都已经具备基础。

## What Changes

- 将当前单一 `profile` 大文件模型演进为“源配置仓库 + 唯一运行时配置”的双层模型。
- 新增本地配置仓库能力，分别存储订阅、节点集、规则集、分组集和场景 profile，全部使用 JSON 持久化。
- 新增配置导入与归一化能力，支持 Clash 订阅、纯节点导入和手动添加节点，并将不同来源统一映射到内部模型。
- 新增运行时编译能力，仅在运行前把多个源配置合并为唯一的运行时配置文件。
- 新增核心监督与热生效能力，监听运行时文件变更并重载或重启核心进程，而不重启 FastProxy 应用本身。
- 将前端从“直连 Clash Controller 的远程面板”逐步调整为“默认连接本地 FastProxy Server 的配置工作台 + 运行面板”。
- V1 优先跑通 `sing-box`，保留 `mihomo` 抽象与接口，但不要求第一阶段完成双核心完整等价实现。

## Capabilities

### New Capabilities
- `local-config-repository`: 管理订阅、节点、规则、分组和 profile 的独立 JSON 存储、查询和激活关系。
- `config-import-normalization`: 导入 Clash 订阅、纯节点和手动节点，归一化为统一内部模型并保留来源元数据。
- `runtime-compilation`: 从激活的源配置集合编译出唯一生效的运行时配置，并提供校验、预览和失败保护。
- `core-supervision`: 监督选中的核心进程，监听运行时配置变化并执行热重载或仅重启核心进程。

### Modified Capabilities
- None.

## Impact

- 后端会新增或重构 `profile`、`core`、`api`、`appdata` 相关模块，并引入更细粒度的数据模型与运行时编译层。
- 前端会新增配置工作台相关页面、状态管理和 API 封装，同时逐步减少对外部 Clash Controller API 结构的直接耦合。
- 数据目录结构会从当前 `profiles/` 为主，扩展为多个源配置目录和唯一 `runtime/active` 产物。
- 运行时管理会从当前的状态占位器扩展为真正的核心 supervisor、文件监听器和回滚保护逻辑。
