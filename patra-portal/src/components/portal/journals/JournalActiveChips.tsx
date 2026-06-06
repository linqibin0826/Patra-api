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
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs"
          >
            <span className="text-muted-foreground">{chip.group}</span>
            <span>{chip.label}</span>
            <button
              type="button"
              aria-label={`移除 ${chip.label}`}
              onClick={() => router.push(`/journals${qs ? `?${qs}` : ""}`)}
              className="ml-0.5 flex items-center text-muted-foreground hover:text-foreground"
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
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          清除全部
        </button>
      </li>
    </ul>
  );
}
