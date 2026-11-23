"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Muat ulang data server secara berkala (untuk papan peringkat di layar kelas). */
export default function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
