import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Journals } from "@/components/portal/Journals";
import type { Journal } from "@/types/portal";

vi.mock("@/lib/portal-api/venues", () => ({ fetchVenues: vi.fn() }));
import { fetchVenues } from "@/lib/portal-api/venues";

const SAMPLE: Journal[] = [
  {
    id: "1",
    name: "Annals of oncology",
    abbr: "Ann Oncol",
    impactFactor: 65.4,
    quartile: "Q1",
    foundedYear: 1990,
  },
  {
    id: "2",
    name: "Annals of internal medicine",
    abbr: "Ann Intern Med",
    impactFactor: 51.6,
    quartile: "Q1",
    foundedYear: 1927,
  },
];

describe("Journals", () => {
  beforeEach(() => {
    vi.mocked(fetchVenues).mockReset();
  });

  it("渲染来自 fetchVenues 的期刊卡片", async () => {
    vi.mocked(fetchVenues).mockResolvedValue(SAMPLE);
    render(await Journals());
    expect(screen.getByText("Annals of oncology")).toBeInTheDocument();
    expect(screen.getByText("Annals of internal medicine")).toBeInTheDocument();
  });

  it("含 '高影响力期刊' 标题", async () => {
    vi.mocked(fetchVenues).mockResolvedValue(SAMPLE);
    render(await Journals());
    expect(screen.getByRole("heading", { name: /高影响力期刊/ })).toBeInTheDocument();
  });

  it("fetchVenues 失败时不渲染区块（返回 null）", async () => {
    vi.mocked(fetchVenues).mockRejectedValue(new Error("boom"));
    const ui = await Journals();
    expect(ui).toBeNull();
  });

  it("空列表时不渲染区块（返回 null）", async () => {
    vi.mocked(fetchVenues).mockResolvedValue([]);
    const ui = await Journals();
    expect(ui).toBeNull();
  });
});
