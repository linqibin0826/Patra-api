import { beforeEach, describe, expect, it } from "vitest";
import { useJournalFilterUiStore } from "@/store/journal-filter-ui";

describe("useJournalFilterUiStore", () => {
  // 每个用例前固定为关闭态，避免共享单例的用例顺序耦合
  beforeEach(() => {
    useJournalFilterUiStore.setState({ sheetOpen: false });
  });

  it("初始 sheetOpen 为 false", () => {
    const state = useJournalFilterUiStore.getState();
    expect(state.sheetOpen).toBe(false);
  });

  it("open() 将 sheetOpen 设为 true", () => {
    useJournalFilterUiStore.getState().open();
    expect(useJournalFilterUiStore.getState().sheetOpen).toBe(true);
    // 清理
    useJournalFilterUiStore.getState().close();
  });

  it("close() 将 sheetOpen 设为 false", () => {
    useJournalFilterUiStore.getState().open();
    useJournalFilterUiStore.getState().close();
    expect(useJournalFilterUiStore.getState().sheetOpen).toBe(false);
  });

  it("toggle() 将 false → true", () => {
    useJournalFilterUiStore.setState({ sheetOpen: false });
    useJournalFilterUiStore.getState().toggle();
    expect(useJournalFilterUiStore.getState().sheetOpen).toBe(true);
    // 清理
    useJournalFilterUiStore.getState().close();
  });

  it("toggle() 将 true → false", () => {
    useJournalFilterUiStore.setState({ sheetOpen: true });
    useJournalFilterUiStore.getState().toggle();
    expect(useJournalFilterUiStore.getState().sheetOpen).toBe(false);
  });
});
