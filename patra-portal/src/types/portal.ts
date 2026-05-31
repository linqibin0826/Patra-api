/**
 * Patra portal 领域类型 — 与 handoff `data.jsx` 实际字段对齐
 */

export type ComposerMode = "keyword" | "pmid" | "doi" | "author";
// trending 后端暂无热度信号，本版只暴露 recent / cited（见 spec §范围边界）
export type FeedTab = "recent" | "cited";
// 后端 source 来自 18 种 provenance 展示名或回退 code，故为开放 string（不可用三值 union）
export type PaperSource = string;
export type TopicHeatTier = 1 | 2 | 3 | 4 | 5;

export interface SearchMode {
  id: ComposerMode;
  label: string;
  placeholder: string;
  mono: boolean;
}

export interface ExampleQuery {
  mode: ComposerMode;
  text: string;
}

export interface PortalStats {
  records: number;
  sources: number;
  lastIngestMin: number;
  todayAdded: number;
  todayDelta: number;
}

export interface Topic {
  term: string;
  heat: number;
  count: number;
  delta?: string;
}

export interface JournalCoverStyle {
  bg: string;
  ink: string;
  rule: string;
}

export interface Journal {
  id: string;
  name: string;
  abbr: string;
  cover: string;
  coverStyle: JournalCoverStyle;
  impact: number;
  weekly: number;
  founded: number;
}

export interface Paper {
  id: string;
  title: string;
  journal: string | null;
  year: number | null;
  authors: string[];
  cites: number | null;
  bookmarks: number;
  doi: string | null;
  pmid: string | null;
  source: PaperSource;
  aiSummary: string | null;
  estimatedReadMin: number | null;
  kind: string | null;
  minutesAgo: number | null; // 后端提供，UI 暂未展示（留作"X 分钟前"标签）
}

/**
 * 后端 `dev.linqibin.commons.query.PageResult` 的序列化形态。
 * 字段：page / pageSize / total / totalPages / items（非 content/totalElements）。
 */
export interface PageResult<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
}
