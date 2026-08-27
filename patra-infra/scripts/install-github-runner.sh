#!/usr/bin/env bash
# 在 Mac mini 上安装 GitHub Actions self-hosted runner 为常驻服务（launchd）。
# ============================================================
# 用法（在 Mac mini 上运行）：
#   1. GitHub 仓库 → Settings → Actions → Runners → New self-hosted runner，
#      复制其中的 registration token（约 1 小时有效）。
#   2. bash patra-infra/scripts/install-github-runner.sh <REGISTRATION_TOKEN>
# runner labels：内置 self-hosted + 自定义 macmini（cd.yml 的 deploy job 据此选中）。
#
# 运维要点（2026-08-27 实战沉淀）：
#   - mini 出网必须经 Clash Verge（mixed-port 7897，常驻）；runner 是 launchd 服务、
#     不继承 shell 代理，故代理必须写进 $RUNNER_DIR/.env（本脚本固化）
#   - --disableupdate 关闭自更新：launchd 环境曾因下载走不了代理卡死自更新；
#     升级方式=闲时重跑本脚本（registration 保留时只更新二进制与配置）
#   - 派发任务期间严禁 ./svc.sh stop/start——会杀死执行中的 Worker，job 显示 cancelled；
#     重启前先 gh run list --status in_progress 确认为空
#   - runner 离线 >30 天 GitHub 自动删除 registration（2026-08 实际发生）；
#     runner-watchdog.yml 每日巡检兜底。重装=重新取 registration token 跑本脚本
#   - CD 在本机跑 gradlew（构建原生 arm64 镜像），JAVA_HOME 指向 mise 全局 java。
#     两台 Mac 环境保持一致（用户约定）：Homebrew + brew 装 mise + zulu 25 全局钉版，前置：
#       brew install mise && mise install java@zulu-25.30.17.0 && mise use -g java@zulu-25.30.17.0
#     升级 JDK 时 MacBook 与 mini 一起升同一版本
set -euo pipefail

TOKEN="${1:?用法: install-github-runner.sh <REGISTRATION_TOKEN>}"
REPO_URL="https://github.com/linqibin0826/patra"
RUNNER_DIR="$HOME/actions-runner"
ARCH="osx-arm64"           # Apple Silicon Mac mini

# 运行时查 GitHub API 取最新 runner 版本（避免硬编码版本失效导致下载 404）
RUNNER_VERSION="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest \
  | sed -nE 's/.*"tag_name": *"v([^"]+)".*/\1/p' | head -1)"
: "${RUNNER_VERSION:?无法从 GitHub API 解析 runner 版本（API 结构变更或限流），请稍后重试}"
echo "==> 最新 runner 版本: ${RUNNER_VERSION}"
TARBALL="actions-runner-${ARCH}-${RUNNER_VERSION}.tar.gz"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -f "./config.sh" ]; then
  echo "==> 下载 runner ${RUNNER_VERSION} (${ARCH})"
  curl -fSL -o "$TARBALL" \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${TARBALL}"
  tar xzf "$TARBALL"
  rm -f "$TARBALL"
fi

echo "==> 注册 runner 到 $REPO_URL"
./config.sh --url "$REPO_URL" --token "$TOKEN" \
  --name "macmini" --labels "macmini" --unattended --replace --disableupdate

# 关键：非交互运行时 PATH 缺 OrbStack docker。config.sh 会按当前 PATH 生成 .path，
# 故必须在 config 之后覆写 .path 显式补 OrbStack docker 路径（/usr/local/bin），供 svc 读取。
echo "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin" > .path

# launchd 服务不继承 shell 环境：代理与 JAVA_HOME 必须固化进 .env（runner 启动时读取）
MISE_BIN="$(command -v mise || echo /opt/homebrew/bin/mise)"
JH="$("$MISE_BIN" where java 2>/dev/null || true)"
if [ -z "$JH" ] || [ ! -x "$JH/bin/java" ]; then
  echo "⚠ 未找到 mise 全局 java（CD 构建需要；两台 Mac 同套管理）。先执行：" >&2
  echo "    brew install mise && mise install java@zulu-25.30.17.0 && mise use -g java@zulu-25.30.17.0" >&2
  echo "  再重跑本脚本。" >&2
  exit 1
fi
cat > .env <<EOF
LANG=en_US.UTF-8
http_proxy=http://127.0.0.1:7897
https_proxy=http://127.0.0.1:7897
no_proxy=localhost,127.0.0.1,.local,100.64.0.0/10,192.168.0.0/16,nacos,postgres,redis
JAVA_HOME=$JH
EOF
echo "==> .env 已写入（代理 + JAVA_HOME=$JH）"

echo "==> 安装为 launchd 服务并启动"
./svc.sh install
./svc.sh start
./svc.sh status
