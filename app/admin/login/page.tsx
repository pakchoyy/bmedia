import type { Metadata } from "next";
import LoginSwitcher from "@/components/admin/LoginSwitcher";
import { canLoginWithPin } from "@/lib/admin-trust";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const hasPin = await canLoginWithPin().catch(() => false);
  return (
    <div className="min-h-screen bg-pagebg flex items-center justify-center p-4">
      <LoginSwitcher hasPin={hasPin} />
    </div>
  );
}
