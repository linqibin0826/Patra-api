import type { AbstractSection, Author, EvidenceLevel, PaperDetail } from "@/types/portal";

export type EvidenceTone = "moss" | "amber" | "slate" | "muted";

export interface EvidenceView {
  tone: EvidenceTone;
  lit: number;
  label: string;
  en: string;
  derived: boolean;
}

export type AbstractView =
  | { kind: "structured"; sections: AbstractSection[] }
  | { kind: "plain"; text: string }
  | { kind: "empty" };

export interface BylineView {
  shown: Author[];
  extra: number;
}

const EN_LABEL: Record<string, string> = {
  SYSTEMATIC_REVIEW: "Systematic review",
  RANDOMIZED_CONTROLLED_TRIAL: "RCT",
  COHORT_OR_CASE_CONTROL: "Cohort / Case-control",
  NON_SYSTEMATIC_REVIEW: "Review / Clinical study",
  CASE_REPORT: "Case report",
  UNKNOWN: "Undetermined",
};

function toneOf(rank: number): EvidenceTone {
  if (rank >= 4) return "moss";
  if (rank >= 2) return "amber";
  if (rank >= 1) return "slate";
  return "muted";
}

/** 证据等级 → 徽章视图：色温 + 阶梯点亮数（= rank，0–5）+ 英文标签。 */
export function deriveEvidence(ev: EvidenceLevel): EvidenceView {
  const lit = ev.rank >= 0 && ev.rank <= 5 ? ev.rank : 0;
  return {
    tone: toneOf(ev.rank),
    lit,
    label: ev.label,
    en: EN_LABEL[ev.level] ?? "Undetermined",
    derived: ev.derived,
  };
}

/** 摘要三态：结构化段落 / 纯文本 / 空。 */
export function deriveAbstract(p: PaperDetail): AbstractView {
  if (p.abstractSections.length > 0) {
    return { kind: "structured", sections: p.abstractSections };
  }
  if (p.abstractPlainText) {
    return { kind: "plain", text: p.abstractPlainText };
  }
  return { kind: "empty" };
}

/** 全文链接降级链：fullTextUrl → doi.org → PubMed → null。 */
export function deriveFullTextHref(p: PaperDetail): string | null {
  if (p.fullTextUrl) return p.fullTextUrl;
  if (p.doi) return `https://doi.org/${p.doi}`;
  if (p.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}`;
  return null;
}

/** byline：前 3 位作者 + 溢出数。 */
export function deriveByline(authors: Author[]): BylineView {
  const shown = authors.slice(0, 3);
  return { shown, extra: Math.max(0, authors.length - shown.length) };
}
