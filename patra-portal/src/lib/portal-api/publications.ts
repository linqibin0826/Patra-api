import "server-only";
import type { FeedTab, PageResult, Paper } from "@/types/portal";

/**
 * 在服务端拉取 portal 文献流。仅 RSC / Route Handler 调用（server-only）。
 * 通过 gateway 访问 catalog，gateway 地址只在服务端可见。
 */
export async function fetchFeed(tab: FeedTab, page = 1, pageSize = 14): Promise<PageResult<Paper>> {
  const baseUrl = process.env.PATRA_GATEWAY_BASE_URL || undefined;
  if (!baseUrl || baseUrl === "undefined") {
    throw new Error("PATRA_GATEWAY_BASE_URL 未配置");
  }
  const url = `${baseUrl}/patra-catalog/portal/publications?tab=${tab}&page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`文献流加载失败：${res.status}`);
  }
  return (await res.json()) as PageResult<Paper>;
}
