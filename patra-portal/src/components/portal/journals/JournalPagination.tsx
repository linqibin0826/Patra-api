import Link from "next/link";
import { serializeVenueBrowseQuery } from "@/lib/portal-api/venue-browse";
import type { VenueBrowseQuery } from "@/types/portal";

interface JournalPaginationProps {
  query: VenueBrowseQuery;
  total: number;
  pageSize: number;
}

/**
 * 计算分页窗口，返回页码数组（省略号用字符串 "…" 表示）。
 * - total ≤ 7：全列
 * - 否则：始终展示首页、末页、当前页及其前后各一页，间隙用 "…" 填充
 */
export function pageWindow(cur: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>(
    [1, total, cur - 1, cur, cur + 1].filter((p) => p >= 1 && p <= total),
  );
  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const prev = sorted[i - 1];
    if (cur === undefined) continue;
    if (i > 0 && prev !== undefined && cur - prev > 1) {
      result.push("…");
    }
    result.push(cur);
  }
  return result;
}

/**
 * 期刊浏览分页导航（RSC 纯渲染）。
 * pageCount ≤ 1 时返回 null。
 */
export function JournalPagination({ query, total, pageSize }: JournalPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * pageSize;
  const end = Math.min(page * pageSize, total);

  function hrefFor(p: number): string {
    const qs = serializeVenueBrowseQuery({ ...query, page: p });
    return `/journals${qs ? `?${qs}` : ""}`;
  }

  const window = pageWindow(page, pageCount);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-(--fg-3)">
        第 {start + 1}–{end} 本 · 共 {total} 本
      </p>
      <nav aria-label="分页" className="flex items-center gap-1">
        <Link
          href={hrefFor(page - 1)}
          aria-label="上一页"
          aria-disabled={page <= 1 ? "true" : undefined}
          tabIndex={page <= 1 ? -1 : undefined}
          className={
            "flex h-8 w-8 items-center justify-center rounded border border-border-default text-sm transition " +
            (page <= 1
              ? "pointer-events-none opacity-40"
              : "hover:border-ink-300 hover:bg-paper-100")
          }
        >
          ‹
        </Link>

        {window.map((item, position) =>
          item === "…" ? (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 省略号无业务 id，位置索引是唯一标识；加 gap- 前缀避免与数字页码 key 相撞
              key={`gap-${position}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-(--fg-3)"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefFor(item)}
              aria-label={String(item)}
              aria-current={item === page ? "page" : undefined}
              className={
                "flex h-8 w-8 items-center justify-center rounded border text-sm transition " +
                (item === page
                  ? "border-ink-900 bg-ink-900 font-semibold text-paper-50"
                  : "border-border-default hover:border-ink-300 hover:bg-paper-100")
              }
            >
              {item}
            </Link>
          ),
        )}

        <Link
          href={hrefFor(page + 1)}
          aria-label="下一页"
          aria-disabled={page >= pageCount ? "true" : undefined}
          tabIndex={page >= pageCount ? -1 : undefined}
          className={
            "flex h-8 w-8 items-center justify-center rounded border border-border-default text-sm transition " +
            (page >= pageCount
              ? "pointer-events-none opacity-40"
              : "hover:border-ink-300 hover:bg-paper-100")
          }
        >
          ›
        </Link>
      </nav>
    </div>
  );
}
