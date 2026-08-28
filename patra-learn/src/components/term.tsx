import Link from "next/link";

/** 术语转 URL 锚点：小写、空格→连字符（glossary 页卡片 id 用同一函数，保证互链）。 */
export function termSlug(term: string): string {
  return term.toLowerCase().replace(/\s+/g, "-");
}

/* 正文术语：下划虚线，点击跳名词图鉴对应词条。 */
export function Term({ children }: { children: string }) {
  return (
    <Link
      href={`/glossary#${termSlug(children)}`}
      className="underline decoration-fog decoration-dashed underline-offset-4 hover:text-ink"
    >
      {children}
    </Link>
  );
}
