import { requireAdmin } from "@/lib/admin";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();
  return <AdminShell email={session.profile.email}>{children}</AdminShell>;
}
