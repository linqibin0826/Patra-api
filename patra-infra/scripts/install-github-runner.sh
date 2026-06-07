#!/usr/bin/env bash
# 在 Mac mini 上安装 GitHub Actions self-hosted runner 为常驻服务（launchd）。
# ============================================================
# 用法（在 Mac mini 上运行）：
#   1. GitHub 仓库 → Settings → Actions → Runners → New self-hosted runner，
#      复制其中的 registration token（约 1 小时有效）。
#   2. bash patra-infra/scripts/install-github-runner.sh <REGISTRATION_TOKEN>
# runner labels：内置 self-hosted + 自定义 macmini（cd.yml 的 deploy job 据此选中）。
set -euo pipefail

TOKEN="${1:?用法: install-github-runner.sh <REGISTRATION_TOKEN>}"
REPO_URL="https://github.com/linqibin0826/patra"
RUNNER_DIR="$HOME/actions-runner"
ARCH="osx-arm64"           # Apple Silicon Mac mini

# 运行时查 GitHub API 取最新 runner 版本（避免硬编码版本失效导致下载 404）
RUNNER_VERSION="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest \
  | sed -nE 's/.*"tag_name": *"v([^"]+)".*/\1/p' | head -1)"
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
  --name "macmini" --labels "macmini" --unattended --replace

# 关键：非交互运行时 PATH 缺 OrbStack docker。config.sh 会按当前 PATH 生成 .path，
# 故必须在 config 之后覆写 .path 显式补 OrbStack docker 路径（/usr/local/bin），供 svc 读取。
echo "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin" > .path

echo "==> 安装为 launchd 服务并启动"
./svc.sh install
./svc.sh start
./svc.sh status
