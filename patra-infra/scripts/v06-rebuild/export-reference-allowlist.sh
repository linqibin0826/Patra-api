#!/usr/bin/env bash
# v0.6 换库重建：参考域数据导出 + 恢复 + 行数对照（在 Mac mini 上执行）。
#
# 用法:
#   bash export-reference-allowlist.sh export    # 从 backup 库按 allowlist 导出 custom archive
#   bash export-reference-allowlist.sh restore   # 恢复进新库（前置：目标表全为空）
#   bash export-reference-allowlist.sh verify    # backup vs new 逐表行数对照
#
# 三个子命令必须在**同一个维护窗口内连续跑完**，且 verify 必须在触发重导之前跑：
# 重导会向 KEEP 类主表（cat_keyword / cat_venue 等）做 upsert，一旦跑过重导，
# new 库行数就会大于 backup，verify 的行数对照失去判别力（无法区分"回填漏了"与"重导加的"）。
#
# 配套 runbook: docs/patra/runbooks/v0.6-catalog-rebuild-runbook.md 步骤 7。
# bash 3.2 兼容（macOS 自带）：变量一律 ${VAR} 花括号形态——中文注释/全角标点紧邻变量
# 会被并入变量名，是本仓库踩过的历史坑。
set -euo pipefail

# shellcheck disable=SC2209  # PG 是命令前缀，展开时需要词拆分
PG="docker exec patra-postgres"
BACKUP_DB="patra_catalog_v05_backup"
NEW_DB="patra_catalog"
DUMP="/tmp/v06-reference-data.dump"   # 路径在 patra-postgres 容器内

# ============================================================================
# 显式 allowlist —— 33 张 KEEP 表（2026-08-29 于 mini 线上 information_schema 核对）
#
# 分类规则：
#   - cat_publication 与全部 cat_publication_*  → DROP（本次重导重建，共 22 张）
#   - flyway_schema_history                     → DROP（新库 Flyway 自生成，绝不回填）
#   - cat_venue_publication_stats               → KEEP（296,600 行，baseline 不重建）
#   - 其余全部（venue 域 / ROR / MeSH / 评级 / cat_author 家族 / keyword 主表）→ KEEP
#
# 注意：cat_keyword（关键词主表）KEEP，cat_publication_keyword（关联表）DROP——
# 重导会向 cat_keyword upsert，允许。
#
# 改这个列表前先重跑 runbook 步骤 7.0 的 allowlist 盲核 SQL（新增表不会被自动发现）。
# ============================================================================
TABLES=(
  cat_author
  cat_author_name_variant
  cat_author_orcid
  cat_investigator
  cat_keyword
  cat_mesh_concept
  cat_mesh_concept_relation
  cat_mesh_descriptor
  cat_mesh_entry_combination
  cat_mesh_entry_term
  cat_mesh_qualifier
  cat_mesh_scr
  cat_mesh_scr_heading_mapped_to
  cat_mesh_scr_indexing_info
  cat_mesh_scr_pharmacological_action
  cat_mesh_scr_source
  cat_mesh_tree_number
  cat_organization
  cat_organization_external_id
  cat_organization_location
  cat_organization_name
  cat_organization_relation
  cat_venue
  cat_venue_cas_rating
  cat_venue_cas_warning
  cat_venue_identifier
  cat_venue_indexing_history
  cat_venue_instance
  cat_venue_jcr_rating
  cat_venue_mesh
  cat_venue_publication_stats
  cat_venue_relation
  cat_venue_scopus_rating
)

# 自检：allowlist 绝不能混入 DROP 类表（防手滑粘错）
for t in "${TABLES[@]}"; do
  case "${t}" in
    flyway_schema_history|cat_publication|cat_publication_*)
      echo "allowlist 含禁止回填的表: ${t}" >&2
      exit 2
      ;;
  esac
done

TABLE_ARGS=()
for t in "${TABLES[@]}"; do
  TABLE_ARGS+=(-t "public.${t}")
done

# 断言指定库存在，不存在则退出（防止在错误的重建阶段误跑子命令）。
db_must_exist() {
  local n
  # shellcheck disable=SC2086
  n=$(${PG} psql -U postgres -d postgres -Atc \
        "SELECT count(*) FROM pg_database WHERE datname = '${1}'")
  if [ "${n}" != "1" ]; then
    echo "库不存在: ${1}（当前重建阶段不对，请核对 runbook 步骤）" >&2
    exit 3
  fi
}

case "${1:?用法: export|restore|verify}" in
  export)
    db_must_exist "${BACKUP_DB}"
    # 防覆盖：已有归档先按 mtime 时间戳改名留存，绝不静默覆盖
    if ${PG} test -f "${DUMP}"; then
      ts=$(${PG} date -r "${DUMP}" +%Y%m%d%H%M%S)
      echo "已存在归档 ${DUMP}，先改名留存为 ${DUMP}.${ts}"
      # shellcheck disable=SC2086
      ${PG} mv "${DUMP}" "${DUMP}.${ts}"
    fi
    echo "== 导出 ${BACKUP_DB} 的 ${#TABLES[@]} 张参考表 → ${DUMP}"
    # --strict-names: allowlist 里任一表在源库不存在就直接失败，而不是静默少导
    # shellcheck disable=SC2086
    ${PG} pg_dump -U postgres -d "${BACKUP_DB}" -Fc --data-only --strict-names \
      "${TABLE_ARGS[@]}" -f "${DUMP}"
    # shellcheck disable=SC2086
    ${PG} sh -c "ls -lh ${DUMP} && sha256sum ${DUMP}"
    echo "== 归档可读性验证（pg_restore --list 前 20 行）"
    # shellcheck disable=SC2086
    ${PG} pg_restore --list "${DUMP}" | head -20
    ;;

  restore)
    db_must_exist "${NEW_DB}"
    echo "== 前置检查：${NEW_DB} 中 ${#TABLES[@]} 张目标表必须全为空"
    for t in "${TABLES[@]}"; do
      # shellcheck disable=SC2086
      n=$(${PG} psql -U postgres -d "${NEW_DB}" -Atc "SELECT count(*) FROM ${t}")
      if [ "${n}" != "0" ]; then
        echo "目标表非空: ${t}=${n}，拒绝恢复" >&2
        exit 1
      fi
    done
    echo "== 恢复（--single-transaction，失败整体回滚）"
    # shellcheck disable=SC2086
    ${PG} pg_restore -U postgres -d "${NEW_DB}" --single-transaction --data-only "${DUMP}"
    echo "== 恢复完成，请立即跑 verify"
    ;;

  verify)
    db_must_exist "${BACKUP_DB}"
    db_must_exist "${NEW_DB}"
    fail=0
    for t in "${TABLES[@]}"; do
      # shellcheck disable=SC2086
      a=$(${PG} psql -U postgres -d "${BACKUP_DB}" -Atc "SELECT count(*) FROM ${t}")
      # shellcheck disable=SC2086
      b=$(${PG} psql -U postgres -d "${NEW_DB}" -Atc "SELECT count(*) FROM ${t}")
      if [ "${a}" != "${b}" ]; then
        echo "行数不一致: ${t} backup=${a} new=${b}"
        fail=1
      else
        echo "OK ${t}: ${a}"
      fi
    done
    if [ "${fail}" = "0" ]; then
      echo "== 全部 ${#TABLES[@]} 张表行数一致"
    else
      echo "== 存在不一致表，禁止进入下一步" >&2
    fi
    exit "${fail}"
    ;;

  *)
    echo "未知子命令: ${1}（用法: export|restore|verify）" >&2
    exit 2
    ;;
esac
