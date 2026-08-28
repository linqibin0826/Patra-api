# patra-learn 设计系统使用约定

Patra 学习站的组件库：地铁线路图隐喻的内部学习站（中文内容站）。浅色单主题，纸感底色 + 五条线路色。

## 零包装，即插即用

组件无需任何 Provider/Theme 包装，直接渲染即可。交互组件（CheckInButton / CodeBlock / ContinueCard / MetroMap / GlossaryWall）自带状态（学习进度存 localStorage），首帧呈零进度态属正常。

## 样式惯用法：Tailwind 类 + CSS 变量，两层分工

**⚠️ 编译产物按站内用量 tree-shaken**：只有下面列出的类真实存在，写清单之外的 Tailwind 类不会生效——需要额外样式时用内联 style 引用 CSS 变量。

可用的 token 类（中性/语义色，定义见 styles.css）：

| 族 | 类 |
|---|---|
| 底色 | `bg-bg`（页面纸感底）`bg-surface`（卡片白）`bg-mist`（浅灰块/代码底） |
| 文字 | `text-ink`（主文）`text-slate`（正文灰）`text-fog`（次要）`text-ok`（绿/教训）`text-danger`（红/警示）`text-surface`（深底白字） |
| 描边 | `border-line`（统一描边色）`border-ok` `border-l-danger` |
| 字体 | `font-sans`（Noto Sans SC；标题配 `font-black` 站牌黑 900）`font-mono`（JetBrains Mono） |
| 常用形状 | `rounded-2xl`（卡片）`rounded-xl`（按钮/块）`rounded-lg`（徽章）`rounded-full`（胶囊） |

CSS 变量（内联 style 可用）：`--color-bg/surface/mist/line/fog/slate/ink/ok/danger`、`--font-noto-sans-sc`、`--font-jetbrains-mono`。

**线路五色不在 token 里**——它们是数据：每条线的 `color`/`softColor` 经内联 style 使用（L1 `#2e66c9` 蓝 / L2 `#d95b32` 橙 / L3 `#7a5fb8` 紫 / L4 `#1e8e7e` 青 / L5 `#b0498c` 品红）。给 LineChip / ArticleLayout 传 Line 对象；自己的布局要线路色时写 `style={{ color: "#d95b32" }}`。

## 真相在哪

先读 `styles.css`（token 与全部可用类）与每个组件的 `.d.ts`（props 契约）/ `.prompt.md`（用法）。`ArticleLayout` 的 `line`/`station` props 需要完整对象，形如：

```jsx
const line = { id: "l2", name: "2 号线 · 上线线", theme: "合并后的自动部署（CD）",
  color: "#d95b32", softColor: "#e27e5c", status: "open",
  stations: [{ id: "native-build", name: "本机打包", summary: "arm64 原生构建" }] };
```

## 惯用组合示例（已验证渲染）

```jsx
import { ArticleSection, InlineCode, LineChip } from "patra-learn";

<div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
  <LineChip line={line} label="2 号线" />
  <ArticleSection title="镜像就位：本地优先，退避拉取">
    <p>
      部署脚本先看本机有没有这个版本的镜像，只有回滚才去 <InlineCode>GHCR</InlineCode> 拉，
      按 30 / 60 / 120 秒退避重试。
    </p>
  </ArticleSection>
</div>
```

正文语体：中文、地铁/考试隐喻、口语但准确；标题用短名词短语配 `font-black`。
