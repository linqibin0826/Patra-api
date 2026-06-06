import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchVenueDetail, fetchVenues } from "@/lib/portal-api/venues";
import type { PageResult, VenueBrowse } from "@/types/portal";

const SAMPLE_VENUE: VenueBrowse = {
  id: "319041872872550658",
  name: "Annals of oncology",
  abbr: "Ann Oncol",
  coverObjectKey: null,
  impactFactor: 65.4,
  jcrQuartile: "Q1",
  jcrSubject: null,
  casMajorCategory: null,
  casMajorQuartile: null,
  casIsTop: null,
  countryCode: null,
  citedByCount: null,
  foundedYear: 1990,
  isOpenAccess: null,
  isInDoaj: null,
  issnL: null,
};

const SAMPLE_PAGE: PageResult<VenueBrowse> = {
  page: 1,
  pageSize: 6,
  total: 1,
  totalPages: 1,
  items: [SAMPLE_VENUE],
};

describe("fetchVenues", () => {
  beforeEach(() => {
    process.env.PATRA_GATEWAY_BASE_URL = "http://gw.test:9528";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PATRA_GATEWAY_BASE_URL;
  });

  it("拼出正确的 gateway URL 并解析 PageResult.items", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(SAMPLE_PAGE), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchVenues(6);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/venues?sort=impactFactor&pageSize=6",
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result).toEqual([SAMPLE_VENUE]);
  });

  it("pageSize 默认 6", async () => {
    const emptyPage: PageResult<VenueBrowse> = {
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 0,
      items: [],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(emptyPage), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchVenues();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/venues?sort=impactFactor&pageSize=6",
      expect.anything(),
    );
  });

  it("非 2xx 抛错", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 502 })));
    await expect(fetchVenues()).rejects.toThrow(/502/);
  });

  it("缺 PATRA_GATEWAY_BASE_URL 抛错", async () => {
    delete process.env.PATRA_GATEWAY_BASE_URL;
    await expect(fetchVenues()).rejects.toThrow(/PATRA_GATEWAY_BASE_URL/);
  });

  it("坏 payload（缺 items）降级返回空数组", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ page: 1 }), { status: 200 })),
    );
    const result = await fetchVenues();
    expect(result).toEqual([]);
  });
});

describe("fetchVenueDetail", () => {
  beforeEach(() => {
    process.env.PATRA_GATEWAY_BASE_URL = "http://gw.test:9528";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PATRA_GATEWAY_BASE_URL;
  });

  it("非数字 id 直接返回 null，不发起请求", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchVenueDetail("abc")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("BE 404 → 返回 null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    expect(await fetchVenueDetail("123")).toBeNull();
  });

  it("成功 → 返回解析后的 VenueDetail", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ id: "123", title: "Nature" }), { status: 200 }),
        ),
    );
    const v = await fetchVenueDetail("123");
    expect(v).toEqual({ id: "123", title: "Nature" });
  });

  it("拼出正确的 gateway URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: "123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await fetchVenueDetail("123");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/venues/123",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
    );
  });

  it("5xx → 抛错冒泡到 error boundary", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 503 })));
    await expect(fetchVenueDetail("123")).rejects.toThrow(/503/);
  });

  it("缺 PATRA_GATEWAY_BASE_URL 抛错", async () => {
    delete process.env.PATRA_GATEWAY_BASE_URL;
    await expect(fetchVenueDetail("123")).rejects.toThrow(/PATRA_GATEWAY_BASE_URL/);
  });
});
