# CI/CD 生产级优化 spec review

目标文件：`docs/patra/specs/2026-06-08-cicd-production-grade-design.html`

本文是给 Claude Code 修改原 spec 用的 review 备忘。结论是：原 spec 的总体方向正确，但当前“服务级门控”的正确性论证不够严谨，必须补上契约依赖、coverage 语义、远程缓存信任边界和 PR diff 细节，否则实现后可能出现漏测或 false-pass。

## 总体结论

可以保留的方向：

- 将 CI 收敛到一个 `required-check`，让分支保护不用改。
- 将 `portal-ci` 纳入统一 gate，修复前端质量门不阻断合并的问题。
- 关闭 CodeRabbit 增量复评，改成 ready 首评 + 分批手动 `@coderabbitai review`。
- action pin 到 SHA，补最小 `permissions` 和 Dependabot。
- nightly 全量作为选择性门控的兜底。

必须修改的方向：

- 不要再表述为简单的“按服务目录门控”。应升级为“受影响单元门控”：`service`、`contract`、`foundation`、`portal`。
- `contract` 是本次 spec 最关键的补丁。当前仓库里跨服务 API 模块是编译期契约依赖，不能只跑被改目录所属服务。
- coverage、远程 Gradle cache、空 matrix、fork PR、安全凭据都要写出可执行规则。

## 阻断问题

### 1. 高风险：服务级门控会漏掉跨服务 API 消费者

原 spec 多处声称“微服务间互不依赖内部实现，服务级隔离安全”，并设计成命中某服务目录就只跑该服务 job。但当前代码不是纯运行时隔离，存在编译期契约依赖：

- `patra-api/patra-ingest/patra-ingest-infra/build.gradle.kts` 依赖 `:patra-api:patra-registry:patra-registry-api` 和 `:patra-api:patra-object-storage:patra-object-storage-api`。
- `patra-api/patra-ingest/patra-ingest-boot/build.gradle.kts` 依赖 `:patra-api:patra-object-storage:patra-object-storage-api`。
- `patra-api/patra-catalog/patra-catalog-infra/build.gradle.kts` 依赖 `:patra-api:patra-registry:patra-registry-api`。
- `patra-starters/patra-spring-boot-starter-expr/build.gradle.kts` 依赖 `:patra-api:patra-registry:patra-registry-api`。

如果只改 `patra-registry-api`，只跑 registry 会漏掉 catalog、ingest、expr starter 的编译/测试。这个风险不是“未来新增跨服务测试”的问题，而是当前仓库已经存在的编译期契约依赖。

修改建议：

- 将“服务级门控”改成“受影响单元门控”。
- 在 `services.json` 或新的 CI 路由配置里新增 `contracts` 映射。
- 示例规则：
  - `patra-api/patra-registry/patra-registry-api/**` 触发 `registry`、`catalog`、`ingest`，并触发依赖 `registry-api` 的 starter/foundation 检查。
  - `patra-api/patra-object-storage/patra-object-storage-api/**` 触发 `object-storage`、`ingest`。
  - domain/app/infra/adapter/boot 等非公开契约模块仍可按所属服务门控。
- Done 判定新增两例：
  - 只改 `registry-api`，必须跑 registry + catalog + ingest + 相关 starter 检查。
  - 只改 `object-storage-api`，必须跑 object-storage + ingest。

### 2. 高风险：选择性 CI 下 coverage 聚合语义不成立

原 spec 写“coverage 聚合实际跑过的 jacoco”。但当前根 `build.gradle.kts` 使用 `jacoco-report-aggregation`，会把所有 apply `jacoco` 的子项目纳入聚合。选择性只跑 catalog 时，聚合全仓报告可能把未运行模块算成 0 覆盖率，或者生成不完整报告；portal-only / docs-only 时也可能没有 `jacoco-exec-*` artifact。

修改建议：

- 不要把 PR 选择性运行结果伪装成全仓 coverage。
- 二选一：
  - PR 只上传受影响单元 coverage，并用 Codecov flags 区分 `catalog`、`registry`、`ingest` 等。
  - 或者 coverage 只在 foundation/nightly/full-run 时上传全量；普通服务级 PR 只保留测试报告 artifact。
- `portal-only` 和 `docs-only` 必须明确跳过 coverage，`required-check` 接受 skipped。
- Done 判定新增：
  - `docs-only` 无 coverage artifact 时 gate 仍绿。
  - `portal-only` 后端 coverage job skipped，gate 仍能正确判断 portal 结果。

### 3. 高风险：Mac mini 远程 Gradle cache 的信任边界过宽

原 spec 计划“本地 dev 与 CI main/nightly push=true、PR 只读”，并希望 PR 命中本地 TDD 产物。这不是生产级默认值。远程 build cache 一旦被本地不干净环境或非 hermetic task 写入，CI 可能复用错误输出，导致 false-pass。公开仓库还必须考虑 fork PR 拿不到 secret、不能访问 tailnet/cache node。

修改建议：

- 远程 Gradle cache 的写入者只允许 trusted CI：`push:main`、`schedule`、手动 trusted dispatch。
- 本地开发默认不要 push 到 CI 信任的远程 cache。若要本地 push，必须用独立 namespace 或独立 cache node，不能和 CI trusted cache 混用。
- PR 默认只读；fork PR 或 secrets 不存在时完全禁用远程 cache，只保留 GHA/Gradle dependency cache。
- 所有 build-cache 鉴权凭据只能走 GitHub Secrets 或本机外部 secret，不能写入仓库 `.env`。
- `settings.gradle.kts` 里需要 fail-soft，但 fail-soft 只解决可用性，不解决信任问题；spec 要区分这两件事。

### 4. 中高风险：PR diff、空 matrix、skipped job 的 Actions 语义没有写清楚

当前 `patra-infra/cd/detect-changes.sh` 只支持 `push <before> <after>` 和 `dispatch`。原 spec 新增 `pull_request`，但没有定义 PR 的 base/head SHA、`fetch-depth`、merge-base 行为，也没有说明 `units=[]` 时 matrix job 如何处理。

修改建议：

- `detect-changes.sh` 扩展为显式模式：
  - `push <before> <after>`：用于 push main。
  - `pr <base_sha> <head_sha>`：用于 pull_request。
  - `dispatch <service|all>`：保留 CD 手动触发。
  - `schedule`：直接全量。
- checkout 需要 `fetch-depth: 0`，或者明确 fetch base/head 所需历史。
- 输出不要只有一个 `units[]`，建议拆成：
  - `backend_units_json`
  - `portal_changed`
  - `docs_only`
  - `full_run`
  - `coverage_mode`
- `required-check` 必须明确接受 `success` 和 `skipped`，拒绝 `failure` 和 `cancelled`。
- 不要让空 matrix 直接生成非法 workflow。backend job 应用 `if: needs.detect-changes.outputs.backend_units_json != '[]'` 包住。

## 重要问题

### 5. 删除 `portal-ci.yml` 时会丢掉 Playwright e2e 信号

当前 `portal-ci.yml` 有一个非阻塞 Playwright e2e job，`continue-on-error: true`。原 spec 的 portal job 只写 lint/typecheck/test，没有说明 Playwright 是否迁移。

修改建议：

- 在 spec 中明确 portal job 结构：
  - blocking：`pnpm lint`、`pnpm typecheck`、`pnpm test`。
  - non-blocking PR signal：`pnpm test:e2e`，失败上传报告但不阻断。
  - nightly：Playwright e2e 可以改为阻断，作为 UI 回归兜底。
- 如果决定删除 PR e2e，也要写明原因，不要无声丢失。

### 6. 现有容器镜像版本一致性检查可能被遗漏

当前 `ci.yml` 的 integration job 有 `POSTGRES_IMAGE` / `ROCKETMQ_IMAGE` 与 Java 常量、compose 文件一致性的守卫。新编排如果只按服务跑 integration，容易遗漏这类 cheap governance check。

修改建议：

- 把镜像版本一致性检查提成独立 `preflight` job。
- 触发条件：
  - workflow 自身变更；
  - `linqibin-spring-boot-starter-test` 变更；
  - RocketMQ compose 资源变更；
  - foundation/full-run/nightly。
- 也可以让它一直跑，因为耗时很低。

### 7. action pin SHA 后，必须写清 Dependabot 的限制和策略

原 spec 说 Dependabot 自动升 SHA。方向正确，但需要更精确：

- Dependabot 对 `github-actions` 可以更新 action version ref；如果实际使用裸 SHA + 注释，更新体验取决于配置和 action 引用格式。
- 建议 spec 规定格式：`uses: owner/action@<sha> # vX.Y.Z`。
- Dependabot 分组后仍要人工审查 action 权限变化，不能只看 SHA diff。

### 8. CodeRabbit 配置描述要避免依赖不确定默认值

原 spec 说未设 `auto_incremental_review` 默认 true。这个事实最好不要作为唯一论据，因为第三方 SaaS 默认值可能变化。当前仓库里确实显式设置了 `auto_pause_after_reviewed_commits: 0`，注释也写明是为了保证每次 push 增量审查。

修改建议：

- 论据改成“当前配置意图是每次 push 增量审查，因此会消耗配额”，不要把全部风险建立在默认值上。
- 修改 `.coderabbit.yaml` 时同时更新注释，避免保留“保证每次 push 增量审查”的反向说明。

## 建议的 spec 重写结构

建议把第 3、4 节按下面结构重写：

1. `detect-changes` 输出模型
   - `backend_units_json`
   - `portal_changed`
   - `docs_only`
   - `coverage_mode`
   - `full_run_reason`

2. 受影响单元分类
   - `service`：服务私有实现变更。
   - `contract`：跨服务 API 契约变更，触发消费者。
   - `foundation`：全仓共享基础设施，触发全量。
   - `portal`：前端单元。

3. 路由规则
   - 私有服务目录 -> 所属服务。
   - `registry-api` -> registry + consumers。
   - `object-storage-api` -> object-storage + consumers。
   - `patra-common`、`patra-starters`、`linqibin-commons`、`build-logic`、根 Gradle、workflow -> full-run。
   - 未识别路径 -> full-run。
   - docs-only -> 无测试 job，gate 绿。

4. Gate 语义
   - backend/portal/coverage 可以 skipped。
   - `required-check` 只要所有 required dependencies 是 `success` 或 `skipped` 就绿。
   - 任一 `failure` 或 `cancelled` 就红。

5. Coverage 语义
   - PR 选择性 coverage 不等同全仓 coverage。
   - nightly/full-run 生成全仓 coverage。
   - 普通 PR 使用 flags 或跳过 coverage 上传。

6. Cache 安全边界
   - trusted CI 可写远程 cache。
   - PR 只读或禁用远程 cache。
   - fork PR 不访问 tailnet/cache secret。
   - 本地 dev cache 与 CI trusted cache 不混用。

## 建议补充的 Done 判定

- 只改 `patra-portal/**`：backend 和 coverage skipped，portal blocking jobs 跑，`required-check` 能因 portal 失败而红。
- 只改 docs：backend、portal、coverage 全 skipped，`required-check` 绿。
- 只改 `patra-api/patra-catalog/**` 私有实现：只跑 catalog 相关后端单元。
- 只改 `patra-api/patra-registry/patra-registry-api/**`：跑 registry + catalog + ingest + 依赖该契约的 starter/foundation 检查。
- 只改 `patra-api/patra-object-storage/patra-object-storage-api/**`：跑 object-storage + ingest。
- 改 `build-logic/**` 或 `.github/workflows/**`：全量后端 + portal。
- `units=[]` 时 workflow 不生成非法 matrix。
- fork PR 不尝试访问 Mac mini cache node，也不会因缺少 cache secret 失败。
- nightly 全量生成全仓 coverage。
- 手动 `@coderabbitai review` 生效，普通 push 不触发增量复评。

## 可以保留但要降调的表述

原 spec 里“调查证实 Patra 测试零跨服务，可安全按服务门控”建议改为：

> 当前 integration/e2e 测试本身没有启动多服务拓扑，因此运行时测试可以按受影响单元选择性执行；但编译期 API 契约存在跨服务消费者，路由必须把契约变更扩散到消费者服务。

这样既保留了原调查价值，也避免把“没有跨服务运行时测试”误推导成“服务目录可以完全隔离”。

## 最小修改清单

Claude Code 修改原 spec 时，至少需要改这些位置：

- 关键决策摘要：把“按受影响服务精确门控”改成“按受影响单元精确门控，并对契约模块做消费者扇出”。
- 范围边界：新增 `contract` 单元和远程 cache 信任边界。
- CI 编排重构：补输出模型、PR diff 模式、空 matrix/skipped job 语义。
- 测试门控矩阵：把“服务级”改成“受影响单元级”，补 contract 行。
- 缓存策略：改写 Mac mini build-cache-node 的 push/read 策略。
- 风险与缓解：把“当前漏测风险”提升到 high，并写当前已存在的 API 契约依赖。
- 改造文件清单：`services.json` 的说明改成“补 CI 单元、契约消费者、任务映射”，不要只写 foundation。
- Done 判定：补契约变更、coverage skipped、fork PR/cache secret、empty matrix。
