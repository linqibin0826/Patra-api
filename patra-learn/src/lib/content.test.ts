import { describe, expect, it } from "vitest";
import { adjacentStations, firstUnvisited, getStation, openStationRefs } from "./content";

describe("content 助手", () => {
  it("openStationRefs 返回 13 个按线路顺序排列的 ref", () => {
    const refs = openStationRefs();
    expect(refs).toHaveLength(13);
    expect(refs[0]).toBe("l1/write-code");
    expect(refs[12]).toBe("l3/notification-philosophy");
  });

  it("getStation 解析 ref，未知 ref 返回 undefined", () => {
    const hit = getStation("l2/native-build");
    expect(hit?.station.name).toBe("本机打包");
    expect(hit?.line.id).toBe("l2");
    expect(getStation("l2/nope")).toBeUndefined();
    expect(getStation("l4/hexagonal")).toBeUndefined(); // planned 线不可解析为课程
  });

  it("adjacentStations 只在本线内前后移动", () => {
    expect(adjacentStations("l1/write-code")).toEqual({ prev: undefined, next: "l1/open-pr" });
    expect(adjacentStations("l1/parallel-exams").next).toBeUndefined();
    expect(adjacentStations("l2/deploy-loop")).toEqual({
      prev: "l2/native-build",
      next: "l2/health-check",
    });
  });

  it("firstUnvisited 跨线找第一个未打卡站；全打卡返回 undefined", () => {
    expect(firstUnvisited([])).toBe("l1/write-code");
    expect(firstUnvisited(["l1/write-code"])).toBe("l1/open-pr");
    expect(firstUnvisited(openStationRefs())).toBeUndefined();
  });
});
