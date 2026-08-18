"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Tentang", href: "/about" },
  { label: "Kontak", href: "/about#kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bgy-gradient shadow-header">
      <div className="container mx-auto max-w-[1200px] px-4 flex items-center justify-between h-14 w-full">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-bold text-white">
          <img
            src="/guru-cibisd2.png"
            alt="BGY"
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/40 bg-white"
          />
          <span className="whitespace-nowrap">Bantu Guru Yuk | Media Belajar</span>
        </Link>

        <div className="relative flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-1.5 rounded-md text-white bg-black/10 border border-white/20 hover:bg-black/20 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="navbarMenu"
          >
            <Icon name={open ? "xmark" : "bars"} className="text-base" />
          </button>

          {/* Dropdown menu - compact, right-aligned */}
          <div
            id="navbarMenu"
            className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-50 transition-all duration-200 ease-out origin-top-right ${
              open
                ? "scale-100 opacity-100 pointer-events-auto"
                : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            <div className="py-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-ink dark:text-slate-200 hover:bg-primary-bg hover:text-primary-light transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
