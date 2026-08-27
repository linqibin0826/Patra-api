import type { Metadata } from "next";
import { GlossaryWall } from "@/components/glossary-wall";

export const metadata: Metadata = { title: "名词图鉴 · Patra 学习站" };

export default function GlossaryPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-baseline gap-4">
        <h1 className="text-3xl font-black tracking-wide">名词图鉴</h1>
        <span className="text-sm text-fog">
          每个词配一句 Java 世界的类比 · 文章里点到名词都会跳到这里
        </span>
      </header>
      <GlossaryWall />
    </main>
  );
}
