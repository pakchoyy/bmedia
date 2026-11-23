import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/guru/AuthForm";
import { getCurrentGuru, safeNext } from "@/lib/guru";

export const metadata: Metadata = { title: "Masuk Guru" };
export const dynamic = "force-dynamic";

export default async function MasukGuruPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next);
  if (await getCurrentGuru()) redirect(next);
  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-10">
      <AuthForm mode="masuk" next={next} />
    </div>
  );
}
