// patra-learn/src/content/types.ts
export type LineId = "l1" | "l2" | "l3" | "l4" | "l5";

/** 站点引用：`<lineId>/<stationId>`，如 "l2/native-build"。互链（词条/档案→站）都用它。 */
export type StationRef = `${LineId}/${string}`;

export interface Station {
  id: string;
  name: string;
  /** 一句话站点简介（首页 hover、课程页副标题、继续通勤卡都用它） */
  summary: string;
}

export interface Line {
  id: LineId;
  name: string; // "1 号线 · 质检线"
  theme: string; // "合并前的门禁考试（CI）"
  color: string; // 线路主色
  softColor: string; // +12% 明度变体（浅底/hover）
  status: "open" | "planned";
  stations: Station[];
}

export interface GlossaryEntry {
  term: string;
  analogy: string; // "≈ …" Java 类比
  explain: string;
  appearsAt: StationRef[] | "all"; // 出现于（"all" = 全部线路）
}

export interface Incident {
  no: number;
  tag: string; // "芯片格式装错"
  title: string;
  story: string;
  lesson: string; // "→ 于是有了：…"
  relatedStation: StationRef;
}

export interface OpsCard {
  action: string; // "回滚" / "巡检" / "升级"
  scenario: string; // 什么时候用
  command: string; // 多行命令原文（\n 分行）
  note: string; // 命令下方备注
  lineId: LineId; // 徽章取该线颜色
}
