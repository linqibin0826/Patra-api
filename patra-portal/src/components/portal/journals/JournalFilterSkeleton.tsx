/**
 * 期刊筛选侧栏骨架占位（RSC 纯渲染）。
 * 渲染几组标题 + 若干行占位，与 facet 侧栏布局对齐。
 */
export function JournalFilterSkeleton() {
  const groups = [4, 5, 3, 4];

  return (
    <aside aria-hidden="true" className="flex flex-col gap-6">
      {groups.map((count, groupIdx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 骨架占位无业务 key，index 是正确选择
        <div key={groupIdx} className="flex flex-col gap-2.5">
          {/* 组标题占位 */}
          <div className="h-4 w-1/2 animate-pulse rounded bg-paper-200" />
          {/* 选项行占位 */}
          {Array.from({ length: count }).map((_, rowIdx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 骨架占位无业务 key，index 是正确选择
            <div key={rowIdx} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-pulse rounded bg-paper-200" />
              <div className="h-3.5 flex-1 animate-pulse rounded bg-paper-200" />
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
