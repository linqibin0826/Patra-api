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
  it("混合：无 label 段渲染正文且不渲染空标签槽", () => {
    const { container } = render(
      <AbstractBlock
        paper={{
          ...base,
          abstractSections: [
            { label: "BACKGROUND", text: "bg text" },
            { label: null, text: "unlabeled tail" },
          ],
        }}
      />,
    );
    expect(screen.getByText("BACKGROUND")).toBeInTheDocument();
    expect(screen.getByText("unlabeled tail")).toBeInTheDocument();
    // 无 label 段不应产生标签列节点（grid 两列结构只出现一次）
    expect(container.querySelectorAll(".grid").length).toBe(1);
  });
  it("结构化段落正文按白名单渲染内联标签（回归：防止改回纯文本插值）", () => {
    const { container } = render(
      <AbstractBlock
        paper={{
          ...base,
          abstractSections: [{ label: "RESULTS", text: "CO<sub>2</sub> fixation" }],
        }}
      />,
    );
    const sub = container.querySelector("sub");
    expect(sub).not.toBeNull();
    expect(sub?.textContent).toBe("2");
  });
});
