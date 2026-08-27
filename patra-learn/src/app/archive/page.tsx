// patra-learn/src/app/archive/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { INCIDENTS } from "@/content/incidents";
import { getStation } from "@/lib/content";

export const metadata: Metadata = { title: "事故档案馆 · Patra 学习站" };

export default function ArchivePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-baseline gap-4">
        <h1 className="text-3xl font-black tracking-wide">事故档案馆</h1>
        <span className="text-sm text-fog">
          每条规则背后都有一次翻车 · 看完就懂设计「为什么长这样」
        </span>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INCIDENTS.map((i) => {
          const hit = getStation(i.relatedStation);
          return (
            <div
              key={i.no}
              data-testid="incident-card"
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5"
            >
              <span className="self-start rounded-md bg-danger/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-danger">
                档案 #{i.no} · {i.tag}
              </span>
              <span className="text-base font-bold">{i.title}</span>
              <span className="grow text-xs leading-6 text-slate">{i.story}</span>
              <span className="text-xs font-bold text-ok">→ 于是有了：{i.lesson}</span>
              {hit && (
                <Link
                  href={`/lines/${i.relatedStation}`}
                  className="text-[11px] font-bold hover:underline"
                  style={{ color: hit.line.color }}
                >
                  相关站：{hit.line.name.split(" · ")[0] ?? hit.line.name} · {hit.station.name}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
