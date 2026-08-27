// patra-learn/src/app/cheatsheet/page.tsx
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { OPS_CARDS, RED_LINES } from "@/content/cheatsheet";
import { LINES } from "@/content/lines";

export const metadata: Metadata = { title: "操作小抄 · Patra 学习站" };

export default function CheatsheetPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-baseline gap-4">
        <h1 className="text-3xl font-black tracking-wide">操作小抄</h1>
        <span className="text-sm text-fog">照着做就能用 · 每条命令旁边都有「什么时候用它」</span>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPS_CARDS.map((c) => {
          const line = LINES.find((l) => l.id === c.lineId);
          return (
            <div
              key={c.action}
              className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-5"
            >
              <span
                className="self-start rounded-lg px-2.5 py-0.5 font-mono text-[11.5px] font-semibold text-surface"
                style={{ backgroundColor: line?.color }}
              >
                {c.action}
              </span>
              <span className="text-xs leading-6 text-slate">什么时候用：{c.scenario}</span>
              <CodeBlock command={c.command} />
              <span className="text-[11px] text-fog">{c.note}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-3">
        {RED_LINES.map((text, i) => (
          <div
            key={text}
            className="rounded-xl border border-line border-l-4 border-l-danger bg-surface px-4 py-3 text-sm text-slate"
          >
            <strong className="text-ink">红线{i === 0 ? "一" : "二"}：</strong>
            {text}
          </div>
        ))}
      </div>
    </main>
  );
}
