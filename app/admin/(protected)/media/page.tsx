import Link from "next/link";
import { requireAdmin, getAllMediaForAdmin } from "@/lib/admin";
import SubmissionTable from "@/components/admin/SubmissionTable";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin();
  const media = await getAllMediaForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">Semua Media</h1>
        <Link
          href="/admin/media/new"
          className="inline-flex items-center gap-2 bg-success text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          <Icon name="plus" />
          Tambah Media
        </Link>
      </div>
      <SubmissionTable
        media={media}
        initialStatus={searchParams.status ?? "semua"}
      />
    </div>
  );
}