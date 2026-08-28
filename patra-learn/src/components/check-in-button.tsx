"use client";

import { useEffect, useState } from "react";
import type { StationRef } from "@/content/types";
import { readProgress, toggleVisited } from "@/lib/progress";

/* 课程页文末打卡按钮。挂载后才读 localStorage（避免 hydration mismatch）。 */
export function CheckInButton({ stationRef }: { stationRef: StationRef }) {
  const [visited, setVisited] = useState<boolean | null>(null); // null = 未挂载

  useEffect(() => {
    setVisited(readProgress().includes(stationRef));
  }, [stationRef]);

  return (
    <button
      type="button"
      data-testid="check-in"
      disabled={visited === null}
      className={`self-start rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${
        visited
          ? "border-ok bg-ok text-surface"
          : "border-line bg-surface text-slate hover:text-ink"
      }`}
      onClick={() => setVisited(toggleVisited(stationRef).includes(stationRef))}
    >
      {visited ? "✓ 已学完这一站（点击取消）" : "我学完这一站了"}
    </button>
  );
}
