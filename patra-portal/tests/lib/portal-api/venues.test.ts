import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchVenues } from "@/lib/portal-api/venues";
import type { PageResult, VenueBrowse } from "@/types/portal";

const SAMPLE_VENUE: VenueBrowse = {
  id: "319041872872550658",
  name: "Annals of oncology",
  abbr: "Ann Oncol",
  cover: null,
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
});
