// patra-learn/src/app/lines/[line]/[station]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article-layout";
import { ARTICLES } from "@/content/articles";
import type { StationRef } from "@/content/types";
import { getStation, openStationRefs } from "@/lib/content";

export function generateStaticParams() {
  return openStationRefs().map((ref) => {
    const [line, station] = ref.split("/");
    return { line, station };
  });
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ line: string; station: string }>;
}): Promise<Metadata> {
  const { line: lineId, station: stationId } = await params;
  const hit = getStation(`${lineId}/${stationId}`);
  if (!hit) return {};
  return {
    title: `${hit.station.name} · Patra 学习站`,
    description: hit.station.summary,
  };
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ line: string; station: string }>;
}) {
  const { line: lineId, station: stationId } = await params;
  const ref = `${lineId}/${stationId}` as StationRef;
  const hit = getStation(ref);
  const Article = ARTICLES[ref];
  if (!hit || !Article) notFound();
  return (
    <ArticleLayout line={hit.line} station={hit.station} stationRef={ref}>
      <Article />
    </ArticleLayout>
  );
}
