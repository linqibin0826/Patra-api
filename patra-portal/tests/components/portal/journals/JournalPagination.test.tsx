import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { JournalPagination, pageWindow } from "@/components/portal/journals/JournalPagination";
import type { VenueBrowseQuery } from "@/types/portal";

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

// ---- pageWindow 辅助函数测试 ----

describe("pageWindow", () => {
  it("total ≤ 7：全列所有页码", () => {
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("total > 7，cur 在中间：出现双省略号", () => {
    const result = pageWindow(10, 20);
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    expect(result).toContain("…");
    // 两个省略号（首尾各一）
    expect(result.filter((v) => v === "…").length).toBe(2);
    // 当前页 10 在结果中
    expect(result).toContain(10);
  });

  it("total > 7，cur=1：左侧无省略号，右侧有省略号", () => {
    const result = pageWindow(1, 20);
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    // 只有一个省略号（右侧）
    expect(result.filter((v) => v === "…").length).toBe(1);
  });

  it("total > 7，cur=末页：右侧无省略号，左侧有省略号", () => {
    const result = pageWindow(20, 20);
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    // 只有一个省略号（左侧）
    expect(result.filter((v) => v === "…").length).toBe(1);
  });
});

// ---- JournalPagination 组件测试 ----

describe("JournalPagination", () => {
  it("pageCount ≤ 1 时返回 null（不渲染任何内容）", () => {
    const { container } = render(<JournalPagination query={baseQuery} total={8} pageSize={12} />);
    expect(container.firstChild).toBeNull();
  });

  it("pageCount > 1 时渲染 nav[aria-label='分页']", () => {
    render(<JournalPagination query={baseQuery} total={50} pageSize={12} />);
    expect(screen.getByRole("navigation", { name: "分页" })).toBeInTheDocument();
  });

  it("page=1 时上一页链接/按钮禁用", () => {
    render(<JournalPagination query={{ ...baseQuery, page: 1 }} total={50} pageSize={12} />);
    const prev = screen.getByRole("link", { name: /上一页/ });
    expect(prev).toHaveAttribute("aria-disabled", "true");
  });

  it("page=末页 时下一页链接/按钮禁用", () => {
    // total=50, pageSize=12 → pageCount=5
    render(<JournalPagination query={{ ...baseQuery, page: 5 }} total={50} pageSize={12} />);
    const next = screen.getByRole("link", { name: /下一页/ });
    expect(next).toHaveAttribute("aria-disabled", "true");
  });

  it("当前页 Link 有 aria-current='page'", () => {
    render(<JournalPagination query={{ ...baseQuery, page: 2 }} total={50} pageSize={12} />);
    const currentLink = screen.getByRole("link", { name: "2" });
    expect(currentLink).toHaveAttribute("aria-current", "page");
  });

  it("第 2 页的 Link href 包含 page=2", () => {
    render(<JournalPagination query={{ ...baseQuery, page: 1 }} total={50} pageSize={12} />);
    const link2 = screen.getByRole("link", { name: "2" });
    expect(link2).toHaveAttribute("href", "/journals?page=2");
  });

  it("带 q 参数时 Link href 含 q", () => {
    render(
      <JournalPagination query={{ ...baseQuery, q: "nature", page: 1 }} total={50} pageSize={12} />,
    );
    const link2 = screen.getByRole("link", { name: "2" });
    expect(link2).toHaveAttribute("href", expect.stringContaining("q=nature"));
    expect(link2).toHaveAttribute("href", expect.stringContaining("page=2"));
  });

  it("渲染条目范围信息", () => {
    render(<JournalPagination query={{ ...baseQuery, page: 1 }} total={50} pageSize={12} />);
    // 应显示 1–12 · 共 50 本
    expect(screen.getByText(/1–12/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it("page=1 且页数 > 7（含省略号）时不产生重复 key 警告", () => {
    // total=120, pageSize=12 → pageCount=10，page=1 → 窗口 [1, 2, …, 10]
    // 省略号曾用数组下标 2 作 key，与页码 2 的 key 相撞
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<JournalPagination query={{ ...baseQuery, page: 1 }} total={120} pageSize={12} />);
    const duplicateKeyWarning = errorSpy.mock.calls.find((call) =>
      String(call[0]).includes("same key"),
    );
    expect(duplicateKeyWarning).toBeUndefined();
    errorSpy.mockRestore();
  });
});
