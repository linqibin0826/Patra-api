# 期刊详情页 + 文献详情页 — Design Brief

> 交给 Claude Design 的迭代简报。设计系统与代码库已 onboard（首页即出自它手），本简报只交本次增量。
> 复制本文正文贴入 Claude Design chat 首条 prompt；附首页 dev URL（`http://localhost:3000`，让它 web capture 保持风格连续）。

**目标**：访客从首页点开任一**期刊**或**文献**，进入对应详情页查看真实数据——期刊页快速认识并评估一本刊，文献页判断一篇文献值不值得读并读到核心。
**关联**：Linear `PAP-39`（产品定义）→ 输入给 `PAP-40`（期刊 hi-fi）/ `PAP-41`（文献 hi-fi）；版本规划见 `docs/patra/release-specs/v0.5-portal-detail-pages.md`。

---

## 0. 贯穿全简报的策略：服务全体用户 + 渐进式披露

Patra 门户面向**所有类型用户**（临床医生、科研人员、研究生、投稿作者……），不为某一类裁页面。两页统一采用**渐进式披露**：

- **默认层**：常显，只放"绝大多数人都需要"的核心信息，干净、低密度、3 秒可读。
- **深数据层**：专业/重度信息默认**收起**，由用户主动展开（本版用**同页折叠**，见 §6）。

> 这是全站策略，已固化进 `patra-portal/CLAUDE.md`。本简报每个屏都按"默认层 / 深数据层"标注模块归属。

**本简报覆盖 4 个屏**：① 期刊详情页 ② 文献详情页 ③ 全局 404（新建，全站复用）④ 全局错误页（新建，全站复用）。③④ 是全站目前缺失的基础状态屏，本次一并设计成可复用资产。

---

## 1. 用户与场景

| 屏 | 主要用户 | 来这页要完成的核心任务 |
|----|---------|----------------------|
| 期刊详情页 | 全体（评估者 / 投稿作者 / 泛读者） | 快速认识一本刊、判断其水平（分区/影响力）、了解收录范围；重度用户深挖三套评级、OA/APC、趋势 |
| 文献详情页 | 全体（临床 triage / 系统综述 / 泛读者） | 判断这篇值不值得读 / 能不能引、读摘要、跳全文；重度用户深挖作者机构、MeSH、资助、溯源 |

> 设计上不为单一人格特化：默认层服务"看一眼就走"的多数派，深数据层服务"要深挖"的少数派，同一页面同时满足两端。

---

## 2. 要设计的屏 / 流程

| 屏 | 路由 | 用途 | 入口 → 出口 |
|----|------|------|------------|
| 期刊详情页 | `/journals/[id]` | 认识 + 评估一本期刊 | 首页期刊卡片 / "浏览全部期刊" → 本页；本页**不含**该刊文献列表（边界 A） |
| 文献详情页 | `/papers/[id]` | 判断 + 精读一篇文献 | 首页 explore-feed 文献卡"详情" → 本页 → 期刊名可跳期刊详情页 |
| 全局 404 | `not-found` | 路由/资源不存在统一页 | 任意坏 URL / 不存在的 id → 本页 |
| 全局错误页 | `error` | 渲染/取数异常兜底 | 任意页取数失败 / 抛错 → 本页 |

**文字流**：
- 首页期刊卡片 →(点击) 期刊详情页
- 首页 explore-feed 文献卡 →(点"详情") 文献详情页 →(点期刊名) 期刊详情页 ← **两页闭环**
- 任意页 id 不存在 →(Next notFound) 全局 404；任意页抛错 →(Next error boundary) 全局错误页

---

## 3. 每屏内容与数据 ← 最关键

### 3.1 期刊详情页 `/journals/[id]`

**① 默认层（常显）**
- **期刊头部 masthead**：封面图 > 刊名（最重要）> 缩写 > 出版商 · ISSN · 国家 · 创刊年
- **影响力速览**（一行 3–4 个指标卡）：JCR 影响因子 · JCR 分区 · **中科院分区**（国内医学场景核心信号）
- **定位**：学科领域 + 是否开放获取（OA badge）
- **主操作**：去期刊官网 / 主页外链
- 信息密度：中 —— 参照首页紧凑卡片，masthead 可略大。

**② 深数据层（折叠，按需展开）**
- **完整评级明细**：JCR（影响因子/分区/学科百分位/排名）｜ 中科院 CAS（大类/小类/Top/综述）｜ Scopus（CiteScore/SJR/SNIP/百分位）
- **文献计量**：h-index · i10 · 被引总数 · 年发文量；**年度发文 / 被引趋势图**
- **收录与出版**：出版频率 · 创刊/停刊史 · MEDLINE 索引状态 · 语言/媒介
- **开放获取细节**：OA 类型 · **APC 费用** · DOAJ 收录
- **关系与标识**：关联学会 · 全部 ISSN / 各类标识符

**代表性数据样例（理想字段形态，非现有 DTO）**：
```json
{
  "id": "8841",
  "name": "The Lancet",
  "abbreviation": "Lancet",
  "cover": "/covers/lancet.jpg",
  "publisher": "Elsevier",
  "issnList": ["0140-6736", "1474-547X"],
  "country": "GB",
  "foundedYear": 1823,
  "subjectAreas": ["General & Internal Medicine"],
  "isOpenAccess": false,
  "homepageUrl": "https://www.thelancet.com",
  "metrics": {
    "jcr": { "impactFactor": 98.4, "quartile": "Q1", "percentile": 99.2, "rank": "1/167", "subject": "Medicine, General & Internal" },
    "cas": { "majorCategory": "医学", "majorQuartile": "1区", "minorSubject": "医学：内科", "minorQuartile": "1区", "isTop": true, "isReview": false },
    "scopus": { "citeScore": 84.7, "sjr": 15.6, "snip": 21.3, "percentile": 99 },
    "bibliometric": { "hIndex": 812, "i10Index": null, "citedByCount": 1820000, "worksCount": 24500 }
  },
  "publicationProfile": { "frequency": "Weekly", "medlineIndexed": "Currently-indexed", "languages": ["en"] },
  "openAccess": { "isOa": false, "oaType": "hybrid", "apcUsd": 6420, "isInDoaj": false },
  "yearlyStats": [ { "year": 2023, "worksCount": 1240, "citedByCount": 210000 } ],
  "affiliatedSocieties": []
}
```

> **注意一个真实缺口**：`cat_venue` 没有"期刊编辑简介"那种自由文本 prose 字段。"定位/范围"目前只能由结构化事实（学科 + 频率 + 索引 + OA）拼出来。**设计上请把"定位"做成由这些结构化标签/短句组合的区块，而非假设有一段编辑撰写的简介段落**（若未来补采集 prose 简介，该区块可平滑替换为段落）。

### 3.2 文献详情页 `/papers/[id]`

**① 默认层（常显）**
- **标题**（最重要，可为非英文原题 + 译题）
- **作者**：前几位 + et al（标注通讯作者 ✉）
- **期刊来源 · 年份** —— 期刊名是**链接**，点击跳 `/journals/[id]`（两页闭环）
- **证据等级 badge** —— 见下方野心说明
- **文献类型**：Journal Article / Review / Clinical Trial / RCT…
- **摘要**（页面核心，结构化分段渲染：背景 / 方法 / 结果 / 结论）
- **关键标识**：DOI · PMID（可复制 + 外链）
- **主操作**：去全文（OA 链接 / DOI 跳转）· 收藏（mock）· AI 速读（mock 占位）

**② 深数据层（折叠，按需展开）**
- **完整作者列表 + 机构归属（affiliation）** + 通讯/同等贡献标记
- **MeSH 主题词 / 关键词**（主题词可标 major topic）
- **资助信息**（funder / grant id）
- **其他标识符**：PMCID / PII / arXiv
- **各类日期**：投稿 / 接收 / 出版 / 电子出版
- **参考文献数 · 利益冲突声明 · 替代语言摘要**

> **野心点 — 证据等级（evidence level）**：对临床用户价值极高（一眼分清 RCT > 队列 > 病例报告的证据强度）。它不是现成干净字段，需由文献类型 + MeSH 衍生。**本简报把它作为默认层一等公民设计**（badge + 颜色梯度），下游 BE 标记为"需衍生"。设计时请给出"证据等级未知/无法判定"时的降级样式。

**代表性数据样例（含结构化摘要）**：
```json
{
  "id": "39912345",
  "title": "Tirzepatide for the Treatment of Obstructive Sleep Apnea",
  "originalTitle": null,
  "venue": { "id": "1284", "name": "N Engl J Med", "year": 2024 },
  "evidenceLevel": "RCT",
  "publicationType": ["Randomized Controlled Trial", "Journal Article"],
  "authors": [
    { "name": "Malhotra A", "order": 1, "isFirst": true, "isCorresponding": false, "affiliation": "UC San Diego, La Jolla, CA" },
    { "name": "Grunstein RR", "order": 2, "isCorresponding": true, "affiliation": "Woolcock Institute, Sydney" }
  ],
  "abstract": {
    "type": "structured",
    "sections": [
      { "label": "BACKGROUND", "text": "Obstructive sleep apnea (OSA) is associated with obesity..." },
      { "label": "METHODS", "text": "We conducted two phase 3, double-blind, randomized trials..." },
      { "label": "RESULTS", "text": "Tirzepatide reduced the apnea–hypopnea index..." },
      { "label": "CONCLUSIONS", "text": "Among persons with moderate-to-severe OSA and obesity..." }
    ]
  },
  "identifiers": { "doi": "10.1056/NEJMoa2404881", "pmid": "39912345", "pmcid": "PMC11234567" },
  "meshHeadings": ["Sleep Apnea, Obstructive", "Obesity", "Incretins"],
  "keywords": [],
  "funding": [ { "funder": "Eli Lilly", "grantId": null } ],
  "dates": { "received": "2024-05-10", "accepted": "2024-06-20", "published": "2024-06-21" },
  "numberOfReferences": 42,
  "isOa": true, "oaUrl": "https://www.nejm.org/doi/full/10.1056/NEJMoa2404881",
  "aiSummary": null
}
```

### 3.3 全局 404 / 错误页（共享屏）

- **全局 404**：访客访问不存在的期刊/文献 id 或坏 URL 时统一落地。内容：暖纸感插画/排版 + 一句有 Patra 人格的文案（非冷冰冰 "Not Found"）+ 返回首页 / 去检索（未来）入口。
- **全局错误页**：取数失败 / 服务异常兜底。内容：可读的错误提示 + "重试" + 返回首页；不暴露堆栈。
- 两屏均需 **桌面 + 移动** 两视图，且与首页同一视觉语言。

---

## 4. 必做状态（逐屏点名，一个不漏）

> Claude Design 刚搭建，全站尚无任何状态屏，下列每一项都需出稿。

**期刊详情页**
- [ ] 默认（有数据）
- [ ] 加载中（skeleton，沿用/建立 explore-feed skeleton 语言）
- [ ] 错误（取数失败）→ 复用全局错误页
- [ ] 404（期刊 id 不存在）→ 复用全局 404
- [ ] 字段级降级：无封面占位 · 某套评级缺失则该模块隐藏不占位 · 无趋势数据则趋势区不显 · 无 APC 则不显

**文献详情页**
- [ ] 默认（有数据）
- [ ] 加载中（skeleton）
- [ ] 错误 → 全局错误页
- [ ] 404（文献 id 不存在）→ 全局 404
- [ ] 字段级降级：无摘要 →"暂无摘要" · 证据等级无法判定 → 降级样式 · 作者超长 → 折叠 et al · 无 MeSH/资助则该组不显 · `aiSummary`/收藏为 mock 占位

**共享屏**
- [ ] 全局 404（桌面 + 移动）
- [ ] 全局错误页（桌面 + 移动）
- [ ] 统一加载骨架基线（给后续页面一个复用的 skeleton 语言）

---

## 5. 复用 vs 新增组件

**复用**（按名引用，别重造）：`TopNav` · `AISummaryBadge` · `PaperCard` 的排版语言 · `card`/`badge`/`button`/`tabs` 原语 · explore-feed skeleton 约定 · 暖纸 editorial 视觉令牌（`src/styles/tokens.css`）

**新增**（描述用途，视觉交 Claude Design）：
- `JournalMasthead` —— 期刊页头部（封面 + 身份信息）
- `MetricBadge` —— 影响力指标小卡（IF / 分区 / 中科院，默认层）
- `RatingTable` —— 三套评级明细表（期刊深层）
- `TrendChart` —— 年度发文/被引趋势（期刊深层）
- `DisclosureSection` —— **两页共用**的可展开深数据分组（渐进式披露载体）
- `AbstractBlock` —— 结构化摘要分段渲染（背景/方法/结果/结论）
- `AuthorList` —— 作者列表（默认 et al / 展开全列表 + 机构 + 通讯标记）
- `EvidenceLevelBadge` —— 证据等级标签（含"未知"降级态）
- `IdentifierChip` —— DOI/PMID/PMCID 可复制 + 外链
- `EmptyState` / `ErrorState` / `NotFoundState` —— 共享状态屏基元

---

## 6. 交互与响应式

- **渐进式披露机制（两页统一）**：**同页折叠**。默认层常显于上，深数据层作为下方可展开分组（点击展开/收起）。不用 Tab（藏到第二屏）、不用抽屉（塞大量数据体验差）。
  > 这是*方向*：视觉表达 Claude Design 可优化（如深层用分节卡片 + 展开按钮），但"默认展开 / 深层折叠 / 同页"的披露模型锁定。
- **元素状态**：hover / active / focus / disabled（外链、展开按钮、可复制标识、期刊名链接均需 focus 可见）。
- **微交互**：skeleton → 内容；折叠区展开/收起过渡；标识符"复制成功"反馈。
- **响应式**：桌面（≥768px）可"主内容 + 侧栏"承载次要信息（如期刊页指标侧栏、文献页操作侧栏）；移动（<768px）单栏 stack、深数据更收拢。**具体断点布局交 Claude Design**，简报只给意图。
- **交叉链接**：文献页期刊名 → `/journals/[id]`。

---

## 7. 约束

- **视觉**：沿用现有暖纸感 editorial 风格 + 高信息密度（borders 做活、阴影克制）；与首页风格连续。
- **技术**：产出需能映射到 **Next 15 App Router（RSC 优先）/ Tailwind v4 / base-ui(shadcn)**；详情页数据服务端取回。
- **可访问性**：语义化 HTML + ARIA + 键盘可达 + 合理 focus order；折叠区用 `disclosure`/`button[aria-expanded]` 语义。
- **暗色模式**：**不做**（单一中文 light theme，边界 E）。
- **本版边界**（务必体现在稿中）：
  - 期刊页**不含**该刊文献列表（边界 A）。
  - 文献页 `aiSummary` 为 **mock 占位**、收藏为 **mock**（边界 B/C），不接真实后端。

---

## 8. 参考

- **现有相关页**：首页 dev URL `http://localhost:3000`（让 Claude Design web capture，延续风格）。
- **竞品 / 灵感**（取其"什么"）：
  - 期刊页：**LetPub 期刊详情**的多指标信息密度 + 中科院分区呈现；Scopus Sources / JCR 的指标卡组织。
  - 文献页：**PubMed abstract 页**的结构化摘要 + MeSH 区；**Semantic Scholar** 的 TLDR/证据提示卡；Europe PMC 的标识符与全文入口。

---

## 9. Done 判定

- 覆盖：**4 个屏**（期刊详情 / 文献详情 / 全局 404 / 全局错误页）× **全部必做状态**（§4）× **桌面 + 移动** 全部产出。
- 渐进式披露在期刊页、文献页均有明确"默认层/深数据层"表达。
- 证据等级、结构化摘要、三套评级、机构归属等核心野心点在稿中清晰呈现。
- 交回：每页记录 "Send to local coding agent" 的 prompt + URL；下载 zip 快照入 `docs/patra/design/snapshots/`。

---

## 附录 A. 理想字段 → 数据来源现状映射（给 BE 定缺口）

> 图例：✅ 已暴露（列表端点已返回）｜🟡 DB 已有·待暴露（仅需开端点/加字段）｜🔶 需衍生（DB 有原料、需计算）｜🔴 DB 缺失（需新增采集）｜⬜ Mock（本版不接真实数据）

### A.1 期刊页

| 字段 | 层 | 现状 | 来源 / 备注 |
|------|----|------|------------|
| 刊名 / 缩写 | 默认 | ✅ | `cat_venue.title` / `abbreviated_title` |
| 出版商 | 默认 | 🟡 | `publication_profile.hostOrganization.name` |
| ISSN（含全部） | 默认/深 | 🟡 | `issn_l` + `cat_venue_identifier` |
| 国家 / 创刊年 | 默认 | 🟡 | `country_code` / `publication_profile.publicationHistory.startYear` |
| JCR 影响因子 / 分区 | 默认 | ✅ | `cat_venue_jcr_rating`（列表 DTO 已用） |
| 中科院分区（大/小类/Top） | 默认/深 | 🟡 | `cat_venue_cas_rating` |
| 学科领域 / 定位 | 默认 | 🟡 | 由 rating subject / research_direction 拼 |
| OA badge | 默认 | 🟡 | `open_access.isOa` |
| 期刊官网外链 | 默认 | 🔴 | `cat_venue` 无独立 homepage URL 字段，需采集（societies.url 非官网） |
| 期刊编辑简介（prose） | 默认 | 🔴 | 无自由文本字段，本版用结构化事实替代；未来可补采集 |
| JCR 百分位/排名、Scopus、文献计量 | 深 | 🟡 | `cat_venue_jcr_rating` / `cat_venue_scopus_rating` / `citation_metrics` |
| 年度发文/被引趋势 | 深 | 🟡 | `cat_venue_publication_stats` |
| 出版频率 / 创停刊史 / MEDLINE 索引 | 深 | 🟡 | `publication_profile`（frequency / publicationHistory / indexingInfo） |
| OA 类型 / APC / DOAJ | 深 | 🟡 | `open_access`（oaType / apcUsd / isInDoaj） |
| 关联学会 | 深 | 🟡 | `affiliated_societies` |

### A.2 文献页

| 字段 | 层 | 现状 | 来源 / 备注 |
|------|----|------|------------|
| 标题 / 原题 | 默认 | 🟡 | `cat_publication.title` / `original_title`（列表 DTO 仅 title） |
| 作者（前几位） | 默认 | ✅ | `cat_publication_author`（列表 DTO 已用展示名） |
| 期刊来源 + 年份 | 默认 | ✅ | `journal` / `publication_year` |
| 期刊来源 → 链接 id | 默认 | 🟡 | `cat_publication.venue_id`（已持久化，需暴露给前端做跳转） |
| **证据等级** | 默认 | 🔶 | 由 `cat_publication_type` + MeSH 衍生；需 BE 定义衍生规则 |
| 文献类型 | 默认 | 🟡 | `cat_publication_type`（列表 DTO 有 kind） |
| **摘要（结构化分段）** | 默认 | 🟡 | `cat_publication_abstract.plain_text` / `structured_sections` |
| DOI / PMID | 默认 | ✅ | 列表 DTO 已用 |
| 去全文 OA 链接 | 默认 | 🟡 | `cat_publication_oa_location`（landing/pdf url） |
| AI 速读 | 默认 | ⬜ | 边界 B，本版 mock；待接真实 LLM |
| 收藏 | 默认 | ⬜ | 边界 C，本版 mock；无用户系统 |
| 完整作者 + 机构归属 | 深 | 🟡 | `cat_publication_author` + `cat_publication_author_affiliation` |
| MeSH / 关键词 | 深 | 🟡 | `cat_publication_mesh_heading` / `cat_publication_keyword` |
| 资助信息 | 深 | 🟡 | `cat_publication_funding` |
| 其他标识符（PMCID/PII/arXiv） | 深 | 🟡 | `cat_publication_identifier` |
| 各类日期 | 深 | 🟡 | `cat_publication_date` |
| 参考文献数 / 利益冲突 / 替代语言摘要 | 深 | 🟡 | `number_of_references` / `conflict_of_interest` / `cat_publication_alternative_abstract` |

**缺口小结（给 BE）**：真正需要新增工作的只有三处——🔴 期刊官网 URL（采集）、🔴 期刊编辑简介 prose（采集，本版可不做、用结构化替代）、🔶 证据等级（衍生规则）。其余几乎全是 🟡"DB 已有、仅需开端点暴露"——本版野心绝大部分是"免费"的。
