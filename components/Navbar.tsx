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

const EKOSISTEM_URL = "https://bantuguruyuk.web.id";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bgy-gradient shadow-header">
      <div className="container mx-auto max-w-[1200px] px-4 flex items-center justify-between h-14 w-full">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-bold text-white">
          <Icon name="laptop-code" className="text-white text-xl shrink-0" />
          <span className="whitespace-nowrap">Bantu Guru Yuk | Media Belajar</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="md:hidden p-2 rounded-md text-white bg-black/10 border border-white/30 hover:bg-black/20 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "xmark" : "bars"} className="text-lg" />
          </button>
        </div>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block font-semibold text-base text-white/90 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={EKOSISTEM_URL}
              target="_blank"
              rel="noreferrer"
              className="block font-semibold text-base text-white/90 hover:text-white transition-colors"
            >
              bantuguruyuk.web.id
            </a>
          </li>
        </ul>

        <div
          className={`md:hidden fixed left-0 right-0 top-14 bg-white dark:bg-slate-900 shadow-lg z-50 transition-all duration-300 ease-out ${
            open
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-4 opacity-0 pointer-events-none"
          } p-6`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block font-semibold text-base text-ink dark:text-slate-200 hover:text-primary-light transition-colors py-2"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={EKOSISTEM_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="block font-semibold text-base text-ink dark:text-slate-200 hover:text-primary-light transition-colors py-2"
          >
            bantuguruyuk.web.id
          </a>
        </div>
      </div>
    </nav>
  );
}
