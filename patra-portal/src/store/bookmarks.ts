import { create } from "zustand";

interface BookmarkState {
  ids: Set<string>;
  toggle: (id: string) => void;
}

/// 收藏状态（mock：仅客户端、无后端、刷新即重置）。按文献 id 共享，使同页多个 BookmarkButton 实例同步。
export const useBookmarkStore = create<BookmarkState>((set) => ({
  ids: new Set<string>(),
  toggle: (id) =>
    set((s) => {
      const ids = new Set(s.ids);
      if (ids.has(id)) {
        ids.delete(id);
      } else {
        ids.add(id);
      }
      return { ids };
    }),
}));
