// patra-learn/src/components/continue-card.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StationRef } from "@/content/types";
import { firstUnvisited, getStation, openStationRefs } from "@/lib/content";
import { readProgress } from "@/lib/progress";

export function ContinueCard() {
  const [visited, setVisited] = useState<StationRef[] | null>(null);
  useEffect(() => setVisited(readProgress()), []);

  const total = openStationRefs().length;
  const doneCount = visited?.filter((r) => openStationRefs().includes(r)).length ?? 0;
  const nextRef = visited === null ? undefined : firstUnvisited(visited);
  const next = nextRef ? getStation(nextRef) : undefined;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col gap-1">
        <span
          className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-slate"
          data-testid="progress-badge"
        >
          已到 {doneCount} / {total} 站
        </span>
        <span className="pt-2 text-sm text-fog">
          {next
            ? `接下来学：${next.line.name.split(" · ")[0] ?? next.line.name} · ${next.station.name} —— ${next.station.summary}`
            : visited === null
              ? "正在读取你的通勤记录…"
              : "全线通车！三条线都学完了 🎉"}
        </span>
      </div>
      {next && nextRef && (
        <Link
          href={`/lines/${nextRef}`}
          className="rounded-xl px-5 py-2.5 text-sm font-black text-surface"
          style={{ backgroundColor: next.line.color }}
        >
          继续通勤 →
        </Link>
      )}
    </div>
  );
}
