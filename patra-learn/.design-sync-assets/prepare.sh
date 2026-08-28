#!/usr/bin/env bash
# design-sync 资产准备（re-sync 时在 patra-learn/ 下执行；见 .design-sync/NOTES.md）
set -euo pipefail
cd "$(dirname "$0")/.."
# 1) 从 .next 编译产物取 Tailwind CSS（tokens+utilities），剥掉 next/font 的 @font-face（url 指向 /_next/ 不可解析）
SRC=$(grep -l 'fafaf8' .next/static/css/*.css | head -1)
python3 - "$SRC" <<'PY'
import re, sys
css = re.sub(r'@font-face\{[^}]*\}', '', open(sys.argv[1]).read())
entry = '''/* design-sync 扁平 CSS 入口：Google Fonts 远程加载 + next/font 变量兜底 + Tailwind v4 编译产物 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap");
:root{--font-noto-sans-sc:"Noto Sans SC";--font-jetbrains-mono:"JetBrains Mono"}
''' + css
open('.design-sync-assets/entry.css','w').write(entry)
open('.design-sync-assets/tailwind.css','w').write(css)
print('entry.css:', len(entry), 'bytes')
PY
# 2) 最小包 shim：让转换器与预览的 `import from 'patra-learn'` 可解析（不能整包 symlink——环形遍历 + ts-morph 爬 .next）
mkdir -p node_modules/patra-learn
cp package.json tsconfig.json node_modules/patra-learn/
ln -sfn ../../src node_modules/patra-learn/src
rm -rf node_modules/patra-learn/.design-sync-assets && cp -r .design-sync-assets node_modules/patra-learn/
