# IDEA MCP 工具使用规范

Patra 已接入 JetBrains IDEA 内置 MCP（`idea` server，端口 64342）。开发 patra 时优先用 idea MCP 操作 IDE，而非命令行 / 内置文件工具。

**前提**：IDEA 开着 patra 项目且 idea MCP 在线。若工具返回连接错误（IDE 未开 / 项目未加载），本规范不适用——降级到内置 Read/Edit/Bash，并明确告知用户「IDE 未连接」。

所有 idea 工具尽量传 `projectPath=/Users/linqibin/Projects/Products/patra`，减少歧义调用。

## 强制规则

### 1. 运行 Spring Boot 应用：必须走 IDE，禁止命令行

运行任一 Spring Boot 服务，**必须**用 `execute_run_configuration`，**禁止**用 Bash 跑 `gradlew bootRun` / `java -jar`。
原因：IDE run configuration 的日志输出到 IDEA Run 面板，用户能实时查看；命令行跑在 Claude 的 Bash 子进程里，用户看不到日志。

- 用 `configurationName` 指定服务，`waitForExit=false`（Spring Boot 是长驻进程，启动后立即返回，进程在后台持续运行）。
- 现有 run configuration：`PatraRegistryApplication`、`PatraIngestApplication`、`PatraCatalogApplication`、`PatraGatewayApplication`、`PatraObjectStorageApplication`。
- 需临时改启动参数 / 环境变量：用 `programArguments` / `envs` 做一次性 override（不持久化）。
- 看日志 / 排查：`execute_run_configuration` 返回的 `fullOutputPath` 是持续增长的日志文件——`tail` 看末尾、`grep -A20 Exception` 抓异常栈、按级别计数皆可。Run 面板给用户肉眼看，日志文件给 Claude 程序化排查；路径每次启动带随机 hash，启动时记下。

### 2. 查看 / 编辑代码：用 idea MCP，不用内置 Read/Edit

- **读**：`read_file`（支持行范围 / 缩进模式 / 读 jar 内 class）或 `get_file_text_by_path`（整文件）。
- **改**：`replace_text_in_file`（`oldText` → `newText`，自动保存）。注意 `replaceAll` 默认 `true`——只改某一处时让 `oldText` 足够独特，或显式设 `replaceAll=false`。
- **新建**：`create_new_file`。**重命名**：`rename_refactoring`（IDE 安全重命名，跨文件引用一并更新）。
- 编辑后用 `get_file_problems` 查该文件的编译 / 检查问题，替代盲目重新编译。

## 工具速查（按场景）

| 场景 | 工具 |
|------|------|
| 运行 / 构建 | `execute_run_configuration`、`get_run_configurations`、`build_project` |
| 跑单个测试 / main | `execute_run_configuration` 传 `filePath`+`line`（先 `get_run_configurations(filePath=…)` 找 run point） |
| 断点调试 | `xdebug_set_breakpoint` → `xdebug_start_debugger_session` → `xdebug_get_stack` / `xdebug_get_frame_values` / `xdebug_evaluate_expression` |
| 读写文件 | `read_file`、`get_file_text_by_path`、`replace_text_in_file`、`create_new_file`、`reformat_file` |
| 符号 / 搜索 | `search_symbol`、`get_symbol_info`、`search_in_files_by_text`、`search_in_files_by_regex`、`find_files_by_glob`、`find_files_by_name_keyword` |
| 项目结构 | `get_project_modules`、`get_project_dependencies`、`list_directory_tree`、`get_all_open_file_paths` |
| 诊断 | `get_file_problems` |
