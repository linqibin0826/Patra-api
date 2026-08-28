/* 行内代码：mist 底圆角 mono 小字（课程正文通用）。 */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}
