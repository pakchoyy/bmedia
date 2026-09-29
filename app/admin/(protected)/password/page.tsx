import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata = { title: "Ganti Password" };

export default function PasswordPage() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-primary mb-6">Ganti Password</h2>
      <ChangePasswordForm />
    </div>
  );
}
