import { requireAdmin, getAllMediaForAdmin } from "@/lib/admin";
import SubmissionTable from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin();
  const media = await getAllMediaForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Submissions</h1>
      <SubmissionTable
        media={media}
        initialStatus={searchParams.status ?? "pending"}
      />
    </div>
  );
}
