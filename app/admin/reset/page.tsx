import type { Metadata } from "next";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Atur Password Baru",
  robots: { index: false, follow: false },
};

export default function AdminResetPage() {
  return (
    <div className="min-h-screen bg-pagebg flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}
