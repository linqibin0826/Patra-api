import { notFound } from "next/navigation";
import { Footer } from "@/components/portal/Footer";
import { JournalDetailView } from "@/components/portal/journal-detail/JournalDetailView";
import { TopNav } from "@/components/portal/TopNav";
import { fetchVenueDetail } from "@/lib/portal-api/venues";

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await fetchVenueDetail(id); // 5xx/超时会 throw → 全局 error.tsx
  if (!venue) {
    notFound(); // 非数字 id 或 BE 404 → [id]/not-found.tsx
  }
  return (
    <>
      <TopNav />
      <main>
        <JournalDetailView venue={venue} />
      </main>
      <Footer />
    </>
  );
}
