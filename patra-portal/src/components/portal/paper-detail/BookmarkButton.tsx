"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { btnBlock, btnSecondary } from "@/lib/portal-ui";
import { cn } from "@/lib/utils";

/// 收藏按钮 —— 本版为 mock：无用户系统、无后端，仅本地切换视觉态（图标填充 + 文案）。
export function BookmarkButton({ block = false }: { block?: boolean }) {
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={bookmarked}
      onClick={() => setBookmarked((b) => !b)}
      className={cn(btnSecondary, block && btnBlock)}
    >
      <Bookmark
        size={14}
        strokeWidth={1.5}
        aria-hidden
        className={bookmarked ? "fill-clay-500 text-clay-500" : ""}
      />
      {bookmarked ? "已收藏" : "收藏"}
    </button>
  );
}
