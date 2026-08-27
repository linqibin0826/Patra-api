import Link from "next/link";

/* 顶栏：左 logo+站名（回首页），右三个全局资源入口。56px 高、白底、底描边（画布规范）。 */
export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-6 border-b border-line bg-surface px-8">
      <Link href="/" className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden>
          <path d="M3 13 H23" stroke="#2E66C9" strokeWidth="4" strokeLinecap="round" />
          <path d="M13 3 V23" stroke="#D95B32" strokeWidth="4" strokeLinecap="round" />
          <circle cx="13" cy="13" r="4.5" fill="#fff" stroke="#22262C" strokeWidth="2.5" />
        </svg>
        <span className="text-lg font-black">Patra 学习站</span>
      </Link>
      <nav className="ml-auto flex items-center gap-5 text-sm text-slate">
        <Link href="/glossary" className="hover:text-ink">
          名词图鉴
        </Link>
        <Link href="/archive" className="hover:text-ink">
          事故档案馆
        </Link>
        <Link href="/cheatsheet" className="hover:text-ink">
          操作小抄
        </Link>
      </nav>
    </header>
  );
}
