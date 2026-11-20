"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/", icon: "house" },
  { label: "Katalog", href: "/catalog", icon: "magnifying-glass" },
  { label: "Masuk Kelas", href: "/main", icon: "gamepad" },
  { label: "Ruang Guru", href: "/guru", icon: "chalkboard-user" },
  { label: "Kirim Karya", href: "/submit", icon: "paper-plane" },
  { label: "Tentang", href: "/about", icon: "info" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
      <div className="container mx-auto max-w-[1200px] pl-5 pr-4 flex items-center justify-between h-14 w-full">
        <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-nb-ink dark:text-white">
          <img
            src="/guru-cibisd2.png"
            alt="BGY"
            className="w-9 h-9 rounded-full object-cover shrink-0 nb-flat bg-white"
          />
          <span className="whitespace-nowrap text-[15px] sm:text-base">Bantu Guru Yuk <span className="max-sm:hidden text-nb-orange">· Media Belajar</span></span>
        </Link>

        <div className="relative flex items-center gap-2">
          <ThemeToggle />
          <button
            className="nb-sm nb-press w-9 h-9 flex items-center justify-center rounded-lg text-nb-ink bg-nb-yellow"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="navbarMenu"
          >
            <Icon name={open ? "xmark" : "bars"} className="text-base" />
          </button>

          {/* Dropdown menu */}
          <div
            id="navbarMenu"
            className={`nb absolute right-0 top-full mt-3 w-60 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl z-50 transition-all duration-200 ease-out origin-top-right ${
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
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-nb-ink dark:text-slate-200 hover:bg-nb-yellow/40 transition-colors"
                >
                  <Icon name={l.icon} className="w-4 text-nb-orange" />
                  {l.label}
                </Link>
              ))}
              <div data-bgy-menu="" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
