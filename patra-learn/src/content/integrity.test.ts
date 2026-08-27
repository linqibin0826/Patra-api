// patra-learn/src/content/integrity.test.ts
import { describe, expect, it } from "vitest";
import { ARTICLES } from "./articles";
import { OPS_CARDS } from "./cheatsheet";
import { GLOSSARY } from "./glossary";
import { INCIDENTS } from "./incidents";
import { LINES, TRANSFER_NODE } from "./lines";

const openLines = LINES.filter((l) => l.status === "open");
const openStations = openLines.flatMap((l) => l.stations.map((s) => `${l.id}/${s.id}`));

describe("线路拓扑完整性", () => {
  it("开通线为 l1/l2/l3，规划线为 l4/l5", () => {
    expect(openLines.map((l) => l.id)).toEqual(["l1", "l2", "l3"]);
    expect(LINES.filter((l) => l.status === "planned").map((l) => l.id)).toEqual(["l4", "l5"]);
  });

  it("开通站总数 = 13（4+5+4）", () => {
    expect(openStations).toHaveLength(13);
    expect(openLines.map((l) => l.stations.length)).toEqual([4, 5, 4]);
  });

  it("线/站 id 全局无重复", () => {
    const lineIds = LINES.map((l) => l.id);
    expect(new Set(lineIds).size).toBe(lineIds.length);
    const refs = LINES.flatMap((l) => l.stations.map((s) => `${l.id}/${s.id}`));
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("换乘节点连接 l1→l2", () => {
    expect(TRANSFER_NODE).toEqual({
      id: "merge-to-main",
      name: "合并进 main",
      from: "l1",
      to: "l2",
    });
  });

  it("每条线都有颜色与 soft 变体", () => {
    for (const l of LINES) {
      expect(l.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(l.softColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("文章注册表完整性", () => {
  it("每个开通站都有文章组件，注册表无多余键", () => {
    expect(Object.keys(ARTICLES).sort()).toEqual([...openStations].sort());
    for (const ref of openStations) {
      expect(typeof ARTICLES[ref as keyof typeof ARTICLES]).toBe("function");
    }
  });
});

describe("词条完整性", () => {
  it("共 10 条、term 无重复", () => {
    expect(GLOSSARY).toHaveLength(10);
    expect(new Set(GLOSSARY.map((g) => g.term)).size).toBe(10);
  });
  it("appearsAt 引用的站都真实存在", () => {
    for (const g of GLOSSARY) {
      if (g.appearsAt === "all") continue;
      for (const ref of g.appearsAt) expect(openStations).toContain(ref);
    }
  });
});

describe("档案与小抄完整性", () => {
  it("6 份档案、编号 1-6 无重复、relatedStation 有效", () => {
    expect(INCIDENTS.map((i) => i.no).sort()).toEqual([1, 2, 3, 4, 5, 6]);
    for (const i of INCIDENTS) expect(openStations).toContain(i.relatedStation);
  });
  it("3 张操作卡、lineId 是开通线", () => {
    expect(OPS_CARDS).toHaveLength(3);
    for (const c of OPS_CARDS) expect(["l1", "l2", "l3"]).toContain(c.lineId);
  });
});
