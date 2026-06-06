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

/**
 * 期刊浏览端点 `GET /portal/venues` 单条响应结构（VenueBrowse）。
 * 对应后端 `VenueBrowseDTO`，字段为首页卡片字段的超集。
 */
export interface VenueBrowse {
  id: string;
  name: string;
  abbr: string;
  coverObjectKey: string | null;
  impactFactor: number;
  jcrQuartile: string | null; // Q1–Q4
  jcrSubject: string | null;
  casMajorCategory: string | null;
  casMajorQuartile: string | null;
  casIsTop: boolean | null;
  countryCode: string | null;
  citedByCount: number | null;
  foundedYear: number | null;
  isOpenAccess: boolean | null;
  isInDoaj: boolean | null;
  issnL: string | null;
}

export interface JcrRating {
  year: number;
  impactFactor: number | null;
  quartile: string | null;
  subject: string | null;
  jifRank: string | null; // 形如 "5/245"
  jifPercentile: number | null;
}

export interface CasRating {
  year: number;
  edition: string | null;
  majorCategory: string | null;
  majorQuartile: string | null;
  minorSubject: string | null;
  minorQuartile: string | null;
  isTop: boolean | null;
  isReview: boolean | null;
}

export interface ScopusRating {
  year: number;
  citeScore: number | null;
  sjr: number | null;
  snip: number | null;
  quartile: string | null;
  percentile: number | null;
}

export interface YearlyStat {
  year: number;
  worksCount: number | null;
  citedByCount: number | null;
  oaWorksCount: number | null;
}

export interface VenueIdentifier {
  type: string;
  value: string;
  primary: boolean;
}

/**
 * 期刊详情端点 `GET /portal/venues/{id}` 响应（VenueDetail）。
 * 对应后端 `PortalVenueDetailResponse`——扁平"最新值快照" + 评级列表，零运行时映射。
 * id 为 string（BE 用 String 避免 JS 超 2^53 精度损失）。
 */
export interface VenueDetail {
  id: string;
  title: string;
  abbreviatedTitle: string | null;
  venueType: string | null;
  issnL: string | null;
  countryCode: string | null;
  primaryLanguage: string | null;
  foundedYear: number | null;
  coverObjectKey: string | null;
  homepageUrl: string | null; // BE 恒 null → 主操作降级
  isOpenAccess: boolean | null;
  // 顶层"最新值"快照
  impactFactor: number | null;
  jcrQuartile: string | null;
  jcrSubject: string | null;
  casMajorCategory: string | null;
  casMajorQuartile: string | null;
  casIsTop: boolean | null;
  citeScore: number | null;
  hIndex: number | null;
  citedByCount: number | null;
  worksCount: number | null;
  frequency: string | null;
  medlineIndexed: boolean | null;
  oaType: string | null;
  apcUsd: number | null;
  isInDoaj: boolean | null;
  // 完整评级列表（深数据层明细 + 派生来源）
  jcrRatings: JcrRating[];
  casRatings: CasRating[];
  scopusRatings: ScopusRating[];
  yearlyStats: YearlyStat[];
  identifiers: VenueIdentifier[];
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

/** 证据等级（BE EvidenceLevelView：rank 0–5，越大越强；derived = 非 UNKNOWN） */
export interface EvidenceLevel {
  level: string;
  rank: number;
  label: string;
  derived: boolean;
}

/** 结构化摘要段落；label 为 BACKGROUND / METHODS / RESULTS 等枚举值 */
export interface AbstractSection {
  label: string;
  text: string;
}

/** 作者（order 为 1-based 排序，有意义）；affiliation 为首机构 */
export interface Author {
  order: number;
  first: boolean;
  corresponding: boolean;
  name: string;
  affiliation: string | null;
}

/** MeSH 主题词；major 标记主要主题概念 */
export interface MeshHeading {
  descriptorUi: string;
  term: string;
  major: boolean;
}

/** 资助信息；字段均可能为 null */
export interface Funding {
  funder: string | null;
  grantId: string | null;
  country: string | null;
}

/** 出版日期；type 如 received/accepted/epublished/published，date 为 "yyyy-MM-dd" */
export interface PublicationDate {
  type: string;
  date: string; // LocalDate 序列化为 "yyyy-MM-dd"
}

/**
 * 文献详情端点 `GET /portal/publications/{id}` 响应（PaperDetail）。
 * 对应后端 `PortalPublicationDetailResponse`——扁平 + 列表，零运行时映射。
 * source/fullTextUrl 为真实数据；bookmarks 恒 0、estimatedReadMin 恒 null（占位，无数据源）。
 */
export interface PaperDetail {
  id: string;
  title: string;
  originalTitle: string | null;
  venueId: string | null;
  venueName: string | null;
  publicationYear: number | null;
  evidenceLevel: EvidenceLevel;
  abstractType: string | null;
  abstractSections: AbstractSection[];
  abstractPlainText: string | null;
  doi: string | null;
  pmid: string | null;
  pmcid: string | null;
  pii: string | null;
  primaryType: string | null;
  publicationTypes: string[];
  citationCount: number | null;
  numberOfReferences: number | null;
  conflictOfInterest: string | null;
  isOa: boolean | null;
  oaStatus: string | null;
  authors: Author[];
  meshHeadings: MeshHeading[];
  keywords: string[];
  funding: Funding[];
  dates: PublicationDate[];
  aiSummary: string | null;
  source: string | null;
  fullTextUrl: string | null;
  bookmarks: number | null;
  estimatedReadMin: number | null;
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
