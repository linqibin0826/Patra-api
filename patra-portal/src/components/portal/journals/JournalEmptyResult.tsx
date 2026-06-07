import Link from "next/link";
import type { VenueBrowseQuery } from "@/types/portal";

interface JournalEmptyResultProps {
  kind: "no-results" | "empty-library";
  query: VenueBrowseQuery;
}

/**
 * 期刊浏览空态（RSC 纯渲染）。
 * - no-results：搜索/筛选无结果，引导用户清除筛选
 * - empty-library：库中本身无期刊数据
 */
export function JournalEmptyResult({ kind, query }: JournalEmptyResultProps) {
  if (kind === "empty-library") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-medium text-fg-1">库中暂无期刊</h2>
        <p className="max-w-sm text-sm text-(--fg-3)">期刊数据尚未入库，请稍后再试。</p>
        <Link
          href="/"
          className="rounded-md border border-border-default px-4 py-2 text-sm transition hover:border-ink-300 hover:bg-paper-100"
        >
          返回首页
        </Link>
      </div>
    );
  }

  const title = query.q ? `未找到匹配 "${query.q}" 的期刊` : "未找到匹配的期刊";

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h2 className="font-serif text-2xl font-medium text-fg-1">{title}</h2>
      <p className="max-w-sm text-sm text-(--fg-3)">请尝试更换搜索词，或放宽筛选条件后重试。</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/journals"
          className="rounded-md border border-border-default px-4 py-2 text-sm transition hover:border-ink-300 hover:bg-paper-100"
        >
          清除全部筛选
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border-default px-4 py-2 text-sm transition hover:border-ink-300 hover:bg-paper-100"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
