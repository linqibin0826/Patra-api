import type { StationRef } from "@/content/types";

const KEY = "patra-learn.progress.v1";

function defaultStorage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

/** 读已打卡站列表。storage 不可用 / 内容损坏一律降级为零进度。 */
export function readProgress(storage: Storage | undefined = defaultStorage()): StationRef[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is StationRef => typeof x === "string");
  } catch {
    return [];
  }
}

/** 切换某站打卡状态，返回切换后的完整列表。写失败静默（下次读仍是旧值，可接受）。 */
export function toggleVisited(
  ref: StationRef,
  storage: Storage | undefined = defaultStorage(),
): StationRef[] {
  const current = readProgress(storage);
  const next = current.includes(ref) ? current.filter((r) => r !== ref) : [...current, ref];
  try {
    storage?.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage 被禁用等场景：进度本轮丢失，页面继续可用
  }
  return next;
}
