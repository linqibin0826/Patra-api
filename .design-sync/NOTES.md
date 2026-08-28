# design-sync NOTES — patra-learn

- 预览导出名必须以 ASCII 大写字母开头（emit.mjs 的 cells 过滤 `/^[A-Z]/`）——中文导出名会被静默滤掉，报 "no exports"。
- 宽组件预览容器不要低于 ~560px（TopBar 400px 下站名换行撑破定高，是组件真实行为）。
- GlossaryWall 需 overrides.viewport=1280x800（lg 断点看视口宽度，容器 maxWidth 无效；900 默认视口只出 2 列且底部裁切）。
- ContinueCard 的 MidJourney 预览用渲染期预置 localStorage 模拟进度（effect 自清理，不污染其他捕获）。

## Re-sync 步骤（一次命令前的准备）

1. 在 patra-learn/ 跑 `pnpm build && bash .design-sync-assets/prepare.sh`（重建 Tailwind 编译产物 + 包 shim；shim/资产是生成物不入库）
2. 重拷 staged 脚本到 .ds-sync/ 并在其中 `npm i esbuild ts-morph @types/react playwright@<与 chromium 缓存匹配版>`
3. 从项目取 _ds_sync.json 存 .design-sync/.cache/remote-sync.json，跑 resync.mjs --remote 指向它

## Re-sync 风险（下次要盯的）

- `.design-sync-assets/tailwind.css` 是站内用量 tree-shaken 的：站点删类会让 DS 里该 utility 消失（conventions.md 的类清单要跟着核）；conventions.md 里"可用类清单"每次重同步按 base SKILL 验证一遍
- process-shim（extraEntries）是 next/link 内联的前提——升级 next 后若报新的 Node globals（Buffer 等）需扩 shim
- GlossaryWall 依赖 overrides.viewport=1280x800；站点改断点/加词条要复核截图
- 字体走 Google Fonts 远程（[FONT_REMOTE] 属预期）；渲染环境断网时字体回退 PingFang
- ContinueCard 的 MidJourney cell 预置 localStorage——progress key 改名（现 patra-learn.progress.v1）会让该 cell 退回零进度态

## Known render warns

- MetroMap "variants render identically"（若出现）：单一渲染形态组件，仅 1 个导出，属合理
