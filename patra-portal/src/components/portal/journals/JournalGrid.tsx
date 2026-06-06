import { JournalCoverCard } from "@/components/portal/JournalCoverCard";
import type { VenueBrowse } from "@/types/portal";

interface JournalGridProps {
  items: VenueBrowse[];
}

/**
 * 期刊浏览网格（RSC 纯渲染）。
 * 响应式：移动单列 → 平板 2 列 → 桌面 3/4 列。
 */
export function JournalGrid({ items }: JournalGridProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((journal) => (
        <li key={journal.id}>
          <JournalCoverCard journal={journal} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
