import { sql } from "@/lib/db";
import UsulanList, { type UsulanRow } from "@/components/admin/UsulanList";

export const dynamic = "force-dynamic";

export default async function AdminUsulanPage() {
  const rows = (await sql`SELECT id, nama, kontak, jenis, pesan, dibaca, created_at FROM usulan ORDER BY dibaca, created_at DESC LIMIT 200`) as UsulanRow[];
  const baru = rows.filter((r) => !r.dibaca).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usulan Pengguna</h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{baru} belum dibaca · dikirim lewat halaman /usulan</p>
      </div>
      <UsulanList rows={rows.map((r) => ({ ...r, created_at: String(r.created_at) }))} />
    </div>
  );
}
