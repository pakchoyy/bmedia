"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b-[3px] border-nb-ink h-14 flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Buka menu navigasi"
        className="lg:hidden w-10 h-10 rounded-xl bg-nb-yellow border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] inline-flex items-center justify-center"
      >
        <Icon name="bars" className="text-lg text-nb-ink" />
      </button>
      <h1 className="flex-1 font-display font-bold text-nb-ink dark:text-white text-lg truncate">
        Admin Main-yuk
      </h1>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-nb-pink text-nb-ink border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] text-sm font-extrabold active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
      >
        <Icon name="log-out" className="text-sm" />
        {loggingOut ? "Keluar..." : "Logout"}
      </button>
    </header>
  );
}
