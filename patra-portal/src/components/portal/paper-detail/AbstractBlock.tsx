import { deriveAbstract } from "@/lib/portal-api/publication-derive";
import type { PaperDetail } from "@/types/portal";

export function AbstractBlock({ paper }: { paper: PaperDetail }) {
  const abstract = deriveAbstract(paper);
  if (abstract.kind === "empty") {
    return (
      <div className="rounded-md border border-dashed border-(--border-default) bg-paper-100 p-5 text-center font-sans text-md italic text-(--fg-3)">
        暂无摘要 · 该来源未提供结构化或纯文本摘要
      </div>
    );
  }
  if (abstract.kind === "plain") {
    return <p className="m-0 font-serif text-lg leading-relaxed text-ink-800">{abstract.text}</p>;
  }
  return (
    <div>
      {abstract.sections.map((s) => (
        <div
          key={s.label}
          className="grid grid-cols-[92px_1fr] gap-[18px] border-t border-(--border-subtle) py-3.5 first:border-t-0 max-[640px]:grid-cols-1 max-[640px]:gap-[5px]"
        >
          <div className="pt-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-clay-700">
            {s.label}
          </div>
          <p className="m-0 font-serif text-lg leading-relaxed text-ink-800">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
