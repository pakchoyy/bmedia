"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/", icon: "house" },
  { label: "Mabar Yuk", href: "/main", icon: "users" },
  { label: "Ruang Guru", href: "/guru", icon: "chalkboard-user" },
  { label: "Kirim Karya", href: "/submit", icon: "paper-plane" },
  { label: "Tentang & Saran", href: "/about", icon: "info" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Pintasan: ketuk logo 5x dalam 4 detik membuka halaman login admin (tetap wajib login)
  const taps = useRef({ n: 0, t: 0 });
  function onLogoClick(e: React.MouseEvent) {
    const now = Date.now();
    taps.current = now - taps.current.t > 4000 ? { n: 1, t: now } : { n: taps.current.n + 1, t: taps.current.t };
    if (taps.current.n >= 5) {
      e.preventDefault();
      taps.current = { n: 0, t: 0 };
      router.push("/admin/login");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
      <div className="container mx-auto max-w-[1200px] pl-5 pr-4 flex items-center justify-between h-14 w-full">
        <Link href="/" onClick={onLogoClick} className="flex items-center gap-2.5 font-display font-bold text-nb-ink dark:text-white">
          <img src="/logo-main-yuk.png" alt="" width={40} height={40} className="w-10 h-10 shrink-0" />
          <span className="whitespace-nowrap text-2xl leading-none">Main<span className="text-nb-orange">-yuk</span></span>
        </Link>

        <div className="relative flex items-center gap-2">
          <ThemeToggle />
          <button
            className="nb-sm nb-press w-11 h-11 flex items-center justify-center rounded-lg text-nb-ink bg-nb-yellow"
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
