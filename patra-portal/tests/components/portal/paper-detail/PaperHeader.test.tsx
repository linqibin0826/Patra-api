import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { PaperHeader } from "@/components/portal/paper-detail/PaperHeader";
import type { PaperDetail } from "@/types/portal";

function paper(overrides: Partial<PaperDetail> = {}): PaperDetail {
  return {
    id: "1",
    title: "Semaglutide RCT",
    originalTitle: null,
    venueId: "42",
    venueName: "N Engl J Med",
    publicationYear: 2024,
    evidenceLevel: {
      level: "RANDOMIZED_CONTROLLED_TRIAL",
      rank: 4,
      label: "随机对照试验",
      derived: true,
    },
    abstractType: null,
    abstractSections: [],
    abstractPlainText: null,
    doi: "10.1/x",
    pmid: "9",
    pmcid: null,
    pii: null,
    primaryType: null,
    publicationTypes: ["Journal Article"],
    citationCount: null,
    numberOfReferences: null,
    conflictOfInterest: null,
    isOa: true,
    oaStatus: null,
    authors: [],
    meshHeadings: [],
    keywords: [],
    funding: [],
    dates: [],
    aiSummary: null,
    source: "PubMed",
    fullTextUrl: "https://full",
    bookmarks: 0,
    estimatedReadMin: null,
    ...overrides,
  };
}

describe("PaperHeader", () => {
  it("渲染标题 + 期刊链接（指向 /journals/[venueId]）+ 去全文链接", () => {
    render(<PaperHeader paper={paper()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Semaglutide RCT");
    expect(screen.getByRole("link", { name: "N Engl J Med" })).toHaveAttribute(
      "href",
      "/journals/42",
    );
    expect(screen.getByRole("link", { name: /去全文/ })).toHaveAttribute("href", "https://full");
  });
  it("无全文链接时按钮禁用", () => {
    render(<PaperHeader paper={paper({ fullTextUrl: null, doi: null, pmid: null })} />);
    expect(screen.getByRole("button", { name: /全文链接不可用/ })).toBeDisabled();
  });
});
