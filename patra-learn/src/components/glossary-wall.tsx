"use client";

import Link from "next/link";
import { useState } from "react";
import { termSlug } from "@/components/term";
import { GLOSSARY } from "@/content/glossary";
import { getStation } from "@/lib/content";

export function GlossaryWall() {
  const [q, setQ] = useState("");
  const qLower = q.toLowerCase();
  const hits = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(qLower) ||
      g.analogy.toLowerCase().includes(qLower) ||
      g.explain.toLowerCase().includes(qLower),
  );
  return (
    <div className="flex flex-col gap-6">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索词条…"
        aria-label="搜索词条"
        data-testid="glossary-search"
        className="w-64 rounded-xl border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-fog"
      />
      {hits.length === 0 ? (
        <p className="text-sm text-fog">没有匹配的词条——换个关键词试试。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {hits.map((g) => (
            <div
              key={g.term}
              id={termSlug(g.term)}
              data-testid="glossary-card"
              className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4"
            >
              <span className="text-base font-bold">{g.term}</span>
              <span className="text-xs font-bold" style={{ color: "#2e66c9" }}>
                {g.analogy}
              </span>
              <span className="grow text-xs leading-6 text-slate">{g.explain}</span>
              {g.appearsAt === "all" ? (
                <span className="text-[11px] text-fog">出现于：全部线路</span>
              ) : (
                g.appearsAt.map((ref) => {
                  const hit = getStation(ref);
                  if (!hit) return null;
                  return (
                    <Link
                      key={ref}
                      href={`/lines/${ref}`}
                      className="text-[11px] font-bold hover:underline"
                      style={{ color: hit.line.color }}
                    >
                      出现于：{hit.line.name.split(" · ")[0] ?? hit.line.name} · {hit.station.name}
                    </Link>
                  );
                })
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
