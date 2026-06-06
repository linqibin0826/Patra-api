/**
 * 期刊网格骨架占位（RSC 纯渲染）。
 * 与 JournalGrid 同布局，渲染 12 张 animate-pulse 占位卡。
 */
export function JournalGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: 骨架占位无业务 key，index 是正确选择
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-border-default bg-paper-50"
        >
          {/* 封面占位 */}
          <div className="aspect-[3/4] bg-paper-200" />
          {/* 信息区占位 */}
          <div className="flex flex-col gap-2 border-t border-border-default p-3.5">
            <div className="h-4 w-full rounded bg-paper-200" />
            <div className="h-4 w-2/3 rounded bg-paper-200" />
            <div className="mt-1 h-6 w-1/3 rounded bg-paper-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
