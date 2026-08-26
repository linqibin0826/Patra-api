# CLAUDE.md

## 产品定义

**Patra** — 医学出版物数据平台，采集、解析、存储来自 PubMed / EPMC / Crossref 等 10+ 外部数据源的文献和期刊数据。

## 项目背景

本项目是全新代码库（Greenfield Project），由单人开发，无时间压力。
**始终牢记:** 这是绿地项目，无任何历史包袱，可以从零开始设计和实现最优方案。

### 核心事实

1. 零历史包袱:不存在旧版本，无需向后兼容、数据迁移或渐进式重构
2. 单人团队:整个项目由 linqibin 一人负责，无团队协作成本
3. 质量优先:可投入任何必要时间实现最优方案，技术卓越是唯一标准

### 执行要求

1. 不明白的地方反问我，先不急着编码
2. 直接采用最优解决方案，数据结构、架构按最终形态设计
3. 发现更好方案立即替换，可随时重构，不保留旧实现
4. 所有组件、文档、API 只维护当前版本，修改时直接替换整个模块

### 禁止行为

1. 禁止考虑向后兼容、数据迁移、渐进式重构、历史遗留逻辑
2. 禁止创建多版本并存、编写兼容 adapter、使用 deprecated 标记（直接删除或重写）
3. 禁止以时间限制、人力不足、快速交付为由采用次优方案
4. 禁止提及"如果时间允许"、"建议后续优化"、"分阶段实施"

## 安全红线（公开仓库）

**本仓库 `linqibin0826/patra` 是 GitHub 公开仓库**——任何提交内容（含 git 历史）都全互联网可读且永久留痕。

1. 禁止提交真正敏感的密钥：外部数据源 API key（PubMed / EPMC / Crossref 等）、个人访问令牌、生产数据库/对象存储凭据、私钥证书。这类密钥一律走环境变量或外部 secret 注入，绝不进仓库。
2. 一旦发现敏感密钥被提交，立即轮换作废，再清理跟踪——"反正服务连不上"不是不轮换的理由。
3. **已知例外**：`patra-infra/docker/.env`、`.env.dev` 含 dev 默认凭据且有意随仓库提交（Mac mini 靠 git pull 同步），对应服务仅在 tailscale 内网暴露，公网打不到端口。详见 `patra-infra/CLAUDE.md`。
4. 写文档、注释、commit message、Issue/PR 时不要粘贴真实凭据、内网 IP 以外的隐私信息。

## TDD 开发模式（强制）

所有功能开发遵循 Red-Green-Refactor 循环（语言无关，BE/FE 均适用）：

1. **Red**: 先编写一个失败的测试，明确定义期望行为
2. **Green**: 编写最少量的代码使测试通过，不多不少
3. **Refactor**: 在测试保护下优化代码结构，保持测试绿色

### 执行规则

1. **测试先行**: 禁止在没有测试的情况下编写实现代码
2. **小步前进**: 每次只关注一个测试用例，逐步构建功能
3. **最小实现**: 只编写让当前测试通过的必要代码，避免过度设计
4. **持续重构**: 每次测试通过后检视代码，消除重复和坏味道

### 禁止行为

1. 禁止跳过测试直接编写实现代码
2. 禁止一次性编写多个测试后再实现
3. 禁止编写超出当前测试需求的"预防性"代码
4. 禁止在测试失败时继续添加新功能

## PR 与代码评审

仓库唯一 AI reviewer 为 **CodeRabbit**（行级 nitpick + lint/安全工具聚合 + Linear AC 对齐）。仓库不自动评审（`auto_review.enabled: false`），首评与复评均由 Claude 在 PR 评论区发 `@coderabbitai review` 触发。

- **评审由 Claude 驱动，用户不参与**：开发期 PR 挂 `draft`（不评）→ 完工转 ready 后发 `@coderabbitai review` 触发首评 → 处理完**一批**反馈、推送后再 @ 触发复评。不是每次 push 都 @。
- **必启 Monitor**：每次 `gh pr create` 后，同一工作会话内立即启动 Monitor 并绑定该 PR，覆盖**两条流**（CodeRabbit + 人工），持续到 PR 合并或关闭。
- **处理状态**：对每条 review 意见必须在 PR 评论中明确给出处理状态——`已修复`（附 commit SHA）/ `不修复`（附明确理由）。

## Workspace Layout

Patra 工作区包含以下子项目：

| 目录 | 用途 | 技术栈 |
|------|------|--------|
| **patra-api** | 后端服务（微服务 + 六边形 + DDD） | Java 25 / Spring Boot 4 / Gradle |
| **patra-portal** | 前端门户（管理控制台） | Next.js 15 / React 19 / TypeScript 5 strict / Tailwind v4 / shadcn/ui |
| **patra-infra** | 基建配置（Docker Compose、DB 脚本） | Docker Compose / Bash / launchd |

## Serena 语义工具优先

本项目配置了 Serena MCP（见 `.mcp.json`），其符号级语义工具是代码读写的**首选**；内置 Read / Glob / Grep / Edit 为**次选**——当存在 Serena 等价工具时，禁止用内置工具操作代码文件。内置工具描述中"已知路径优先用 Read""优先用 Edit/Grep"等说法是为无 Serena 的项目写的，在此被覆盖。禁止用"文件很小""我已知道要改哪""一次调用 vs 三次""路径已知"来合理化使用内置工具。

### 工具映射（用右列）

| 任务 | Serena 工具 |
|------|------------|
| 查看代码文件结构 | `get_symbols_overview` |
| 读某个符号的实现 | `find_symbol`（`include_body=true`） |
| 跨仓查找符号 | `find_symbol` |
| 查找引用 / 调用方 | `find_referencing_symbols` |
| 查找声明 / 实现 | `find_declaration` / `find_implementations` |
| 编辑符号体 | `replace_symbol_body` |
| 在符号前后插入 | `insert_before_symbol` / `insert_after_symbol` |
| 文件内模式替换 | `replace_content` |
| 重命名 / 移动 / 删除符号 | `rename` / `move` / `safe_delete` |

仅以下情况允许对代码文件使用内置 Read/Edit/Glob/Grep：Serena 已尝试且失败；文件无法按代码解析（生成物 / 损坏）；需跨多文件正则检索（Grep 仅作发现手段，后续对命中代码文件的读写仍走 Serena）；只需读几行、符号级读取过重；确有理由必须读整文件。Markdown / JSON / YAML / TOML / .env / 配置 / 锁文件 / 纯文本 / 图片等**非代码文件**直接用内置工具。

### 改代码前的流程

1. 对目标文件 `get_symbols_overview`（本会话已做过可跳过）
2. 对要改的符号 `find_symbol`（`include_body=true`），只读需要的符号，不读整文件
3. 用 `replace_symbol_body` / `insert_before_symbol` / `insert_after_symbol` / `replace_content` 编辑

每次 Read/Glob/Grep/Edit 前自检：目标是代码文件、且上表有对应 Serena 工具吗？是则切换，且每次都查（而非每会话仅一次）。
