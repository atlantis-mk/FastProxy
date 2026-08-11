# FastProxy

FastProxy 是一个面向 `mihomo` 与 `sing-box` 的本地代理管理面板。项目将 Vue 3
前端、Go 后端和代理内核整合到一个可执行文件中，用统一的数据模型管理订阅、节点、
路由规则和运行时配置。

> 项目仍处于快速开发阶段，配置模型和使用方式可能继续调整。升级前建议备份数据目录。

## 功能

- 同时支持 `mihomo` 和 `sing-box`，可在同一面板中选择、启动、停止和重启内核。
- 管理订阅、手动节点、节点组、路由规则集、DNS、入站和全局运行参数。
- 将统一配置编译为对应内核的运行时配置，并在启动前执行内核校验。
- 支持内核二进制上传、本地路径配置、版本检查和 GitHub Release 更新。
- 提供代理选择、连接、日志、规则、流量、延迟和网络拓扑等运行状态视图。
- 配置源使用可读 JSON 保存，索引、缓存、历史和诊断数据使用 SQLite 保存。
- 前端与代理内核可嵌入 Go 二进制，便于在桌面系统、Linux 和 OpenWrt 上部署。

## 快速开始

### 使用发行版

从 [GitHub Releases](https://github.com/atlantis-mk/FastProxy/releases) 下载与系统和架构
匹配的压缩包，解压后运行 `fastproxy-server`（Windows 为 `fastproxy-server.exe`）。

Linux / macOS：

```bash
chmod +x ./fastproxy-server
./fastproxy-server
```

服务默认监听 `127.0.0.1:43171`。启动后访问：

```text
http://127.0.0.1:43171
```

发行工作流目前构建以下平台：

- Linux：amd64、arm64
- macOS：amd64、arm64
- Windows：amd64、arm64
- OpenWrt：386 softfloat、amd64、armv5、armv6、armv7、arm64

每个 Release 同时提供 `checksums.txt`，可用于校验下载文件的 SHA-256 摘要。

### macOS 系统服务

macOS 发行版可以安装为 LaunchDaemon：

```bash
sudo ./fastproxy-server install
```

默认服务仍监听 `127.0.0.1:43171`，数据保存在
`/Library/Application Support/FastProxy`，日志保存在 `/Library/Logs/FastProxy`。

如需自定义参数：

```bash
sudo ./fastproxy-server install \
  --addr 127.0.0.1:43171 \
  --data-dir "/Library/Application Support/FastProxy" \
  --mihomo-bin /path/to/mihomo \
  --sing-box-bin /path/to/sing-box
```

使用 `--no-start` 可以只安装文件而不立即启动服务。

## 源码开发

环境要求：

- Node.js 22+
- pnpm 11+
- Go 1.25+

克隆仓库并初始化后端子模块：

```bash
git clone --recurse-submodules https://github.com/atlantis-mk/FastProxy.git
cd FastProxy
pnpm install
```

同时启动前端和后端：

```bash
pnpm dev:fullstack
```

开发模式下，Vite 会把 `/api` 请求代理到 `http://127.0.0.1:43171`。可通过
`FASTPROXY_SERVER_PROXY_TARGET` 指向其他后端地址。

常用命令：

```bash
pnpm dev          # 启动 Vite 前端
pnpm type-check   # Vue / TypeScript 类型检查
pnpm lint         # ESLint 检查并修复
pnpm build        # 构建前端到 dist/
pnpm build:binary # 构建包含前端和代理内核的 Go 二进制
```

后端测试：

```bash
cd FastProxy-Server
go test ./...
```

`pnpm build:binary` 默认输出 `build/fastproxy-server`。可以用
`FASTPROXY_OUTPUT` 修改输出路径：

```bash
FASTPROXY_OUTPUT=/tmp/fastproxy-server pnpm build:binary
```

构建脚本会为目标平台准备内嵌代理内核，因此首次执行需要网络连接。

## 配置

服务支持命令行参数和环境变量：

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `FASTPROXY_SERVER_ADDR` | `127.0.0.1:43171` | HTTP 监听地址 |
| `FASTPROXY_SERVER_DATA_DIR` | `~/.config/fastproxy` | 数据目录 |
| `FASTPROXY_SERVER_LOG_LEVEL` | `info` | 日志级别：`debug`、`info`、`warn`、`error` |
| `FASTPROXY_SERVER_MIHOMO_BIN` | 内嵌或本地缓存 | 指定 mihomo 二进制路径 |
| `FASTPROXY_SERVER_SING_BOX_BIN` | 内嵌或本地缓存 | 指定 sing-box 二进制路径 |
| `GITHUB_TOKEN` | 空 | 用于检查和下载代理内核的 GitHub API token |

也可以直接传参：

```bash
./fastproxy-server \
  --addr 127.0.0.1:43171 \
  --data-dir /path/to/fastproxy-data \
  --log-level debug
```

未指定数据目录时，FastProxy 使用 `$XDG_CONFIG_HOME/fastproxy`；若未设置
`XDG_CONFIG_HOME`，则使用 `~/.config/fastproxy`。

## 项目结构

```text
src/                         Vue 3 前端
FastProxy-Server/            Go 后端子模块
  cmd/fastproxy-server/      服务入口
  internal/                  API、配置、仓库与运行时实现
scripts/                     本地开发、构建和运行时验证脚本
openspec/changes/            进行中的设计与变更说明
.github/workflows/build.yml  跨平台发行构建
```

更详细的后端说明和 API 列表见
[FastProxy-Server/README.md](./FastProxy-Server/README.md)。

## 致谢

FastProxy 的监控面板基于 [zashboard](https://github.com/Zephyruso/zashboard) 演进，
并使用 [mihomo](https://github.com/MetaCubeX/mihomo) 与
[sing-box](https://github.com/SagerNet/sing-box) 作为代理内核。

## License

[MIT](./LICENSE)
