"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "../Icon";

interface AdminSidebarProps {
  email: string | null;
  onNavigate?: () => void;
}

export default function AdminSidebar({ email, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: "Dashboard", icon: "gauge" },
    { href: "/admin/media", label: "Semua Media", icon: "book" },
    { href: "/admin/media/new", label: "Tambah Media", icon: "plus" },
    { href: "/admin/submissions", label: "Submission", icon: "clipboard" },
    { href: "/admin/tampilan", label: "Tampilan & Cover", icon: "photo-video" },
    { href: "/admin/usulan", label: "Usulan Pengguna", icon: "envelope" },
    { href: "/admin/web-belajar", label: "Web Belajar Lain", icon: "arrow-up-right-from-square" },
    { href: "/admin/statistik", label: "Statistik Guru", icon: "chart-simple" },
    { href: "/admin/password", label: "Keamanan & PIN", icon: "key" },
  ];

  const isActive = (item: (typeof items)[number]) => {
    if (item.href === "/admin") return pathname === "/admin";
    if (item.href === "/admin/media") {
      return pathname.startsWith("/admin/media") && pathname !== "/admin/media/new";
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r-[3px] border-nb-ink">
      <div className="p-5 border-b-[3px] border-nb-ink bg-nb-yellow">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <img src="/logo-main-yuk.png" alt="" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-display font-bold text-nb-ink text-lg leading-tight">
              Main-yuk
            </div>
            <div className="text-xs font-bold text-nb-ink/70">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-extrabold border-2 transition-colors ${
                active
                  ? "bg-nb-orange text-nb-ink border-nb-ink shadow-[3px_3px_0_#1b1a3a]"
                  : "border-transparent text-nb-ink dark:text-slate-200 hover:border-nb-ink hover:bg-nb-cream dark:hover:bg-slate-800"
              }`}
            >
              <Icon name={item.icon} className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t-[3px] border-nb-ink space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-500 truncate">{email}</p>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-extrabold text-nb-ink dark:text-slate-200 border-2 border-transparent hover:border-nb-ink hover:bg-nb-cream dark:hover:bg-slate-800"
        >
          <Icon name="house" className="text-lg" />
          Lihat Website
        </Link>
      </div>
    </div>
  );
}
