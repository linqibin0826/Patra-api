import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { AbstractBlock } from "@/components/portal/paper-detail/AbstractBlock";
import type { PaperDetail } from "@/types/portal";

const base = { abstractSections: [], abstractPlainText: null } as unknown as PaperDetail;

describe("AbstractBlock", () => {
  it("结构化：渲染段落标签与正文", () => {
    render(
      <AbstractBlock
        paper={{ ...base, abstractSections: [{ label: "BACKGROUND", text: "bg text" }] }}
      />,
    );
    expect(screen.getByText("BACKGROUND")).toBeInTheDocument();
    expect(screen.getByText("bg text")).toBeInTheDocument();
  });
  it("纯文本：渲染整段", () => {
    render(<AbstractBlock paper={{ ...base, abstractPlainText: "plain abs" }} />);
    expect(screen.getByText("plain abs")).toBeInTheDocument();
  });
  it("空：渲染占位文案", () => {
    render(<AbstractBlock paper={base} />);
    expect(screen.getByText(/暂无摘要/)).toBeInTheDocument();
  });
});
