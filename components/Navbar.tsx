"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/", icon: "house" },
  { label: "Katalog", href: "/catalog", icon: "magnifying-glass" },
  { label: "Kirim Karya", href: "/submit", icon: "paper-plane" },
  { label: "Tentang & Kontak", href: "/about", icon: "info" },
];

const EKOSISTEM_URL = "https://bantuguruyuk.web.id";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 shadow-header" style={{ background: "var(--grad)" }}>
        <div className="container mx-auto max-w-[1200px] px-4 flex items-center justify-between h-[60px] w-full">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <img
              src="/guru-cibisd2.png"
              alt="BGY"
              className="w-9 h-9 rounded-[10px] object-cover shrink-0"
            />
            <span
              className="font-bold text-white text-[1rem] whitespace-nowrap overflow-hidden text-ellipsis leading-tight"
            >
              BGY | Media Belajar
            </span>
          </Link>

          {/* Actions */}
          <div className="relative flex items-center gap-2">
            <ThemeToggle />
            <button
              className="h-10 min-w-10 rounded-[10px] border border-white/30 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="navbarMenu"
            >
              <Icon name={open ? "xmark" : "bars"} size={18} />
            </button>

            {/* Dropdown 280px per DESIGN-BGY */}
            {open && (
              <div
                id="navbarMenu"
                className="absolute right-0 top-[calc(100%+8px)] w-[280px] max-w-[calc(100vw-24px)] bg-[var(--card-bg,#fff)] dark:bg-slate-900 rounded-[12px] shadow-lg border border-[var(--border,#e2e8f0)] dark:border-slate-800 z-50 overflow-y-auto max-h-[calc(100vh-90px)]"
              >
                <div className="py-2">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 h-10 text-[.83rem] font-semibold text-[var(--text,#1e293b)] dark:text-slate-200 hover:bg-primary-bg hover:text-primary-light transition-colors"
                    >
                      <Icon name={l.icon} size={16} className="text-primary-light shrink-0" />
                      {l.label}
                    </Link>
                  ))}

                  <div className="border-t border-[var(--border,#e2e8f0)] dark:border-slate-800 my-1" />

                  {/* data-bgy-menu: diisi bgy-info.js */}
                  <div data-bgy-menu />

                  <a
                    href={EKOSISTEM_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 h-10 text-[.83rem] font-semibold text-[var(--text,#1e293b)] dark:text-slate-200 hover:bg-primary-bg hover:text-primary-light transition-colors"
                  >
                    <Icon name="arrow-up-right-from-square" size={16} className="text-primary-light shrink-0" />
                    Semua Tools BGY
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay tutup menu saat klik luar */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
