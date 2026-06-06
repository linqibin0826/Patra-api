import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/portal/paper-detail/BookmarkButton";
import { EvidenceBadge } from "@/components/portal/paper-detail/EvidenceBadge";
import { deriveByline, deriveFullTextHref } from "@/lib/portal-api/publication-derive";
import { btnPrimary, btnSecondary } from "@/lib/portal-ui";
import type { PaperDetail } from "@/types/portal";

export function PaperHeader({ paper }: { paper: PaperDetail }) {
  const { shown, extra } = deriveByline(paper.authors);
  const fullHref = deriveFullTextHref(paper);

  return (
    <header className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {paper.publicationTypes.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-sm bg-paper-200 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.05em] text-(--fg-3)"
          >
            {t}
          </span>
        ))}
        {paper.isOa && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500 bg-(--moss-50) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-moss-500">
            开放获取
          </span>
        )}
      </div>

      <h1 className="m-0 mb-1.5 text-pretty font-serif text-[clamp(26px,3.4vw,36px)] font-medium leading-[1.16] tracking-[-0.02em] text-(--fg-1)">
        {paper.title}
      </h1>
      {paper.originalTitle && (
        <p className="m-0 mb-4 font-serif text-lg italic leading-snug text-(--fg-3)">
          {paper.originalTitle}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center font-sans text-md leading-normal text-(--fg-2)">
        {shown.map((a, i) => (
          <span key={a.order} className="whitespace-nowrap">
            {a.name}
            {a.corresponding && (
              <span className="ml-px font-semibold text-clay-600" title="通讯作者">
                {" "}
                ✉
              </span>
            )}
            {i < shown.length - 1 ? "、" : ""}
          </span>
        ))}
        {extra > 0 && <span className="italic text-(--fg-3)">&nbsp;等 {extra} 位</span>}
        <span aria-hidden className="mx-2.5 inline-block h-[3px] w-[3px] rounded-full bg-ink-300" />
        {paper.venueId && paper.venueName ? (
          <Link
            href={`/journals/${paper.venueId}`}
            className="font-serif font-medium italic text-(--link) underline decoration-clay-300 underline-offset-[3px] hover:text-clay-800 hover:decoration-clay-600"
          >
            {paper.venueName}
          </Link>
        ) : (
          paper.venueName && (
            <span className="font-serif italic text-ink-800">{paper.venueName}</span>
          )
        )}
        {paper.publicationYear != null && (
          <span className="tabular-nums text-(--fg-2)">&nbsp;· {paper.publicationYear}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <EvidenceBadge level={paper.evidenceLevel} />
        <div className="flex flex-wrap gap-2">
          {fullHref ? (
            <a className={btnPrimary} href={fullHref} target="_blank" rel="noopener noreferrer">
              去全文 {paper.isOa ? "· OA" : "· DOI"} <ExternalLink size={14} />
            </a>
          ) : (
            <button
              className={`${btnSecondary} cursor-not-allowed opacity-55`}
              type="button"
              disabled
            >
              全文链接不可用
            </button>
          )}
          <BookmarkButton />
        </div>
      </div>
    </header>
  );
}
