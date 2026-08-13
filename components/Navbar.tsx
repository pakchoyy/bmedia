"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Koleksi Media", href: "/catalog" },
  { label: "Kategori", href: "/#categories" },
  { label: "Buat Game Sendiri", href: "/buat" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bgy-gradient shadow-header">
      <div className="container mx-auto max-w-[1200px] px-6 flex items-center justify-between h-12 w-full">
        <Link href="/" className="flex items-center gap-2 text-sm font-extrabold text-white">
          <Icon name="laptop-code" className="text-white text-lg" />
          Bantu Guru Yuk - Belajar
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-1 px-2.5 rounded-md text-white bg-black/10 border border-white/30"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "xmark" : "bars"} className="text-lg" />
          </button>
        </div>

        <ul
          className={`md:flex items-center gap-6 fixed md:static left-0 right-0 top-12 md:top-auto bg-white md:bg-transparent shadow-md md:shadow-none z-50 transition-all duration-300 ease-out ${
            open
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-4 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto"
          } flex-col md:flex-row p-4 md:p-0 md:pr-4`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block font-semibold text-sm text-ink md:text-white/90 hover:text-primary-light md:hover:text-white transition-colors py-1.5 md:py-0"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 md:mt-0">
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="inline-block bg-primary-light md:bg-white text-white md:text-primary font-semibold text-sm px-5 py-1.5 md:py-1 rounded-full md:rounded font-sans hover:bg-primary-bg hover:text-primary transition-transform hover:-translate-y-px"
            >
              Kirim Karya
            </Link>
          </li>
          <li className="mt-2 md:mt-0 md:ml-1">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}