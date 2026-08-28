// patra-learn/src/components/article-layout.tsx
import Link from "next/link";
import { CheckInButton } from "@/components/check-in-button";
import { LineChip } from "@/components/line-chip";
import type { Line, Station, StationRef } from "@/content/types";
import { adjacentStations, getStation } from "@/lib/content";

function NavLink({ toRef, dir }: { toRef?: StationRef; dir: "prev" | "next" }) {
  if (!toRef) return <span />;
  const hit = getStation(toRef);
  if (!hit) return <span />;
  return (
    <Link href={`/lines/${toRef}`} className="text-sm font-bold text-slate hover:text-ink">
      {dir === "prev" ? `← 上一站：${hit.station.name}` : `下一站：${hit.station.name} →`}
    </Link>
  );
}

export function ArticleLayout({
  line,
  station,
  stationRef,
  children,
}: {
  line: Line;
  station: Station;
  stationRef: StationRef;
  children: React.ReactNode;
}) {
  const { prev, next } = adjacentStations(stationRef);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <LineChip line={line} />
        <h1 className="text-4xl font-black tracking-wide">{station.name}</h1>
        <p className="text-sm text-fog">{station.summary}</p>
        {/* 本线站条：当前站高亮为线路色 */}
        <nav className="flex flex-wrap items-center gap-2 border-y border-line py-3 text-xs">
          {line.stations.map((s) => (
            <Link
              key={s.id}
              href={`/lines/${line.id}/${s.id}`}
              className={s.id === station.id ? "font-black" : "text-fog hover:text-ink"}
              style={s.id === station.id ? { color: line.color } : undefined}
            >
              {s.name}
            </Link>
          ))}
        </nav>
      </header>
      <article className="flex flex-col gap-8">{children}</article>
      <footer className="flex flex-col gap-6 border-t border-line pt-6">
        <CheckInButton stationRef={stationRef} />
        <div className="flex items-center justify-between">
          <NavLink toRef={prev} dir="prev" />
          <NavLink toRef={next} dir="next" />
        </div>
      </footer>
    </main>
  );
}
