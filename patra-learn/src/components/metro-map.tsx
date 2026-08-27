// patra-learn/src/components/metro-map.tsx
"use client";

import { useEffect, useState } from "react";
import { LINES, TRANSFER_NODE } from "@/content/lines";
import type { StationRef } from "@/content/types";
import { firstUnvisited } from "@/lib/content";
import { readProgress } from "@/lib/progress";

const ROW_H = 96;
const X0 = 150; // 首站 x
const STEP = 148; // 站距
const LABEL_X = 24; // 线名标签 x

export function MetroMap() {
  const [visited, setVisited] = useState<StationRef[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setVisited(readProgress());
    setMounted(true);
  }, []);
  const current = mounted ? firstUnvisited(visited) : undefined;

  const width = X0 + STEP * 5 + 60;
  const height = ROW_H * LINES.length + 40;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="学习网络图：三条开通线与两条规划线"
      >
        {LINES.map((line, row) => {
          const y = 48 + row * ROW_H;
          const open = line.status === "open";
          const endX = X0 + STEP * (line.stations.length - 1);
          return (
            <g key={line.id}>
              <text
                x={LABEL_X}
                y={y - 22}
                fontSize="12.5"
                fontWeight="900"
                fill={open ? line.color : "#8b929b"}
              >
                {line.name}
                {open ? "" : " · 规划中"}
              </text>
              <line
                x1={X0}
                y1={y}
                x2={endX}
                y2={y}
                stroke={open ? line.color : "#e3e5df"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={open ? undefined : "10 8"}
              />
              {line.stations.map((s, i) => {
                const ref = `${line.id}/${s.id}` as StationRef;
                const x = X0 + STEP * i;
                const isVisited = open && visited.includes(ref);
                const isCurrent = open && current === ref;
                const dot = (
                  <g key={s.id}>
                    {isCurrent && (
                      <circle
                        cx={x}
                        cy={y}
                        r="15"
                        fill="none"
                        stroke={line.color}
                        strokeWidth="2.5"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="9"
                      fill={open ? (isVisited ? line.color : "#ffffff") : "#f1f2ee"}
                      stroke={open ? line.color : "#8b929b"}
                      strokeWidth="3"
                      data-testid={open ? "station-node" : "planned-node"}
                      data-visited={isVisited || undefined}
                    />
                    <text
                      x={x}
                      y={y + 30}
                      fontSize="12.5"
                      textAnchor="middle"
                      fill={open ? "#565d66" : "#8b929b"}
                    >
                      {s.name}
                    </text>
                  </g>
                );
                // SVG 原生 <a href>（SVG2）：Next Link 的 HTML <a> 不能进 <svg>，
                // 客户端导航退化为整页跳转，可接受。
                return open ? (
                  <a key={s.id} href={`/lines/${ref}`} aria-label={`${line.name}：${s.name}`}>
                    {dot}
                  </a>
                ) : (
                  <g key={s.id}>{dot}</g>
                );
              })}
            </g>
          );
        })}
        {/* 换乘节点：l1 末站(4) → l2 首站(1) 之间的连接 */}
        {(() => {
          const x1 = X0 + STEP * 3; // l1 末站 x
          const y1 = 48; // l1 行 y
          const y2 = 48 + ROW_H; // l2 行 y
          const midY = (y1 + y2) / 2;
          return (
            <g>
              <line
                x1={x1}
                y1={y1}
                x2={X0}
                y2={y2}
                stroke="#22262c"
                strokeWidth="2.5"
                strokeDasharray="4 5"
              />
              <circle
                cx={(x1 + X0) / 2}
                cy={midY}
                r="8"
                fill="#ffffff"
                stroke="#22262c"
                strokeWidth="2.5"
              />
              <text x={(x1 + X0) / 2 + 14} y={midY + 4} fontSize="11.5" fill="#565d66">
                {TRANSFER_NODE.name} · 换乘站
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
