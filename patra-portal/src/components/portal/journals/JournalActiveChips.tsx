"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { deriveActiveChips, serializeVenueBrowseQuery } from "@/lib/portal-api/venue-browse";
import type { VenueBrowseQuery } from "@/types/portal";

interface Props {
  query: VenueBrowseQuery;
}

/// 期刊浏览页已选筛选 chip 行。无已选筛选时不渲染。
export function JournalActiveChips({ query }: Props) {
  const router = useRouter();
  const chips = deriveActiveChips(query);

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="已选筛选条件">
      {chips.map((chip) => {
        const qs = serializeVenueBrowseQuery(chip.next);
        return (
          <li
            key={`${chip.group}-${chip.value}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-clay-200 bg-clay-50 py-0.5 pr-1 pl-2.5 text-xs font-medium text-clay-800"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.04em] text-clay-600">
              {chip.group}
            </span>
            <span>{chip.label}</span>
            <button
              type="button"
              aria-label={`移除 ${chip.label}`}
              onClick={() => router.push(`/journals${qs ? `?${qs}` : ""}`)}
              className="flex size-4 items-center justify-center rounded-full text-clay-600 hover:bg-clay-100 hover:text-clay-900"
            >
              <XIcon className="size-3" />
            </button>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={() => router.push("/journals")}
          className="text-xs text-(--fg-3) underline underline-offset-2 hover:text-clay-700"
        >
          清除全部
        </button>
      </li>
    </ul>
  );
}
