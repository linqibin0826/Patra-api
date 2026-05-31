import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFeed } from "@/lib/portal-api/publications";
import type { PageResult, Paper } from "@/types/portal";

const EMPTY: PageResult<Paper> = { page: 1, pageSize: 14, total: 0, totalPages: 0, items: [] };

describe("fetchFeed", () => {
  beforeEach(() => {
    process.env.PATRA_GATEWAY_BASE_URL = "http://gw.test:9528";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.PATRA_GATEWAY_BASE_URL = undefined;
  });

  it("拼出正确的 gateway URL 并解析 JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(EMPTY), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchFeed("cited", 2, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/publications?tab=cited&page=2&pageSize=20",
      { cache: "no-store" },
    );
    expect(result).toEqual(EMPTY);
  });

  it("非 2xx 抛错", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 502 })));
    await expect(fetchFeed("recent")).rejects.toThrow(/502/);
  });

  it("缺 PATRA_GATEWAY_BASE_URL 抛错", async () => {
    process.env.PATRA_GATEWAY_BASE_URL = undefined;
    await expect(fetchFeed("recent")).rejects.toThrow(/PATRA_GATEWAY_BASE_URL/);
  });
});
