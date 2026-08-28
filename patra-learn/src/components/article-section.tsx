/* 课程正文小节：站牌黑小标题 + 正文容器。 */
export function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-black tracking-wide">{title}</h2>
      <div className="flex flex-col gap-3 leading-7 text-slate">{children}</div>
    </section>
  );
}
