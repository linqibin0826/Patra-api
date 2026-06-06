import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { JournalActiveChips } from "@/components/portal/journals/JournalActiveChips";
import type { VenueBrowseQuery } from "@/types/portal";

const mockPush = vi.fn<(url: string) => void>();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseQuery: VenueBrowseQuery = {
  q: "",
  sort: "if",
  page: 1,
  subject: [],
  jcr: [],
  cas: [],
  casTop: false,
  oa: false,
  doaj: false,
  country: [],
};

describe("JournalActiveChips", () => {
  it("空 query 不渲染任何 chip", () => {
    const { container } = render(<JournalActiveChips query={baseQuery} />);
    expect(container.firstChild).toBeNull();
  });

  it("渲染 jcr chip 并显示组名和值", () => {
    render(<JournalActiveChips query={{ ...baseQuery, jcr: ["Q1"] }} />);
    expect(screen.getByText("JCR 分区")).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
  });

  it("渲染布尔 chip（oa）", () => {
    render(<JournalActiveChips query={{ ...baseQuery, oa: true }} />);
    // chip 容器包含组名和 label，均为"开放获取"，验证至少有一个
    expect(screen.getAllByText("开放获取").length).toBeGreaterThanOrEqual(1);
  });

  it("多个 chip 全部渲染", () => {
    render(<JournalActiveChips query={{ ...baseQuery, jcr: ["Q1", "Q2"], casTop: true }} />);
    expect(screen.getAllByRole("button")).toHaveLength(
      3 + 1, // 3 chips ✕ + 1 清除全部
    );
  });

  it("点击 ✕ 触发 router.push 并 URL 移除该 chip", () => {
    mockPush.mockClear();
    render(<JournalActiveChips query={{ ...baseQuery, jcr: ["Q1", "Q2"] }} />);
    // 找到 Q1 chip 的移除按钮（紧随其后的 ✕ 按钮）
    const removeButtons = screen.getAllByRole("button", { name: /移除|✕|×/i });
    // biome-ignore lint/style/noNonNullAssertion: getAllByRole 保证至少有一个
    fireEvent.click(removeButtons[0]!);
    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0]![0];
    // Q1 应被移除，Q2 仍在
    expect(url).toContain("Q2");
    expect(url).not.toContain("Q1");
  });

  it("点击「清除全部」导航到 /journals（无 query）", () => {
    mockPush.mockClear();
    render(<JournalActiveChips query={{ ...baseQuery, jcr: ["Q1"], oa: true }} />);
    fireEvent.click(screen.getByRole("button", { name: /清除全部/i }));
    expect(mockPush).toHaveBeenCalledWith("/journals");
  });
});
