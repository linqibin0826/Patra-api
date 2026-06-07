import Image from "next/image";
import Link from "next/link";

/**
 * 期刊浏览页标题区（静态 RSC）。
 * 面包屑 + eyebrow + h1 + 副文案。
 */
export function JournalsBrowseHead() {
  return (
    <div className="border-b border-(--border-default) pb-6">
      {/* 面包屑 */}
      <nav
        aria-label="面包屑"
        className="mb-4 flex items-center gap-1.5 text-xs text-[var(--fg-3)]"
      >
        <Link href="/" className="hover:text-ink-700 transition-colors">
          Patra
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">期刊浏览</span>
      </nav>

      {/* eyebrow */}
      <span className="inline-flex items-center gap-1.5 font-sans text-2xs font-semibold uppercase tracking-caps text-[var(--fg-3)]">
        <Image src="/brand/patra-mark.svg" alt="" aria-hidden width={4} height={14} />
        按期刊浏览
      </span>

      {/* h1 */}
      <h1 className="mt-1 font-serif text-3xl font-medium leading-tight tracking-tight text-ink-900">
        浏览全部期刊
      </h1>

      {/* 副文案 */}
      <p className="mt-2 max-w-xl text-sm text-[var(--fg-3)]">
        Patra 追踪的同行评审期刊——按刊名检索，按影响因子 / 中科院分区 / 被引排序，按学科与分区收敛。
      </p>
    </div>
  );
}
