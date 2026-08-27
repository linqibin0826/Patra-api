"use client";

import { useState } from "react";

/* 命令块：mist 底 + mono 字 + 复制按钮（操作小抄与课程页共用）。 */
export function CodeBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-mist p-4">
      <pre className="overflow-x-auto font-mono text-xs leading-6 text-ink">{command}</pre>
      <button
        type="button"
        className="self-end text-xs font-bold text-slate hover:text-ink"
        onClick={() => {
          navigator.clipboard?.writeText(command).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        {copied ? "已复制 ✓" : "复制命令"}
      </button>
    </div>
  );
}
