"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Media Belajar", href: "/catalog" },
  { label: "Kategori", href: "/#categories" },
  { label: "Buat Game", href: "/buat" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bgy-gradient shadow-header">
      <div className="container mx-auto max-w-[1200px] px-6 flex items-center justify-between h-14 w-full">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-bold text-white">
          <Icon name="laptop-code" className="text-white text-xl" />
          <span className="max-sm:hidden">Bantu Guru Yuk</span>
        </Link>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-md text-white bg-black/10 border border-white/30 hover:bg-black/20 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "xmark" : "bars"} className="text-lg" />
          </button>
        </div>

        <ul
          className={`md:flex items-center gap-8 fixed md:static left-0 right-0 top-14 md:top-auto bg-white dark:bg-slate-900 md:bg-transparent shadow-lg md:shadow-none z-50 transition-all duration-300 ease-out ${
            open
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-4 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto"
          } flex-col md:flex-row p-6 md:p-0`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block font-semibold text-base text-ink dark:text-slate-200 md:text-white/90 hover:text-primary-light md:hover:text-white transition-colors py-2 md:py-0"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="md:hidden pt-2 border-t border-gray-200 dark:border-slate-700 mt-2">
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="block font-semibold text-base text-ink dark:text-slate-200 hover:text-primary-light transition-colors py-2"
            >
              Kirim Karya
            </Link>
          </li>
          <li className="hidden md:block">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}