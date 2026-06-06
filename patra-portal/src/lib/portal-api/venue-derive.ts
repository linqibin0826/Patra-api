import type { VenueDetail, YearlyStat } from "@/types/portal";

// ---- 派生视图类型（FE 内部，非 wire 契约） ----
export interface JcrView {
  impactFactor: number | null;
  quartile: string | null;
  subject: string | null;
  percentile: number | null;
  rank: string | null;
}
export interface CasView {
  majorCategory: string | null;
  majorQuartile: string | null;
  minorSubject: string | null;
  minorQuartile: string | null;
  isTop: boolean;
  isReview: boolean;
}
export interface ScopusView {
  citeScore: number | null;
  sjr: number | null;
  snip: number | null;
  percentile: number | null;
}
export interface BibliometricView {
  hIndex: number | null;
  i10Index: number | null; // BE 无来源 → 恒 null（渲染 "—"）
  citedByCount: number | null;
  worksCount: number | null;
}
export interface JournalMetrics {
  jcr: JcrView | null;
  cas: CasView | null;
  scopus: ScopusView | null;
  bibliometric: BibliometricView | null;
}
export interface MetricCard {
  key: string;
  label: string;
  value: string;
  sub: string;
  accent: boolean;
}

/** 取列表中 year 最大的一项；空列表 → null。 */
function latest<T extends { year: number }>(list: T[]): T | null {
  if (!list || list.length === 0) {
    return null;
  }
  return list.reduce((a, b) => (b.year > a.year ? b : a));
}

/**
 * 把扁平 VenueDetail 重组为组件视图对象。某套评级完全无信号 → 对应 view 为 null。
 */
export function deriveMetrics(v: VenueDetail): JournalMetrics {
  const jcrLatest = latest(v.jcrRatings);
  const casLatest = latest(v.casRatings);
  const scopusLatest = latest(v.scopusRatings);

  const jcr: JcrView | null =
    v.impactFactor != null || v.jcrQuartile != null || v.jcrSubject != null || jcrLatest != null
      ? {
          impactFactor: v.impactFactor,
          quartile: v.jcrQuartile,
          subject: v.jcrSubject,
          percentile: jcrLatest?.jifPercentile ?? null,
          rank: jcrLatest?.jifRank ?? null,
        }
      : null;

  const cas: CasView | null =
    v.casMajorCategory != null || v.casMajorQuartile != null || casLatest != null
      ? {
          majorCategory: v.casMajorCategory ?? casLatest?.majorCategory ?? null,
          majorQuartile: v.casMajorQuartile ?? casLatest?.majorQuartile ?? null,
          minorSubject: casLatest?.minorSubject ?? null,
          minorQuartile: casLatest?.minorQuartile ?? null,
          isTop: v.casIsTop ?? casLatest?.isTop ?? false,
          isReview: casLatest?.isReview ?? false,
        }
      : null;

  const scopus: ScopusView | null =
    v.citeScore != null || scopusLatest != null
      ? {
          citeScore: v.citeScore ?? scopusLatest?.citeScore ?? null,
          sjr: scopusLatest?.sjr ?? null,
          snip: scopusLatest?.snip ?? null,
          percentile: scopusLatest?.percentile ?? null,
        }
      : null;

  const bibliometric: BibliometricView | null =
    v.hIndex != null || v.citedByCount != null || v.worksCount != null
      ? { hIndex: v.hIndex, i10Index: null, citedByCount: v.citedByCount, worksCount: v.worksCount }
      : null;

  return { jcr, cas, scopus, bibliometric };
}

/** 定位·学科领域标签：jcrSubject + casMajorCategory 去重；皆空 → []。 */
export function deriveSubjectAreas(v: VenueDetail): string[] {
  const out: string[] = [];
  for (const s of [v.jcrSubject, v.casMajorCategory]) {
    const t = s?.trim();
    if (t && !out.includes(t)) {
      out.push(t);
    }
  }
  return out;
}

/** 影响力速览卡（最多 3 张，缺值降级）。 */
export function deriveMetricCards(m: JournalMetrics): MetricCard[] {
  const cards: MetricCard[] = [];
  if (m.jcr?.impactFactor != null) {
    cards.push({
      key: "if",
      label: "JCR 影响因子",
      value: m.jcr.impactFactor.toFixed(1),
      sub: "最新年度",
      accent: true,
    });
  }
  if (m.jcr?.quartile) {
    cards.push({
      key: "q",
      label: "JCR 分区",
      value: m.jcr.quartile,
      sub: m.jcr.rank ? `排名 ${m.jcr.rank}` : (m.jcr.subject ?? ""),
      accent: false,
    });
  }
  if (m.cas?.majorQuartile) {
    cards.push({
      key: "cas",
      label: "中科院分区",
      value: m.cas.majorQuartile,
      sub: `${m.cas.majorCategory ?? "—"}${m.cas.isTop ? " · Top" : ""}`,
      accent: false,
    });
  } else if (m.scopus?.citeScore != null) {
    cards.push({
      key: "cs",
      label: "Scopus CiteScore",
      value: m.scopus.citeScore.toFixed(1),
      sub: m.scopus.percentile != null ? `${m.scopus.percentile}% 百分位` : "",
      accent: false,
    });
  }
  return cards;
}

/** 年度趋势：按 year 升序；空 → []。组件据此渲染双柱图（无则不显）。 */
export function deriveYearlyStats(v: VenueDetail): YearlyStat[] {
  return [...v.yearlyStats].sort((a, b) => a.year - b.year);
}
