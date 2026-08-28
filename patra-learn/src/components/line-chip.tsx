import type { Line } from "@/content/types";

/* 线路徽章：线路色实底、白字、mono 编号感（画布 Components 规范）。 */
export function LineChip({ line, label }: { line: Line; label?: string }) {
  return (
    <span
      className="inline-block rounded-lg px-2.5 py-0.5 font-mono text-xs font-semibold text-surface"
      style={{ backgroundColor: line.color }}
    >
      {label ?? line.name}
    </span>
  );
}
