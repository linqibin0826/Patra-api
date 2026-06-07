# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这个目录是什么

`patra-infra` 是 Patra 的**基建配置目录**，不是应用代码。它只包含：Docker Compose 编排（`docker/`）+ macOS 运维脚本（`scripts/`）。这里没有构建系统、没有测试、没有 lint —— 改动通过 `docker compose` 重启容器或 `launchctl` 重载 agent 来"生效"。

完整的部署手册、服务 URL、凭据、故障排查在 `docker/README.md`，本文件只补充架构大图景和容易踩的非显性约束。MacBook ↔ Mac mini 的连接 / 地址 / 路由类问题（含 tailscale、Shadowrocket、各组件 IP 注册）单独记在 `docs/mac-mini-connectivity.md`。

## 部署拓扑（理解一切的前提）

基础设施容器**不在本机（MacBook）跑**，而是全部部署在一台 **Mac mini**（tailscale MagicDNS 短名 `linqibins-mac-mini`，容器引擎 OrbStack）。MacBook 只跑 patra-api 应用进程，跨网络访问 Mac mini 上的容器。

- **网络无感切换**：在家同 LAN → MagicDNS 解析为 `192.168.1.11` 直连；离家 → 解析为 `100.73.7.112` 走 tailscale 隧道。无需任何切换配置。
- **应用侧单一开关**：所有微服务用一个环境变量 `PATRA_INFRA_HOST=linqibins-mac-mini` 指向容器；yml 默认值 `127.0.0.1` 仅作本地应急 fallback。改基建地址范式时要同步 patra-api 各 boot 模块的 yml（本目录范围外）。

因此**改 compose / .env 不能只在本机改**，要让 Mac mini 上的仓库副本 `git pull` 后重启容器。Mac mini 的部署 SSOT 是 **monorepo 的 sparse-checkout**（`~/Projects/patra`，仅 patra-infra）。日常迭代命令见 README "日常迭代"节，本质是 `ssh linqibin@linqibins-mac-mini 'cd ~/Projects/patra && git pull && bash patra-infra/scripts/compose-all.sh up'`。

## Compose 分栈结构

每个子栈是**独立的 Docker project**（`patra-core` / `patra-storage` / `patra-search` / `patra-observability` / `patra-tailnet` / `patra-jobs`），共享外部网络 `patra-net`。拆成多 project 是为了让 IDEA / OrbStack 的 Docker 视图按子栈分组显示，而非合成一个 `patra` 组。

| 子栈 / project | 内容 |
|---|---|
| `patra-core` | postgres / redis / nacos |
| `patra-storage` | minio / minio-init |
| `patra-search` | elasticsearch |
| `patra-observability` | otel-collector / prometheus / loki / tempo / grafana / alertmanager |
| `patra-tailnet` | tailscale-gw（共享出向网关） |
| `patra-jobs` | mysql-ops / xxl-job-admin / xxl-job-tailnet-route / rocketmq(namesrv+broker+dashboard) |
| `patra-apps` | registry / object-storage / catalog / ingest / gateway（应用容器，镜像来自 GHCR，由 CD 自动部署） |

- **多 project 编排入口是 `scripts/compose-all.sh`**（取代已删除的 `docker-compose.dev.yaml`）。compose 的 `include:` 会把所有子栈合并进同一个 project 无法分组，多 project 只能逐个 `up`，故用脚本编排：`compose-all.sh up [stack...]` / `down` / `ps`。
- **网络 `patra-net` 声明为 `external: true`**，须先于任何子栈存在；`compose-all.sh up` 会幂等创建。各 project 在共享网络上靠容器/服务名 DNS 互通（跨 project 同样生效，因 DNS 是网络作用域而非 project 作用域）。
- **路由边车 `xxl-job-tailnet-route` 在 `patra-jobs` 而非 `patra-tailnet`**：它用 `network_mode: "service:xxl-job-admin"` 共享 xxl-job-admin 的网络命名空间，`service:` 模式不能跨 project，故必须与 xxl-job-admin 同 project；`tailscale-gw` 作为共享网关独立在 `patra-tailnet`，边车靠 `patra-net` DNS 解析到它。
- 容器数据卷全是 bind mount，根目录是 Mac mini 上的 `~/.patra/docker/`，首次部署前必须跑 `scripts/init-volumes.sh` 建目录骨架（幂等）。

`xxl-job-admin` 用独立 MySQL 8 容器 `mysql-ops`（不暴露宿主机端口），因为它不支持 PG；**业务库一律走 PG**，`mysql-ops` 仅服务于这类不兼容 PG 的运维组件。

> **一次性迁移（从旧单 project `patra` 切到多 project）**：旧容器的 `container_name` 与新栈相同，不先拆旧 project 会因重名启动失败（安全失败，非数据丢失）。在 Mac mini 上 **git pull 前**先用旧文件拆掉：`docker compose -p patra down`（或对旧 `docker-compose.dev.yaml down`），再 pull、再 `compose-all.sh up`。bind mount 数据不受影响。

## 非显性约束（改之前必须知道）

1. **Nacos gRPC 跨 tailscale 必须走 ssh tunnel，不能直连。** tailscale wireguard MTU=1280，Nacos gRPC 的 HTTP/2 SETTINGS frame 经 Docker bridge(1500)→OrbStack→tailscale 时超过 1280 被静默丢弃，nacos-client 永远收不到 SETTINGS ACK 而卡 STARTING。解决办法是 MacBook 上跑 `scripts/install-nacos-tunnel.sh install` 装一个 launchd agent（`dev.patra.nacos-tunnel`），把本机 `127.0.0.1:{8848,9848,8080}` ssh 转发到 Mac mini。应用因此用 `NACOS_HOST=127.0.0.1`（默认值）即可，**不要**把 Nacos 地址改成 `PATRA_INFRA_HOST`。

2. **Mac mini 非交互 ssh 找不到 docker。** 非登录 shell 不加载完整 profile，OrbStack 的 docker 路径需写进 `~/.zshenv`：`echo 'export PATH=/usr/local/bin:$PATH' >> ~/.zshenv`。否则远程 `ssh ... docker ...` 报 command not found。

3. **RocketMQ broker 注册地址由 `.env` 的 `BROKER_IP1` 决定**，注册错会导致客户端连不上。回退方案是改用 FQDN `linqibins-mac-mini.taild06182.ts.net`（见 README 故障排查）。

4. **`.env` / `.env.dev` 含真实 dev 凭据且随仓库提交。** 这是有意为之 —— Mac mini 靠 `git pull` 同步这些配置（PG/MinIO/MySQL 密码、`NACOS_AUTH_TOKEN`/`IDENTITY` 等）。这些是 dev 默认值、对应服务仅在 tailscale 内网暴露，公网打不到端口。新增密钥时沿用此约定（`.env.example` 是模板，Nacos token 用 `openssl rand -base64 32` 生成）；如未来引入真正敏感的生产密钥，须改走外部 secret 注入、不要提交。

## Self-hosted Runner 与 CD（多服务）

5 个后端应用（registry / object-storage / catalog / ingest / gateway）由 GitHub Actions CD 自动部署，链路见 `.github/workflows/cd.yml`，设计见 `docs/patra/specs/2026-06-08-backend-multiservice-cd-design.html`（单服务首版见 `2026-06-07-cd-macmini-design.html`）。

- **服务 SSOT**：`patra-infra/cd/services.json` 列出每个服务的 `name / gradleTask / context / port / image / srcPrefix`。**加新服务 = 加一个条目**（再在 compose 加 service 块 + 建 `.env.<svc>`），workflow 逻辑不变。
- **选择性构建**：`patra-infra/cd/detect-changes.sh` 按 git diff 把改动路径映射到 services.json 的 srcPrefix，只构建/部署改动的服务。**改公共面**（`patra-api/patra-common*` / `linqibin-commons/*` / `patra-starters/*` / `build-logic` / `gradle` / 根构建脚本 / `service.Dockerfile` / `docker-compose.apps.yaml` / `.env.common` / `cd.yml` / `services.json`）→ **重建全部 5 个**（正确性优先，宁可多建不可漏建）；docs / 前端 patra-portal / 运维脚本 / markdown 改动不触发构建。
- **三段 job**：`detect-changes`（算改动服务，输出 matrix JSON）→ `build-and-push`（ubuntu，动态 `matrix.service` 只构建改动的，用共享 `service.Dockerfile` build 推 `ghcr.io/linqibin0826/patra-<svc>`）→ `deploy`（Mac mini，单 job 循环按依赖顺序 **object-storage 优先**，`compose pull + up` + 逐服务 `/actuator/health`）。
- **共享分层 Dockerfile**：`patra-infra/docker/service.Dockerfile` 一份供 5 服务共用（`--build-arg APP_PORT` 区分端口）；5 服务都用 `linqibin.hexagonal-boot` 打 fat jar，Spring Boot 4 `jarmode=tools` 分层结构通用，依赖层缓存复用使弱网每次只传变化的 application 层。
- **runner**：Mac mini 上 `install-github-runner.sh` 装的 self-hosted runner（labels `self-hosted,macmini`，launchd 常驻），对 GitHub 出向长轮询、无入站端口，deploy 在本地跑，零网络打洞。
- **触发与回滚**：push main 命中相关 paths 自动跑；`workflow_dispatch` 填 `service`（单服务名）+ `image_tag`（旧 sha）即回滚（跳过构建，直接部署 GHCR 已有镜像）。安全：不监听 `pull_request`，self-hosted runner 绝不跑 fork PR 代码。
- **容器内 Nacos 无需 ssh tunnel**：应用容器和 nacos 同在 `patra-net`，gRPC 走 Docker bridge 不经 tailscale，直接 `NACOS_HOST=nacos`。
- **runner 的 docker PATH**：靠 `~/actions-runner/.path` 补 `/usr/local/bin`（runner 不依赖 `~/.zshenv`）。
- **env 三层 + 密钥二分**：`env_file` 顺序叠加 `.env.common`（共享基建坐标，patra-net 服务名 + 内网 dev 默认）→ `.env.<svc>`（服务专属 DB/Redis/bucket/日志路径）→ `.env.<svc>.secret`（真敏感密钥，被 `.gitignore` 的 `.env.*.secret` 挡住，绝不进仓库，缺失时跳过，后者覆盖同名）。**外部数据源 API key（Scopus / 青果 proxy / RocketMQ ACL 等）一律只进 `.secret`**，committed 文件只放内网 dev 默认值。

## scripts 一览

| 脚本 | 跑在哪 | 作用 |
|---|---|---|
| `init-volumes.sh` | Mac mini | 首次部署建数据卷目录骨架（幂等） |
| `install-nacos-tunnel.sh {install\|uninstall\|status}` | MacBook | 装/卸 Nacos ssh tunnel launchd agent |
| `install-github-runner.sh <token>` | Mac mini | 安装 GitHub self-hosted runner 为 launchd 常驻服务（CD deploy job 在此执行） |
| `install-tailscale-route-guard.sh` + `tailscale-route-guard.sh` | macOS（root LaunchDaemon） | 守护 tailnet 路由：Shadowrocket 等代理拨断重连时清除被抢占的克隆主机路由并 `tailscale down/up` 重协商 |
| `*.plist` | — | 上述两个 launchd 任务的模板 |
