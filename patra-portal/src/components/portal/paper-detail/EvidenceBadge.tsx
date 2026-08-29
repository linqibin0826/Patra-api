import { deriveEvidence, type EvidenceTone } from "@/lib/portal-api/publication-derive";
import type { EvidenceLevel } from "@/types/portal";

const TONE_CLASS: Record<EvidenceTone, string> = {
  moss: "bg-(--moss-50) text-(--moss-500) border-[color-mix(in_oklab,var(--moss-500)_30%,transparent)]",
  amber:
    "bg-(--amber-50) text-(--amber-500) border-[color-mix(in_oklab,var(--amber-500)_30%,transparent)]",
  slate:
    "bg-(--slate-50) text-(--slate-500) border-[color-mix(in_oklab,var(--slate-500)_30%,transparent)]",
  muted: "border-dashed border-(--border-default) bg-paper-200 text-(--fg-3)",
};
const RUNG_CLASS = ["h-[7px]", "h-[10px]", "h-[12px]", "h-[14px]", "h-[16px]"];

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const ev = deriveEvidence(level);
  // 语料 84% 未分级（多为 MEDLINE 索引未完成或类型标注不全），徽章只在成功分级时出现才有信息量；
  // 未分级仅在速览行以文字呈现（PaperRail）
  if (!ev.derived) {
    return null;
  }
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-md border px-3 py-[7px] ${TONE_CLASS[ev.tone]}`}
      title={`证据等级 · ${ev.label}`}
    >
      <span aria-hidden className="inline-flex h-4 items-end gap-0.5">
        {RUNG_CLASS.map((hc, i) => (
          <span
            key={hc}
            className={`w-1 rounded-[1px] bg-current ${hc} ${i < ev.lit ? "opacity-100" : "opacity-30"}`}
          />
        ))}
      </span>
      <span className="flex flex-col leading-[1.15]">
        <span className="font-sans text-sm font-semibold">{ev.label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.06em] opacity-70">
          证据等级 · {ev.en}
        </span>
      </span>
      <span className="rounded-[3px] border border-current px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.04em] opacity-50">
        衍生
      </span>
    </span>
  );
}
