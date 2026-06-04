import type { CSSProperties } from "react";
import type { VenueBrowse } from "@/types/portal";

/** 深色学术调色板（延续原 mock 视觉质感）：bg 深底 + ink 浅字。 */
const COVER_PALETTE = [
  { bg: "#3C1611", ink: "#F6E8DA" },
  { bg: "#1F2E45", ink: "#E9EEF4" },
  { bg: "#0E574F", ink: "#ECF5F3" },
  { bg: "#1C1917", ink: "#F4D9B8" },
  { bg: "#5A1A14", ink: "#F6E8DA" },
  { bg: "#6E3216", ink: "#FBF1E8" },
] as const;

/** 按期刊 id 稳定 hash 选取调色板（同一期刊每次同色，SSR/CSR 一致）。 */
function pickCover(id: string): { bg: string; ink: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  // 取模保证索引落在 [0, length) 内；?? 兜底首元素让 TS 在 noUncheckedIndexedAccess 下推断为非空
  return COVER_PALETTE[Math.abs(hash) % COVER_PALETTE.length] ?? COVER_PALETTE[0];
}

interface JournalCoverCardProps {
  journal: VenueBrowse;
  className?: string;
}

export function JournalCoverCard({ journal, className }: JournalCoverCardProps) {
  const { bg, ink } = pickCover(journal.id);
  // data-driven hex colors cannot be expressed as static Tailwind utilities;
  // CSS variables are the canonical escape hatch per design system.
  const coverVars = {
    "--cover-bg": bg,
    "--cover-ink": ink,
  } as CSSProperties;

  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title={`${journal.name} · 功能即将上线`}
      className={
        "flex flex-col overflow-hidden rounded-lg border border-border-default bg-paper-50 text-inherit no-underline transition hover:-translate-y-px hover:border-ink-300 hover:shadow-[0_6px_16px_-10px_rgba(28,25,23,0.18)] disabled:cursor-not-allowed " +
        (className ?? "")
      }
    >
      <div
        data-cover
        style={coverVars}
        className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[var(--cover-bg)] p-4 text-center text-[var(--cover-ink)] before:absolute before:inset-2 before:border before:border-current before:opacity-20 before:content-['']"
      >
        {journal.foundedYear !== null && (
          <div className="absolute left-2 right-2 top-3 text-center font-mono text-[9.5px] uppercase tracking-[0.18em] opacity-70">
            est. {journal.foundedYear}
          </div>
        )}
        <div className="whitespace-pre-line font-serif font-medium leading-[1.05] tracking-tight text-[clamp(20px,2.2vw,26px)]">
          {journal.abbr}
        </div>
        <div className="absolute bottom-3 left-2 right-2 text-center font-mono text-[9px] tracking-[0.14em] opacity-60">
          vol · 2026
        </div>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-border-default bg-paper-50 p-3.5">
        <div className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-fg-1">
          {journal.name}
        </div>
        <div className="font-mono text-[10.5px] uppercase tracking-caps text-fg-3">
          {journal.abbr}
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-serif text-xl font-medium leading-tight tracking-tight text-ink-900 tabular-nums">
              {journal.impactFactor.toFixed(1)}
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-caps text-fg-3">
              影响因子
            </span>
          </div>
          <div className="text-right font-mono leading-snug text-fg-2">
            <span className="block font-mono text-[9.5px] uppercase tracking-caps text-fg-3">
              JCR 分区
            </span>
            <span className="text-[13px] font-semibold tabular-nums">
              {journal.jcrQuartile ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
