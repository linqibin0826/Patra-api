import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { PaperCard } from "@/components/portal/PaperCard";
import type { Paper } from "@/types/portal";

function makePaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "p1",
    title: "Semaglutide 长期心血管转归",
    journal: "N Engl J Med",
    year: 2026,
    authors: ["Perkovic V.", "Tuttle K. R.", "Mann J. F. E."],
    cites: 142,
    bookmarks: 0,
    doi: "10.1056/NEJMoa2603120",
    pmid: "39812044",
    source: "PubMed",
    aiSummary: "心血管事件下降 22%",
    estimatedReadMin: 12,
    kind: "Journal Article",
    minutesAgo: 120,
    ...overrides,
  };
}

describe("PaperCard", () => {
  it("渲染 title / journal / source", () => {
    render(<PaperCard paper={makePaper()} />);
    expect(screen.getByText("Semaglutide 长期心血管转归")).toBeInTheDocument();
    expect(screen.getByText(/N Engl J Med/)).toBeInTheDocument();
    expect(screen.getByText("PubMed")).toBeInTheDocument();
  });

  it("作者展示 visible + remaining 数（基于 authors.length）", () => {
    render(<PaperCard paper={makePaper()} />);
    expect(screen.getByText(/等\s*1\s*位作者/)).toBeInTheDocument();
  });

  it("aiSummary 为 null 时不渲染 AI 速读", () => {
    render(<PaperCard paper={makePaper({ aiSummary: null })} />);
    expect(screen.queryByText("AI 速读")).not.toBeInTheDocument();
  });

  it("kind 为 null 时不渲染类型标签", () => {
    render(<PaperCard paper={makePaper({ kind: null })} />);
    expect(screen.queryByText("Journal Article")).not.toBeInTheDocument();
  });

  it("未知 source 仍渲染 source 文本（兜底色）", () => {
    render(<PaperCard paper={makePaper({ source: "OADOI" })} />);
    expect(screen.getByText("OADOI")).toBeInTheDocument();
  });
});
