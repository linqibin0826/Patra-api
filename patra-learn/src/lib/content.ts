import { LINES } from "@/content/lines";
import type { Line, Station, StationRef } from "@/content/types";

export const OPEN_LINES: Line[] = LINES.filter((l) => l.status === "open");

/** 全部开通站 ref，按 l1→l2→l3、站序排列（「继续通勤」的遍历顺序）。 */
export function openStationRefs(): StationRef[] {
  return OPEN_LINES.flatMap((l) => l.stations.map((s) => `${l.id}/${s.id}` as StationRef));
}

/** 解析 ref → 线 + 站 + 站内下标。planned 线与未知站返回 undefined。 */
export function getStation(
  ref: string,
): { line: Line; station: Station; index: number } | undefined {
  const [lineId, stationId] = ref.split("/");
  const line = OPEN_LINES.find((l) => l.id === lineId);
  if (!line) return undefined;
  const index = line.stations.findIndex((s) => s.id === stationId);
  if (index === -1) return undefined;
  const station = line.stations[index];
  if (!station) return undefined;
  return { line, station, index };
}

/** 本线内的上一站/下一站（跨线换乘不属于课程导航）。 */
export function adjacentStations(ref: StationRef): { prev?: StationRef; next?: StationRef } {
  const hit = getStation(ref);
  if (!hit) return {};
  const { line, index } = hit;
  const toRef = (s: Station | undefined) => (s ? (`${line.id}/${s.id}` as StationRef) : undefined);
  return { prev: toRef(line.stations[index - 1]), next: toRef(line.stations[index + 1]) };
}

/** 第一个未打卡的开通站（全部打卡完返回 undefined → 首页显示完成态）。 */
export function firstUnvisited(visited: StationRef[]): StationRef | undefined {
  return openStationRefs().find((ref) => !visited.includes(ref));
}
