import { notFound } from "next/navigation";
import { requireAdmin, getMediaForAdmin } from "@/lib/admin";
import SubmissionDetail from "@/components/admin/SubmissionDetail";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const media = await getMediaForAdmin(params.id);
  if (!media) notFound();

  return <SubmissionDetail media={media} />;
}
