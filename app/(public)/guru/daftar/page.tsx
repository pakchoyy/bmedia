import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/guru/AuthForm";
import { getCurrentGuru } from "@/lib/guru";

export const metadata: Metadata = { title: "Daftar Guru" };
export const dynamic = "force-dynamic";

export default async function DaftarGuruPage() {
  if (await getCurrentGuru()) redirect("/guru");
  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-10">
      <AuthForm mode="daftar" />
    </div>
  );
}
