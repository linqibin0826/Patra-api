import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchVenues } from "@/lib/portal-api/venues";
import type { Journal } from "@/types/portal";

const SAMPLE: Journal[] = [
  {
    id: "319041872872550658",
    name: "Annals of oncology",
    abbr: "Ann Oncol",
    impactFactor: 65.4,
    quartile: "Q1",
    foundedYear: 1990,
  },
];

describe("fetchVenues", () => {
  beforeEach(() => {
    process.env.PATRA_GATEWAY_BASE_URL = "http://gw.test:9528";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PATRA_GATEWAY_BASE_URL;
  });

  it("拼出正确的 gateway URL 并解析 JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(SAMPLE), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchVenues(6);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/venues?topN=6",
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result).toEqual(SAMPLE);
  });

  it("topN 默认 6", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchVenues();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gw.test:9528/patra-catalog/portal/venues?topN=6",
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
