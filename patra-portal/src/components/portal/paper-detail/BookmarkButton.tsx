"use client";

import { Bookmark } from "lucide-react";
import { btnBlock, btnSecondary } from "@/lib/portal-ui";
import { cn } from "@/lib/utils";
import { useBookmarkStore } from "@/store/bookmarks";

/// 收藏按钮 —— 本版为 mock：无用户系统、无后端，状态存 Zustand（按 paperId 共享，同页多实例同步）。
export function BookmarkButton({ paperId, block = false }: { paperId: string; block?: boolean }) {
  const bookmarked = useBookmarkStore((s) => s.ids.has(paperId));
  const toggle = useBookmarkStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={bookmarked}
      onClick={() => toggle(paperId)}
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
