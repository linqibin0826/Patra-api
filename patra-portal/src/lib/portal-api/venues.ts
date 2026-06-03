import "server-only";
import type { PageResult, VenueBrowse } from "@/types/portal";

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
 * 注意：响应用裸断言，无运行时校验。
 * TODO(contract-validation)：API 契约稳定后可用 zod safeParse 替换以防后端字段漂移。
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
  return ((await res.json()) as PageResult<VenueBrowse>).items;
}
