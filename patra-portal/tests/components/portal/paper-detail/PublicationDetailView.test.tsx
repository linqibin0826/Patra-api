import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { PublicationDetailView } from "@/components/portal/paper-detail/PublicationDetailView";
import type { PaperDetail } from "@/types/portal";

function paper(overrides: Partial<PaperDetail> = {}): PaperDetail {
  return {
    id: "319041872872550658",
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
    abstractType: "structured",
    abstractSections: [{ label: "BACKGROUND", text: "bg" }],
    abstractPlainText: null,
    doi: "10.1/x",
    pmid: "9",
    pmcid: null,
    pii: null,
    primaryType: "Journal Article",
    publicationTypes: ["Journal Article"],
    citationCount: 142,
    numberOfReferences: 30,
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

describe("PublicationDetailView", () => {
  it("渲染面包屑（pmid）+ 标题 + 摘要节 + 关键标识", () => {
    render(<PublicationDetailView paper={paper()} />);
    const nav = screen.getByRole("navigation", { name: "面包屑" });
    expect(nav).toHaveTextContent("9");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Semaglutide RCT");
    expect(screen.getByText("摘要")).toBeInTheDocument();
    expect(screen.getByText("关键标识")).toBeInTheDocument();
    expect(screen.getByText("bg")).toBeInTheDocument();
  });
});
