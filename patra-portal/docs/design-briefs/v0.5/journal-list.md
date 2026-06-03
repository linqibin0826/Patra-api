# 期刊浏览 / 检索页 — Design Brief

> 交给 Claude Design 的迭代简报（**本版第二份，独立于 `detail-pages.md`**）。设计系统与代码库已 onboard，本简报只交增量。
> 复制本文正文贴入 Claude Design chat；附首页 dev URL（`http://localhost:3000`）让它 web capture 保持风格连续。
> 同版相关：`detail-pages.md`（期刊/文献详情页 + 全局 404/错误页）——本页的卡片点击进入其中的期刊详情页，404/错误态**复用**那份已设计的共享屏。

**目标**：访客能浏览**全部期刊**、按刊名检索、按指标排序与按学科/分区/OA 筛选，从列表进入任一期刊详情页。
**关联**：Linear v0.5 项目；补齐首页"浏览全部期刊"的落点（该按钮当前 `disabled`、无去处）。

---

## 0. 策略与定位

- 走全站策略：**服务全体用户 + 渐进式披露**。默认层是一个干净、可扫读的期刊列表 + 检索/排序；**筛选（facet）默认收起**，按需展开。
- **职责边界**：本页检索的是**期刊**（按刊名/指标/学科）。它与首页的**文献检索**是两个不同实体的检索路线，互不重叠。
- 闭环：首页"浏览全部期刊" / TopNav → 本页 → 点期刊卡 → 期刊详情页 `/journals/[id]`。

---

## 1. 用户与场景

| 用户 | 场景 / 任务 |
|------|-----------|
| 全体（评估者 / 投稿作者 / 泛读者） | ① 漫游浏览：扫一遍某学科/某分区的期刊，发现感兴趣的刊 ② 定向检索：知道刊名，搜出来点进去 ③ 比较筛选：按分区/OA 缩小范围后挑刊 |

---

## 2. 要设计的屏 / 流程

| 屏 | 路由 | 用途 | 入口 → 出口 |
|----|------|------|------------|
| 期刊浏览/检索页 | `/journals` | 浏览 + 检索 + 排序 + 筛选全部期刊 | 首页"浏览全部期刊" / TopNav → 本页 → 点卡片 → `/journals/[id]` |

**文字流**：首页"浏览全部期刊"（解 disabled）→ `/journals` →(搜刊名 / 选排序 / 展开筛选) 收敛列表 →(点卡片) 期刊详情页。

> 共享状态屏（全局 404 / 错误页）已在 `detail-pages.md` 设计，本页直接复用，不重画。

---

## 3. 每屏内容与数据 ← 最关键

### `/journals` 期刊浏览/检索页

**① 默认层（常显）**
- **检索/排序条**（页面顶部）：
  - 刊名搜索框（搜期刊，placeholder 如"按刊名 / 缩写检索期刊"）
  - 排序切换：影响因子（默认降序）/ 中科院分区 / 刊名 A–Z / 被引总数
  - 筛选入口（展开深层 facet）+ 当前命中数（如"共 1,284 本期刊"）
- **期刊列表 / 网格**：复用 `JournalCoverCard` 的视觉语言，每张卡：封面 > 刊名（最重要）> 缩写 > 影响因子 · JCR 分区 · **中科院分区**
- **分页**：底部 load more 或页码
- 信息密度：高 —— 一屏尽量多放，参照首页期刊模块 + explore-feed 紧凑卡片。

**② 深数据层（折叠筛选 facet，默认收起）**
- **学科领域**：按 JCR/中科院学科分类筛
- **分区**：JCR（Q1–Q4）/ 中科院（1–4 区 · Top）
- **开放获取**：是否 OA / DOAJ
- （可选）国家 / 出版商

**代表性数据样例**：
```json
{
  "total": 1284,
  "page": 1,
  "pageSize": 24,
  "sort": "impactFactor,desc",
  "items": [
    {
      "id": "8841", "name": "The Lancet", "abbr": "Lancet", "cover": "/covers/lancet.jpg",
      "impactFactor": 98.4, "jcrQuartile": "Q1", "casQuartile": "1区", "casIsTop": true,
      "subjectArea": "General & Internal Medicine", "isOpenAccess": false
    },
    {
      "id": "1284", "name": "The New England Journal of Medicine", "abbr": "N Engl J Med", "cover": "/covers/nejm.jpg",
      "impactFactor": 96.2, "jcrQuartile": "Q1", "casQuartile": "1区", "casIsTop": true,
      "subjectArea": "General & Internal Medicine", "isOpenAccess": false
    }
  ]
}
```

---

## 4. 必做状态（逐屏点名）

- [ ] 默认（有列表）
- [ ] 加载中（skeleton 卡片列表 / 网格，沿用 explore-feed skeleton 语言）
- [ ] **空 / 无结果**（搜索或筛选无命中 →"未找到匹配 'xxx' 的期刊" + 清除筛选/重置建议）← 列表页特有，详情页没有
- [ ] **首屏空库**（极端：库里暂无期刊数据 → 友好引导，区别于"搜索无结果"）
- [ ] 错误（取数失败）→ 复用全局错误页
- [ ] 分页（load more / 页码；加载下一页时的局部 loading）
- **边界**：长刊名两行截断省略；缺封面 → 占位封面；某指标（IF/分区）缺失 → 该处不占位、不显；筛选展开/收起在移动端的承载。

---

## 5. 复用 vs 新增组件

**复用**：`TopNav` · `JournalCoverCard`（或其列表变体）· `card`/`badge`/`button`/`input` 原语 · explore-feed skeleton 约定 · **全局 404/错误页**（已设计）· 暖纸 editorial 令牌

**新增**（描述用途，视觉交 Claude Design）：
- `JournalSearchSortBar` —— 顶部检索 + 排序 + 命中数 + 筛选入口条
- `JournalFilterRail` / `JournalFilterSheet` —— 筛选 facet（桌面侧栏 / 移动抽屉）
- `JournalGrid` / `JournalListItem` —— 列表/网格容器（复用封面卡或其紧凑列表变体）
- `Pagination` —— 分页控件（或 load-more 按钮）
- `EmptyResult` —— 无结果/空库状态基元（可与 detail brief 的 `EmptyState` 统一）

---

## 6. 交互与响应式

- **检索**：刊名输入 → 提交/防抖检索；命中数实时更新。
- **排序**：切换即时重排（默认 IF 降序）。
- **筛选（渐进式披露）**：默认收起；展开后多选 facet，应用即收敛列表 + 反映在命中数；提供"清除全部筛选"。
- **分页**：load-more 或页码；加载下一页时局部 loading，不整页刷新。
- **元素状态**：hover / active / focus / disabled（卡片、排序项、筛选项、分页、搜索框均需 focus 可见）。
- **响应式**：
  - 桌面（≥768px）：主列表/网格 + 筛选侧栏（可折叠）；卡片可多列网格。
  - 移动（<768px）：单列 stack；筛选进**抽屉/sheet**；检索/排序条吸顶或精简。
  - 具体断点与列数交 Claude Design，简报只给意图。

---

## 7. 约束

- **视觉**：沿用暖纸感 editorial 风格 + 高信息密度；与首页期刊模块、期刊详情页风格连续。
- **技术**：映射到 **Next 15 App Router / Tailwind v4 / base-ui(shadcn)**；列表数据服务端取回，检索/排序/筛选/分页的交互态走 client component（URL query 同步以便分享/回退）。
- **可访问性**：语义化 HTML + ARIA；列表用 `list`/`listitem` 语义，筛选用 `group`/`checkbox` 语义，分页可键盘操作。
- **暗色模式**：不做（边界 E）。
- **本版边界**：本页只检索**期刊**；不混入文献检索（文献检索结果页仍 future）。

---

## 8. 参考

- **现有相关页**：首页 dev URL `http://localhost:3000`（web capture，延续期刊模块风格）；期刊详情页简报 `detail-pages.md`（卡片点进去的落点）。
- **竞品 / 灵感**（取其"什么"）：
  - **LetPub 期刊查询/分区列表**：中科院分区 + 多指标的列表信息密度与筛选维度。
  - **Scopus Sources** 列表：排序 + facet 筛选的组织方式。
  - **DOAJ 浏览**：OA 期刊浏览的卡片与筛选。

---

## 9. Done 判定

- 覆盖：`/journals` 屏 × 全部必做状态（§4，含空/无结果/空库）× 桌面 + 移动 全部产出。
- 渐进式披露：默认列表 + 折叠筛选有明确表达；刊名检索、排序、筛选、分页交互态齐全。
- 交回：记录 handoff prompt + URL；下载 zip 快照入 `docs/patra/design/snapshots/`。

---

## 附录 A. 理想字段 → 数据现状映射（给 BE 定缺口）

> 图例：✅ 已暴露 ｜🟡 DB 已有·待暴露 ｜🔶 需衍生/聚合 ｜🔴 DB 缺失

| 能力 / 字段 | 现状 | 来源 / 备注 |
|------------|------|------------|
| 列表卡：刊名/缩写/IF/JCR 分区 | ✅ | 现 `GET /portal/venues?topN` 已返回 |
| 列表卡：封面 | 🟡 | `cat_venue.image_object_key` |
| 列表卡：中科院分区 | 🟡 | `cat_venue_cas_rating` |
| **分页**（page/pageSize + total） | 🟡→需扩端点 | 现端点仅 `topN`，需扩为分页 |
| **排序**（IF / 中科院 / 刊名 / 被引） | 🟡→需扩端点 | 数据已有，需端点支持 `sort` 参数 |
| **刊名搜索**（q） | 🟡→需扩端点 | `title`/`abbreviated_title` 已有，需端点支持 `q` 模糊匹配 |
| 筛选：分区（JCR/中科院） | 🟡→需扩端点 | rating 表已有，需端点支持 facet 过滤 |
| 筛选：OA | 🟡→需扩端点 | `open_access.isOa` 已有，需过滤参数 |
| 筛选：学科领域 | 🔶→需聚合 | 由 rating `subject`/`research_direction` 聚合出可选项 + 过滤 |

**BE 缺口小结**：本页**不需要新采集数据**——全是"DB 已有"。核心工作是把现有 `GET /portal/venues`（仅 `topN`）**扩成支持 分页 + 排序 + 刊名检索 + facet 筛选** 的浏览/检索端点；学科 facet 需要一个 distinct 聚合。
