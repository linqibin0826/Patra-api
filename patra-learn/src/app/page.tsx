// patra-learn/src/app/page.tsx
import Link from "next/link";
import { ContinueCard } from "@/components/continue-card";
import { MetroMap } from "@/components/metro-map";

const RESOURCES = [
  {
    eyebrow: "随手查",
    title: "名词图鉴",
    desc: "10 个角色，每个配一句 Java 类比",
    href: "/glossary",
  },
  {
    eyebrow: "听故事",
    title: "事故档案馆",
    desc: "6 次真实翻车，每条规则的来历",
    href: "/archive",
  },
  {
    eyebrow: "照着做",
    title: "操作小抄",
    desc: "回滚、巡检、升级，抄了就能用",
    href: "/cheatsheet",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-wide">把你的系统，一条线一条线学明白</h1>
        <p className="text-sm text-fog">
          三条线已通车，点任意站进入课程；打卡记录只存在你自己的浏览器里。
        </p>
      </header>
      <ContinueCard />
      <section className="rounded-2xl border border-line bg-surface p-6">
        <MetroMap />
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {RESOURCES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-5 hover:border-fog"
          >
            <span className="text-xs font-bold text-fog">{r.eyebrow}</span>
            <span className="text-lg font-black">{r.title}</span>
            <span className="text-sm text-slate">{r.desc}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
