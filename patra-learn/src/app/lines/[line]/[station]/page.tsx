// patra-learn/src/app/lines/[line]/[station]/page.tsx
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
