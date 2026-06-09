#!/usr/bin/env bash
# detect-changes.sh classify 的零依赖测试。用法：bash patra-infra/cd/detect-changes.test.sh
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DETECT="$SCRIPT_DIR/detect-changes.sh"
PASS=0; FAIL=0

# 断言：把 $1（换行分隔的变更文件）喂给 classify，比较 jq 取出的 $2 字段 == 期望 $3
assert_field() {
  local files="$1" field="$2" expected="$3" desc="$4"
  local got
  got="$(printf '%s\n' "$files" | bash "$DETECT" classify | jq -c "$field")"
  if [ "$got" = "$expected" ]; then PASS=$((PASS+1)); printf '  ✓ %s\n' "$desc"
  else FAIL=$((FAIL+1)); printf '  ✗ %s\n    field %s 期望 %s 实得 %s\n' "$desc" "$field" "$expected" "$got"; fi
}

echo "== 场景 1：仅前端 =="
assert_field "patra-portal/app/page.tsx" '.backend_units' '[]' "前端 backend_units 空"
assert_field "patra-portal/app/page.tsx" '.portal_changed' 'true' "前端 portal_changed"
assert_field "patra-portal/app/page.tsx" '.docs_only' 'false' "前端非 docs_only"

echo "== 场景 2：仅 docs =="
assert_field "$(printf 'README.md\ndocs/x.html')" '.docs_only' 'true' "docs_only"
assert_field "README.md" '.backend_units' '[]' "docs backend 空"

echo "== 场景 3：catalog 私有实现（不外溢）=="
F="patra-api/patra-catalog/patra-catalog-infra/src/main/java/X.java"
assert_field "$F" '.backend_units' '["catalog"]' "catalog 私有只跑 catalog"
assert_field "$F" '.full_run' 'false' "catalog 私有非全量"
assert_field "$F" '.coverage_mode' '"flags"' "catalog coverage=flags"

echo "== 场景 4：registry-api 契约扇出 =="
F="patra-api/patra-registry/patra-registry-api/src/main/java/X.java"
assert_field "$F" '.backend_units' '["catalog","foundation","ingest","registry"]' "registry-api 扇出 consumers"
assert_field "$F" '.full_run' 'false' "registry-api 非全量"

echo "== 场景 5：object-storage-api 契约扇出 =="
F="patra-api/patra-object-storage/patra-object-storage-api/src/main/java/X.java"
assert_field "$F" '.backend_units' '["ingest","object-storage"]' "object-storage-api 扇出 ingest"

echo "== 场景 6：全局 path → 全量；foundation 模块 → 扇出（非全量）=="
assert_field "build-logic/src/main/kotlin/x.gradle.kts" '.full_run' 'true' "build-logic 全量"
assert_field "patra-api/patra-common/patra-common-model/src/main/java/X.java" '.full_run' 'false' "common-model 非全量"
assert_field "patra-api/patra-common/patra-common-model/src/main/java/X.java" '.backend_units' '["catalog","foundation","ingest"]' "common-model 扇出 catalog/foundation/ingest"

echo "== 场景 7：workflow 自身变更 → 全量后端 + portal =="
assert_field ".github/workflows/ci.yml" '.full_run' 'true' "workflow 全量"
assert_field ".github/workflows/ci.yml" '.portal_changed' 'true' "workflow 额外含 portal"

echo "== 场景 8：混合（catalog + portal）=="
F="$(printf 'patra-api/patra-catalog/patra-catalog-app/src/main/java/X.java\npatra-portal/app/x.tsx')"
assert_field "$F" '.backend_units' '["catalog"]' "混合 backend=catalog"
assert_field "$F" '.portal_changed' 'true' "混合 portal=true"

echo
echo "通过 $PASS / 失败 $FAIL"
[ "$FAIL" -eq 0 ]
