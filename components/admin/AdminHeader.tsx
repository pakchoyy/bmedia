"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Icon from "../Icon";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Buka menu navigasi"
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Icon name="bars" className="text-xl text-ink" />
      </button>
      <h1 className="flex-1 font-bold text-primary text-lg truncate">
        Admin Bantu Guru Yuk
      </h1>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        <Icon name="log-out" className="text-sm" />
        {loggingOut ? "Keluar..." : "Logout"}
      </button>
    </header>
  );
}
