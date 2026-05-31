import { ExploreFeed } from "@/components/portal/explore-feed";
import { Footer } from "@/components/portal/Footer";
import { HeroWithToast } from "@/components/portal/HeroWithToast";
import { Journals } from "@/components/portal/Journals";
import { TopicCloud } from "@/components/portal/TopicCloud";
import { TopNav } from "@/components/portal/TopNav";
import type { FeedTab } from "@/types/portal";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const safeTab: FeedTab = tab === "cited" ? "cited" : "recent";
  return (
    <>
      <TopNav />
      <main>
        <HeroWithToast />
        <TopicCloud />
        <Journals />
        <ExploreFeed tab={safeTab} />
      </main>
      <Footer />
    </>
  );
}
