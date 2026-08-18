import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminMediaForm from "@/components/admin/AdminMediaForm";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminMediaNewPage() {
  await requireAdmin();

  return (
    <div>
      <Link
        href="/admin/media"
        className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-4 hover:underline"
      >
        <Icon name="arrow-left" /> Kembali ke Semua Media
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-1">
        Tambah Media Baru
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Media yang ditambahkan oleh admin langsung berstatus{" "}
        <strong>approved</strong> dan tampil di katalog publik.
      </p>

      <AdminMediaForm mode="create" />
    </div>
  );
}