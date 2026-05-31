import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { AISummaryBadge } from "@/components/portal/AISummaryBadge";

describe("AISummaryBadge", () => {
  it("渲染 'AI 速读' 标签", () => {
    render(<AISummaryBadge aiSummary="测试摘要" />);
    expect(screen.getByText("AI 速读")).toBeInTheDocument();
  });

  it("渲染传入的 aiSummary 文字", () => {
    render(<AISummaryBadge aiSummary="心血管事件下降 22%" />);
    expect(screen.getByText(/心血管事件下降/)).toBeInTheDocument();
  });

  it("estimatedReadMin 非空时显示分钟数", () => {
    render(<AISummaryBadge aiSummary="x" estimatedReadMin={12} />);
    expect(screen.getByText(/≈ 12 分钟原文/)).toBeInTheDocument();
  });
});
