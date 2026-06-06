"use client";

import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SORT_OPTIONS, serializeVenueBrowseQuery } from "@/lib/portal-api/venue-browse";
import { cn } from "@/lib/utils";
import { useJournalFilterUiStore } from "@/store/journal-filter-ui";
import type { VenueBrowseQuery } from "@/types/portal";

interface Props {
  query: VenueBrowseQuery;
}

/// 期刊浏览页检索框 + 排序段控件 + 移动端筛选按钮。
/// 检索框防抖 300ms replace；排序/筛选 push。
export function JournalSearchSortControls({ query }: Props) {
  const router = useRouter();
  const open = useJournalFilterUiStore((s) => s.open);

  const [localQ, setLocalQ] = useState(query.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 当外部 query.q 改变时（如清除 chip 后），同步本地状态
  useEffect(() => {
    setLocalQ(query.q);
  }, [query.q]);

  const handleInputChange = useCallback(
    (value: string) => {
      setLocalQ(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const qs = serializeVenueBrowseQuery({ ...query, q: value, page: 1 });
        router.replace(`/journals${qs ? `?${qs}` : ""}`);
      }, 300);
    },
    [query, router],
  );

  const handleClear = useCallback(() => {
    setLocalQ("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const qs = serializeVenueBrowseQuery({ ...query, q: "", page: 1 });
    router.replace(`/journals${qs ? `?${qs}` : ""}`);
  }, [query, router]);

  const handleSort = useCallback(
    (sortId: VenueBrowseQuery["sort"]) => {
      const qs = serializeVenueBrowseQuery({ ...query, sort: sortId, page: 1 });
      router.push(`/journals${qs ? `?${qs}` : ""}`);
    },
    [query, router],
  );

  // 计算已选筛选维度总数（用于移动端角标）
  const activeFilterCount =
    query.subject.length +
    query.jcr.length +
    query.cas.length +
    query.country.length +
    (query.casTop ? 1 : 0) +
    (query.oa ? 1 : 0) +
    (query.doaj ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      {/* 检索框 */}
      <div className="relative flex items-center gap-2">
        <Input
          role="searchbox"
          type="search"
          placeholder="搜索期刊名称或缩写…"
          value={localQ}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pr-8"
        />
        {localQ && (
          <button
            type="button"
            aria-label="清除搜索"
            onClick={handleClear}
            className="absolute right-2 flex items-center text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {/* 排序 + 移动端筛选按钮 */}
      <div className="flex items-center gap-2">
        {/* 排序段 */}
        <fieldset className="flex flex-wrap gap-1 border-0 p-0" aria-label="排序方式">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant="outline"
              size="sm"
              aria-pressed={query.sort === opt.id}
              onClick={() => handleSort(opt.id)}
              className={cn(query.sort === opt.id && "border-ring bg-muted font-semibold")}
            >
              {opt.label}
            </Button>
          ))}
        </fieldset>

        {/* 移动端筛选按钮（md 以上隐藏） */}
        <Button
          variant="outline"
          size="sm"
          className="relative ml-auto md:hidden"
          onClick={open}
          aria-label="筛选"
        >
          <SlidersHorizontalIcon className="size-3.5" />
          筛选
          {activeFilterCount > 0 && (
            <span
              data-testid="filter-badge"
              className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
