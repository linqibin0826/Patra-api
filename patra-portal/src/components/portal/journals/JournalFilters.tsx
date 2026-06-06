"use client";

import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  CAS_ZONE_ORDER,
  JCR_QUARTILE_ORDER,
  serializeVenueBrowseQuery,
} from "@/lib/portal-api/venue-browse";
import { cn } from "@/lib/utils";
import { useJournalFilterUiStore } from "@/store/journal-filter-ui";
import type { VenueBrowseFacets, VenueBrowseQuery } from "@/types/portal";

interface Props {
  facets: VenueBrowseFacets;
  query: VenueBrowseQuery;
  resultTotal?: number;
}

// ---- 内部 helper ----

function toggleArrValue(
  query: VenueBrowseQuery,
  key: "subject" | "jcr" | "cas" | "country",
  value: string,
): VenueBrowseQuery {
  const cur = query[key];
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  return { ...query, [key]: next, page: 1 };
}

function toggleBoolValue(query: VenueBrowseQuery, key: "casTop" | "oa" | "doaj"): VenueBrowseQuery {
  return { ...query, [key]: !query[key], page: 1 };
}

// ---- 子组件 ----

interface CheckRowProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
}

function CheckRow({ checked, onChange, label, count }: CheckRowProps) {
  const isZero = count === 0 && !checked;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/60",
        isZero && "is-zero opacity-50",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-primary"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </label>
  );
}

interface ToggleRowProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}

function ToggleRow({ checked, onChange, label, count }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-primary"
      />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

interface FacetGroupProps {
  title: string;
  selCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FacetGroup({ title, selCount, defaultOpen = true, children }: FacetGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1 px-1 py-2 text-sm font-medium"
      >
        <ChevronDownIcon className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
        <span className="flex-1 text-left">{title}</span>
        {selCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {selCount}
          </span>
        )}
      </button>
      {open && (
        <fieldset aria-label={title} className="border-0 p-0 pb-2 pl-1">
          {children}
        </fieldset>
      )}
    </div>
  );
}

// ---- 主筛选内容（rail 与 sheet 共用） ----

interface FilterControlsProps {
  facets: VenueBrowseFacets;
  query: VenueBrowseQuery;
  onFilter: (nextQuery: VenueBrowseQuery) => void;
}

function FilterControls({ facets, query, onFilter }: FilterControlsProps) {
  const [subjectSearch, setSubjectSearch] = useState("");

  const filteredSubjects = subjectSearch
    ? facets.subject.filter((opt) => opt.value.toLowerCase().includes(subjectSearch.toLowerCase()))
    : facets.subject;

  // JCR 按规范顺序排列，只展示 facets 中有的项
  const jcrOptions = JCR_QUARTILE_ORDER.filter((q) => facets.jcr.some((opt) => opt.value === q));

  // CAS 按规范顺序排列
  const casOptions = CAS_ZONE_ORDER.filter((z) => facets.cas.some((opt) => opt.value === z));

  const getCount = (options: { value: string; count: number }[], value: string) =>
    options.find((o) => o.value === value)?.count ?? 0;

  return (
    <div className="flex flex-col">
      {/* 1. 学科领域 */}
      <FacetGroup title="学科领域" selCount={query.subject.length}>
        <div className="mb-1.5 pr-1">
          <Input
            placeholder="搜索学科…"
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredSubjects.map((opt) => (
            <CheckRow
              key={opt.value}
              label={opt.value}
              count={opt.count}
              checked={query.subject.includes(opt.value)}
              onChange={() => onFilter(toggleArrValue(query, "subject", opt.value))}
            />
          ))}
        </div>
      </FacetGroup>

      {/* 2. JCR 分区 */}
      <FacetGroup title="JCR 分区" selCount={query.jcr.length}>
        {jcrOptions.map((q) => (
          <CheckRow
            key={q}
            label={q}
            count={getCount(facets.jcr, q)}
            checked={query.jcr.includes(q)}
            onChange={() => onFilter(toggleArrValue(query, "jcr", q))}
          />
        ))}
      </FacetGroup>

      {/* 3. 中科院分区 */}
      <FacetGroup title="中科院分区" selCount={query.cas.length + (query.casTop ? 1 : 0)}>
        {casOptions.map((z) => (
          <CheckRow
            key={z}
            label={z}
            count={getCount(facets.cas, z)}
            checked={query.cas.includes(z)}
            onChange={() => onFilter(toggleArrValue(query, "cas", z))}
          />
        ))}
        <div className="mt-1 border-t border-border pt-1">
          <ToggleRow
            label="仅 Top 期刊"
            checked={query.casTop}
            count={facets.casTop}
            onChange={() => onFilter(toggleBoolValue(query, "casTop"))}
          />
        </div>
      </FacetGroup>

      {/* 4. 开放获取 */}
      <FacetGroup title="开放获取" selCount={(query.oa ? 1 : 0) + (query.doaj ? 1 : 0)}>
        <ToggleRow
          label="仅开放获取"
          checked={query.oa}
          count={facets.oa}
          onChange={() => onFilter(toggleBoolValue(query, "oa"))}
        />
        <ToggleRow
          label="收录于 DOAJ"
          checked={query.doaj}
          count={facets.doaj}
          onChange={() => onFilter(toggleBoolValue(query, "doaj"))}
        />
      </FacetGroup>

      {/* 5. 国家 / 地区 */}
      <FacetGroup title="国家 / 地区" selCount={query.country.length}>
        {facets.country.map((opt) => (
          <CheckRow
            key={opt.value}
            label={opt.value}
            count={opt.count}
            checked={query.country.includes(opt.value)}
            onChange={() => onFilter(toggleArrValue(query, "country", opt.value))}
          />
        ))}
      </FacetGroup>
    </div>
  );
}

// ---- 导出组件 ----

/// 期刊浏览筛选面板。
/// 桌面（md+）渲染为侧栏 aside；移动端用 shadcn Sheet 抽屉。
export function JournalFilters({ facets, query, resultTotal }: Props) {
  const router = useRouter();
  const sheetOpen = useJournalFilterUiStore((s) => s.sheetOpen);
  const close = useJournalFilterUiStore((s) => s.close);

  const handleFilter = (nextQuery: VenueBrowseQuery) => {
    const qs = serializeVenueBrowseQuery(nextQuery);
    router.push(`/journals${qs ? `?${qs}` : ""}`);
  };

  const controls = <FilterControls facets={facets} query={query} onFilter={handleFilter} />;

  return (
    <>
      {/* 桌面侧栏 */}
      <aside className="hidden md:block w-56 shrink-0">{controls}</aside>

      {/* 移动端 Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="left" className="md:hidden w-72 overflow-y-auto p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>筛选</SheetTitle>
          </SheetHeader>
          <div className="px-3 pb-2">{controls}</div>
          <SheetFooter className="px-4 pb-4">
            <button
              type="button"
              onClick={close}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {resultTotal != null ? `查看 ${resultTotal} 本结果` : "查看结果"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
