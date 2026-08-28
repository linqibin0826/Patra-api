#!/usr/bin/env bash
# design-sync 资产准备（re-sync 时在 patra-learn/ 下执行；见 .design-sync/NOTES.md）
set -euo pipefail
cd "$(dirname "$0")/.."
# 1) 从 .next 编译产物取 Tailwind CSS（tokens+utilities），剥掉 next/font 的 @font-face（url 指向 /_next/ 不可解析）
#    命中多个 chunk 时全部并入；零命中立即失败（未 build 或 token 变更）
SRCS=$(grep -l 'fafaf8' .next/static/css/*.css) || {
  echo "prepare.sh: .next/static/css 下未找到含设计 token 的 CSS，先跑 pnpm build" >&2
  exit 1
}
python3 - $SRCS <<'PY'
import re, sys
css = '\n'.join(re.sub(r'@font-face\{[^}]*\}', '', open(p).read()) for p in sys.argv[1:])
entry = '''/* design-sync 扁平 CSS 入口：Google Fonts 远程加载 + next/font 变量兜底 + Tailwind v4 编译产物 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap");
:root{--font-noto-sans-sc:"Noto Sans SC";--font-jetbrains-mono:"JetBrains Mono"}
''' + css
open('.design-sync-assets/entry.css','w').write(entry)
open('.design-sync-assets/tailwind.css','w').write(css)
print('entry.css:', len(entry), 'bytes', '| source chunks:', len(sys.argv) - 1)
PY
# 2) process-shim（config extraEntries 引用）：DS bundle 环境无 Node globals，next/link 等模块初始化会读 process.env.*
cat > .design-sync-assets/process-shim.js <<'JS'
// DS bundle 环境无 Node globals；next/link 等模块初始化会读 process.env.*
if (typeof window !== "undefined" && !window.process) {
  window.process = { env: { NODE_ENV: "development" } };
}
export const __processShim = true;
JS
# 3) 最小包 shim：让转换器与预览的 `import from 'patra-learn'` 可解析（不能整包 symlink——环形遍历 + ts-morph 爬 .next）
mkdir -p node_modules/patra-learn
cp package.json tsconfig.json node_modules/patra-learn/
ln -sfn ../../src node_modules/patra-learn/src
rm -rf node_modules/patra-learn/.design-sync-assets && cp -r .design-sync-assets node_modules/patra-learn/
