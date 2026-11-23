import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import PinSettings from "@/components/admin/PinSettings";
import { getTrustedDevice } from "@/lib/admin-trust";
import { requireAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";

export const metadata = { title: "Keamanan" };
export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const admin = await requireAdmin();
  const rows = await sql`SELECT pin_hash IS NOT NULL AS active FROM admins WHERE id = ${admin.adminId} LIMIT 1`;
  const pinActive = !!(rows[0] as { active: boolean } | undefined)?.active;
  const dev = await getTrustedDevice();
  const deviceTrusted = !!dev && dev.adminId === admin.adminId;
  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-primary mb-6">Ganti Password</h2>
      <ChangePasswordForm />
      <PinSettings pinActive={pinActive} deviceTrusted={deviceTrusted} />
    </div>
  );
}
