// patra-learn/src/content/incidents.ts
import type { Incident } from "./types";

export const INCIDENTS: Incident[] = [
  {
    no: 1,
    tag: "芯片格式装错",
    title: "坏了三个月，没有一个人知道",
    story:
      "云端 Intel 机器打的镜像忘了做格式转换，mini 根本装不上。没人盯、没验证，一错就是三个月。",
    lesson: "本机原生打包 + 部署前格式断言 + 守夜线",
    relatedStation: "l2/native-build",
  },
  {
    no: 2,
    tag: "演员失踪",
    title: "runner 离线两个月，被 GitHub 除名",
    story:
      "项目搁置期 runner 掉线无人察觉；GitHub 规定离线太久自动注销，回来时「演员」连编制都没了。",
    lesson: "每日查岗 + 安装脚本即运维手册",
    relatedStation: "l3/roll-call-and-key",
  },
  {
    no: 3,
    tag: "20 分钟魔咒",
    title: "超时了，但显示的是「已取消」",
    story:
      "翻墙拉几百 MB 镜像遇上抖动，20 分钟限时一到任务被杀——GitHub 却把超时显示成 cancelled，排查时一度以为是误触。",
    lesson: "不再从外网拉镜像，问题连根拔掉",
    relatedStation: "l2/native-build",
  },
  {
    no: 4,
    tag: "localhost 的背叛",
    title: "服务明明健康，检查说它病了",
    story:
      "健康检查写 localhost 被解析成 IPv6 的 ::1，而服务只听 IPv4——健康的服务被判「不健康」，折腾半天。",
    lesson: "宿主机健康检查一律写死 127.0.0.1",
    relatedStation: "l2/health-check",
  },
  {
    no: 5,
    tag: "全角逗号刺客",
    title: "一个中文标点炸了整个脚本",
    story:
      "macOS 自带的 bash 3.2 不认多字节边界：变量紧跟全角逗号，逗号的字节被并进变量名，直接报「变量不存在」。前后踩了两次。",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: 文案字面量 ${VAR} 是给读者看的写法示例
    lesson: "中文文案里变量一律 ${VAR} 加大括号",
    relatedStation: "l3/four-checks",
  },
  {
    no: 6,
    tag: "打错字的假成功",
    title: "服务名拼错，流水线却报「部署成功」",
    story:
      "手动回滚时服务名打错，脚本静默跳过「不认识的服务」然后报成功——什么都没部署，却一片绿灯。AI 评审员抓出来的。",
    lesson: "入参校验，名字不认识直接拒绝执行",
    relatedStation: "l2/ship-and-rollback",
  },
];
