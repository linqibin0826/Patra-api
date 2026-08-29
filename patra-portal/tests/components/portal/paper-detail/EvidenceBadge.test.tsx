import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { EvidenceBadge } from "@/components/portal/paper-detail/EvidenceBadge";

describe("EvidenceBadge", () => {
  it("已分级：渲染中文 + 英文标签 + 衍生标记", () => {
    render(
      <EvidenceBadge
        level={{
          level: "RANDOMIZED_CONTROLLED_TRIAL",
          rank: 4,
          label: "随机对照试验",
          derived: true,
        }}
      />,
    );
    expect(screen.getByText("随机对照试验")).toBeInTheDocument();
    expect(screen.getByText(/RCT/)).toBeInTheDocument();
    expect(screen.getByText("衍生")).toBeInTheDocument();
  });
  it("UNKNOWN：不渲染徽章（未分级无信息量，仅速览行保留）", () => {
    const { container } = render(
      <EvidenceBadge level={{ level: "UNKNOWN", rank: 0, label: "未分级", derived: false }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
