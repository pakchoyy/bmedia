import Link from "next/link";
import { requireAdmin, getAdminStats } from "@/lib/admin";
import AdminStats from "@/components/admin/AdminStats";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Dashboard</h1>

      <AdminStats stats={stats} />

      <div className="mt-8 bg-accent/10 border border-accent/30 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-accent text-lg">
              {stats.pending > 0
                ? `${stats.pending} submission menunggu review`
                : "Tidak ada submission yang menunggu review"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Periksa dan setujui karya guru agar tampil di website publik.
            </p>
          </div>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d97706] transition-colors"
          >
            <Icon name="clipboard" />
            Lihat Submission
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-ink mb-3">Panduan Singkat</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Buka menu <strong>Submissions</strong> untuk mereview karya.</li>
          <li>
            <strong>Approve</strong> → media langsung tampil di website publik.
          </li>
          <li>
            <strong>Reject</strong> → wajib mengisi alasan agar guru bisa
            memperbaiki.
          </li>
          <li>
            <strong>Edit</strong> untuk memperbaiki metadata karya jika ada
            kesalahan.
          </li>
        </ul>
      </div>
    </div>
  );
}
