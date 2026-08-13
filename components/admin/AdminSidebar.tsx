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
    { href: "/admin/submissions", label: "Submissions", icon: "clipboard" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <Icon name="laptop-code" className="text-primary-light text-xl" />
          <div>
            <div className="font-extrabold text-primary text-sm leading-tight">
              Bantu Guru Yuk
            </div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary-light/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon name={item.icon} className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-1">
        <p className="px-4 text-xs text-gray-400 truncate">{email}</p>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Icon name="house" className="text-lg" />
          Lihat Website
        </Link>
      </div>
    </div>
  );
}
