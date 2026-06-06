import "server-only";
import type { PageResult, VenueBrowse, VenueDetail } from "@/types/portal";

/** 服务端 fetch 超时（ms）：慢后端不应无限阻塞 RSC 渲染线程 */
const FETCH_TIMEOUT_MS = 10_000;

/**
 * 在服务端拉取 portal 期刊榜（按影响因子降序，取前 pageSize 条）。
 * 仅 RSC / Route Handler 调用（server-only）。
 * 通过 gateway 访问 catalog，gateway 地址只在服务端可见。
 *
 * 端点：`GET /portal/venues?sort=impactFactor&pageSize=<n>`
 * 响应：`PageResult<VenueBrowse>`，期刊数组在 `.items`。
 *
 * 响应做最小运行时校验：若 payload 缺少 `items` 数组则降级返回空列表，避免调用方 `.length` 抛错。
 */
export async function fetchVenues(pageSize = 6): Promise<VenueBrowse[]> {
  const baseUrl = process.env.PATRA_GATEWAY_BASE_URL;
  if (!baseUrl) {
    throw new Error("PATRA_GATEWAY_BASE_URL 未配置");
  }
  const url = `${baseUrl}/patra-catalog/portal/venues?sort=impactFactor&pageSize=${pageSize}`;
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`期刊榜加载失败：${res.status}`);
  }
  const data = (await res.json()) as PageResult<VenueBrowse>;
  if (!Array.isArray(data?.items)) {
    console.warn("[fetchVenues] 响应缺少 items 字段，降级返回空列表", data);
    return [];
  }
  return data.items;
}

/**
 * 在服务端拉取单个期刊详情（按数字 id）。仅 RSC 调用（server-only）。
 *
 * 端点：`GET /patra-catalog/portal/venues/{id}`，响应 `VenueDetail`（扁平 + 评级列表）。
 * 返回约定：
 * - 非数字 id（坏 URL）→ 直接 `null`，不触达 BE
 * - BE 404（刊不存在）→ `null`，由调用方转 `notFound()`
 * - 其他失败（5xx / 超时 / 网络）→ throw，冒泡到全局 error boundary
 */
export async function fetchVenueDetail(id: string): Promise<VenueDetail | null> {
  if (!/^\d+$/.test(id)) {
    return null;
  }
  const baseUrl = process.env.PATRA_GATEWAY_BASE_URL;
  if (!baseUrl) {
    throw new Error("PATRA_GATEWAY_BASE_URL 未配置");
  }
  const url = `${baseUrl}/patra-catalog/portal/venues/${id}`;
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`期刊详情加载失败：${res.status}`);
  }
  return (await res.json()) as VenueDetail;
}
