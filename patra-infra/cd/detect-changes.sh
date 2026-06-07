#!/usr/bin/env bash
# ============================================================================
# 选择性构建：算出本次需要 build/deploy 的服务，输出紧凑 JSON 数组到 stdout。
# 供 .github/workflows/cd.yml 的 detect-changes job 调用，可本地测试（兼容 bash 3.2）。
#
# 用法：
#   detect-changes.sh push <BEFORE_SHA> <AFTER_SHA>     # push 事件：按 git diff 算
#   detect-changes.sh dispatch <SERVICE|all|"">          # 手动触发：指定服务
#
# 规则：
#   - dispatch：指定服务 → [该服务]；空 或 "all" → 全部服务
#   - push：BEFORE 全零（首次/force push）→ 全部；否则 git diff 映射 services.json 的 srcPrefix
#   - 改动文件命中某服务 srcPrefix → 该服务进集合
#   - 改动文件命中 ignore 列表（前端/文档/脚本等）→ 跳过
#   - 改动文件既不属任何服务、也不在 ignore（公共模块/build-logic/gradle/根构建/共享 Dockerfile/
#     compose/.env.common/cd.yml/services.json 等"共享面"）→ rebuild all（正确性优先，宁可多建）
#   输出顺序遵循 services.json 顺序。
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_JSON="$SCRIPT_DIR/services.json"
TAB="$(printf '\t')"

all_services() { jq -c '[.services[].name]' "$SERVICES_JSON"; }

MODE="${1:-}"

case "$MODE" in
  dispatch)
    SVC="${2:-}"
    if [ -z "$SVC" ] || [ "$SVC" = "all" ]; then
      all_services
    elif jq -e --arg s "$SVC" '.services[]|select(.name==$s)' "$SERVICES_JSON" >/dev/null; then
      jq -cn --arg s "$SVC" '[$s]'
    else
      echo "未知服务 ${SVC} : not in services.json" >&2
      exit 1
    fi
    ;;

  push)
    BEFORE="${2:-}"
    AFTER="${3:-}"
    ZERO="0000000000000000000000000000000000000000"
    if [ -z "$BEFORE" ] || [ "$BEFORE" = "$ZERO" ]; then
      all_services
      exit 0
    fi
    CHANGED="$(git diff --name-only "$BEFORE" "$AFTER")"
    [ -z "$CHANGED" ] && { echo '[]'; exit 0; }

    PREFIX_FILE="$(mktemp)"
    HITFILE="$(mktemp)"
    CHANGED_FILE="$(mktemp)"
    trap 'rm -f "$PREFIX_FILE" "$HITFILE" "$CHANGED_FILE"' EXIT
    jq -r '.services[] | "\(.name)\t\(.srcPrefix)"' "$SERVICES_JSON" > "$PREFIX_FILE"
    printf '%s\n' "$CHANGED" > "$CHANGED_FILE"

    REBUILD_ALL=0
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      # ignore（不触发任何构建）：前端 / 文档 / 运维脚本 / 任意 markdown。
      # 用 case glob 做前缀匹配（避免正则锚点把前缀误成精确匹配）。
      case "$f" in
        patra-portal/*|docs/*|.claude/*|patra-infra/scripts/*|*.md) continue ;;
      esac
      matched=0
      while IFS="$TAB" read -r name prefix; do
        [ -z "$name" ] && continue
        case "$f" in
          "$prefix"*) echo "$name" >> "$HITFILE"; matched=1 ;;
        esac
      done < "$PREFIX_FILE"
      [ "$matched" -eq 0 ] && REBUILD_ALL=1
    done < "$CHANGED_FILE"

    if [ "$REBUILD_ALL" -eq 1 ]; then
      all_services
    else
      sort -u "$HITFILE" -o "$HITFILE"
      jq -c --rawfile hits "$HITFILE" '
        ($hits | split("\n") | map(select(length>0))) as $h
        | [.services[].name | select(. as $n | $h | index($n))]
      ' "$SERVICES_JSON"
    fi
    ;;

  *)
    echo "用法: detect-changes.sh push <BEFORE> <AFTER> | dispatch <SERVICE|all>" >&2
    exit 1
    ;;
esac
