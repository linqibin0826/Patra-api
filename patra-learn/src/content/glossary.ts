// patra-learn/src/content/glossary.ts
import type { GlossaryEntry } from "./types";

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "GitHub Actions",
    analogy: "≈ 免费的自动化工厂",
    explain: "仓库一有动静就按剧本自动开工的系统，整套 CI/CD 都跑在它上面。",
    appearsAt: "all",
  },
  {
    term: "workflow",
    analogy: "≈ 触发器 + 构建脚本",
    explain: "仓库里的剧本文件：什么事件、哪台机器、跑什么命令。",
    appearsAt: "all",
  },
  {
    term: "runner",
    analogy: "≈ 替你敲 gradlew 的机器",
    explain: "真正执行剧本的电脑：GitHub 租的一次性云机器，或你家常驻的 Mac mini。",
    appearsAt: ["l2/runner-picks-up"],
  },
  {
    term: "Docker 镜像",
    analogy: "≈ fat jar + JRE + 迷你系统",
    explain: "连运行环境一起打包的「整机快照」，任何装了 Docker 的机器都能原样跑。",
    appearsAt: ["l2/native-build"],
  },
  {
    term: "GHCR",
    analogy: "≈ 镜像界的 Maven Central",
    explain: "存镜像的仓库，版本号用 commit sha。在新架构里只当备份网盘。",
    appearsAt: ["l2/native-build"],
  },
  {
    term: "docker compose",
    analogy: "≈ 整套服务的 application.yml",
    explain: "一份 yml 声明每个服务的镜像、端口、健康标准；一条 up 全拉起。",
    appearsAt: ["l2/deploy-loop"],
  },
  {
    term: "secrets",
    analogy: "≈ 密码保险柜",
    explain: "公开仓库里密码进保险柜不进代码；运行时临时注入，日志自动打码。",
    appearsAt: ["l3/roll-call-and-key"],
  },
  {
    term: "分支保护",
    analogy: "≈ main 的门禁闸机",
    explain: "必须走 PR、检查全绿、对话处理完，否则合并按钮是灰的。",
    appearsAt: ["l1/open-pr"],
  },
  {
    term: "squash merge",
    analogy: "≈ 草稿装订成一页交卷",
    explain: "PR 里的零碎提交合并时压成 main 上干净的一条，回滚按提交号点名。",
    appearsAt: ["l1/open-pr"],
  },
  {
    term: "workflow_dispatch",
    analogy: "≈ 手动拉闸的按钮",
    explain: "剧本上留的手动按钮，可填参数。回滚就是点它：服务名 + 旧版本号。",
    appearsAt: ["l2/ship-and-rollback"],
  },
];
