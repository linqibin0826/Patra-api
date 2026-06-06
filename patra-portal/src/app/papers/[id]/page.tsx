import { notFound } from "next/navigation";
import { Footer } from "@/components/portal/Footer";
import { PublicationDetailView } from "@/components/portal/paper-detail/PublicationDetailView";
import { TopNav } from "@/components/portal/TopNav";
import { fetchPublicationDetail } from "@/lib/portal-api/publications";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = await fetchPublicationDetail(id); // 5xx/超时会 throw → 全局 error.tsx
  if (!paper) {
    notFound(); // 非数字 id 或 BE 404 → [id]/not-found.tsx
  }
  return (
    <>
      <TopNav />
      <main>
        <PublicationDetailView paper={paper} />
      </main>
      <Footer />
    </>
  );
}
