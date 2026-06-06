import { describe, expect, it } from "vitest";
import {
  deriveAbstract,
  deriveByline,
  deriveEvidence,
  deriveFullTextHref,
} from "@/lib/portal-api/publication-derive";
import type { Author, EvidenceLevel, PaperDetail } from "@/types/portal";

function ev(level: string, rank: number, derived: boolean): EvidenceLevel {
  return { level, rank, label: "L", derived };
}
function paper(overrides: Partial<PaperDetail> = {}): PaperDetail {
  return {
    id: "1",
    title: "T",
    originalTitle: null,
    venueId: null,
    venueName: null,
    publicationYear: null,
    evidenceLevel: ev("UNKNOWN", 0, false),
    abstractType: null,
    abstractSections: [],
    abstractPlainText: null,
    doi: null,
    pmid: null,
    pmcid: null,
    pii: null,
    primaryType: null,
    publicationTypes: [],
    citationCount: null,
    numberOfReferences: null,
    conflictOfInterest: null,
    isOa: null,
    oaStatus: null,
    authors: [],
    meshHeadings: [],
    keywords: [],
    funding: [],
    dates: [],
    aiSummary: null,
    source: null,
    fullTextUrl: null,
    bookmarks: null,
    estimatedReadMin: null,
    ...overrides,
  };
}

describe("deriveEvidence", () => {
  it("rank 决定色温与阶梯：5→moss/5，3→amber/3，1→slate/1，0→muted/0", () => {
    expect(deriveEvidence(ev("SYSTEMATIC_REVIEW", 5, true))).toMatchObject({
      tone: "moss",
      lit: 5,
    });
    expect(deriveEvidence(ev("COHORT_OR_CASE_CONTROL", 3, true))).toMatchObject({
      tone: "amber",
      lit: 3,
    });
    expect(deriveEvidence(ev("CASE_REPORT", 1, true))).toMatchObject({ tone: "slate", lit: 1 });
    expect(deriveEvidence(ev("UNKNOWN", 0, false))).toMatchObject({ tone: "muted", lit: 0 });
  });
  it("en 标签按 level 映射，derived 透传", () => {
    const v = deriveEvidence(ev("RANDOMIZED_CONTROLLED_TRIAL", 4, true));
    expect(v.en).toBe("RCT");
    expect(v.derived).toBe(true);
  });
  it("rank 越界（>5）clamp 后 tone 与 lit 一致", () => {
    const v = deriveEvidence(ev("SYSTEMATIC_REVIEW", 6, true));
    expect(v.lit).toBe(5);
    expect(v.tone).toBe("moss");
  });
});

describe("deriveAbstract", () => {
  it("有 sections → structured", () => {
    const v = deriveAbstract(paper({ abstractSections: [{ label: "BACKGROUND", text: "x" }] }));
    expect(v.kind).toBe("structured");
  });
  it("仅 plainText → plain", () => {
    expect(deriveAbstract(paper({ abstractPlainText: "x" })).kind).toBe("plain");
  });
  it("都无 → empty", () => {
    expect(deriveAbstract(paper()).kind).toBe("empty");
  });
});

describe("deriveFullTextHref", () => {
  it("fullTextUrl 优先", () => {
    expect(deriveFullTextHref(paper({ fullTextUrl: "https://x", doi: "10.1/y", pmid: "9" }))).toBe(
      "https://x",
    );
  });
  it("无 fullTextUrl 降级到 doi.org", () => {
    expect(deriveFullTextHref(paper({ doi: "10.1/y", pmid: "9" }))).toBe("https://doi.org/10.1/y");
  });
  it("仅 pmid 降级到 PubMed", () => {
    expect(deriveFullTextHref(paper({ pmid: "9" }))).toBe("https://pubmed.ncbi.nlm.nih.gov/9");
  });
  it("都无 → null", () => {
    expect(deriveFullTextHref(paper())).toBeNull();
  });
});

describe("deriveByline", () => {
  it("前 3 位 + extra", () => {
    const authors: Author[] = [1, 2, 3, 4, 5].map((n) => ({
      order: n,
      first: n === 1,
      corresponding: false,
      name: `A${n}`,
      affiliation: null,
    }));
    const { shown, extra } = deriveByline(authors);
    expect(shown).toHaveLength(3);
    expect(extra).toBe(2);
  });
  it("≤3 位作者时 extra 为 0", () => {
    const authors: Author[] = [1, 2].map((n) => ({
      order: n,
      first: n === 1,
      corresponding: false,
      name: `A${n}`,
      affiliation: null,
    }));
    expect(deriveByline(authors).extra).toBe(0);
    expect(deriveByline([]).extra).toBe(0);
  });
});
