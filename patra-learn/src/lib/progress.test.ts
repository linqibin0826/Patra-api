import { describe, expect, it } from "vitest";
import { readProgress, toggleVisited } from "./progress";

function fakeStorage(init: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(init));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

const throwingStorage = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
} as unknown as Storage;

describe("progress", () => {
  it("空 storage 读出零进度", () => {
    expect(readProgress(fakeStorage())).toEqual([]);
  });

  it("打卡后可读回；再打一次取消（幂等切换）", () => {
    const s = fakeStorage();
    expect(toggleVisited("l1/write-code", s)).toEqual(["l1/write-code"]);
    expect(readProgress(s)).toEqual(["l1/write-code"]);
    expect(toggleVisited("l1/write-code", s)).toEqual([]);
    expect(readProgress(s)).toEqual([]);
  });

  it("坏 JSON 按零进度降级", () => {
    const s = fakeStorage({ "patra-learn.progress.v1": "not-json{{" });
    expect(readProgress(s)).toEqual([]);
  });

  it("storage 抛异常时读=零进度、写=静默不炸", () => {
    expect(readProgress(throwingStorage)).toEqual([]);
    expect(() => toggleVisited("l1/write-code", throwingStorage)).not.toThrow();
  });

  it("无 storage（SSR）时读=零进度", () => {
    expect(readProgress(undefined)).toEqual([]);
  });
});
