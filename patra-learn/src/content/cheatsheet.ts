// patra-learn/src/content/cheatsheet.ts
import type { OpsCard } from "./types";

export const OPS_CARDS: OpsCard[] = [
  {
    action: "回滚",
    lineId: "l2",
    scenario: "上线后才发现新版有问题。约 2 分钟完成，命中本机缓存不走外网。",
    command: "gh workflow run cd.yml \\\n  -f service=catalog \\\n  -f image_tag=<旧sha>",
    note: "旧 sha 去 main 提交历史里抄；portal / learn 回滚用各自的 portal-cd.yml / learn-cd.yml",
  },
  {
    action: "巡检",
    lineId: "l3",
    scenario: "不想等明早 7 点，现在就想确认 runner 和容器都健康。",
    command: "gh workflow run \\\n  runner-watchdog.yml",
    note: "结果在 GitHub Actions 页看",
  },
  {
    action: "升级",
    lineId: "l1",
    scenario: "守夜线告警「版本过期」，或 runner 彻底失联需要重装。在 mini 上执行。",
    command: "bash patra-infra/scripts/install-github-runner.sh \\\n  <TOKEN>",
    note: "TOKEN 在仓库设置 Runners 页取",
  },
];

/** 红线提示（页面底部两条）。 */
export const RED_LINES = [
  "有任务正在执行时，严禁在 mini 上重启 runner——会当场杀死执行中的部署（显示为 cancelled）。先确认 Actions 页没有进行中的任务。",
  "仓库 secrets 里的 RUNNER_ADMIN_TOKEN 是守夜线的查岗钥匙，不要删；到期前重新生成并更新。",
];
