"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

const links = [
  { label: "Home", href: "/" },
  { label: "Koleksi Media", href: "/catalog" },
  { label: "Kategori", href: "/#categories" },
  { label: "Buat Game Sendiri", href: "/buat" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bgy-gradient shadow-header h-12 flex items-center">
      <div className="container mx-auto max-w-[1200px] px-6 flex items-center justify-between h-full w-full">
        <Link href="/" className="flex items-center gap-2 text-sm font-extrabold text-white">
          <Icon name="laptop-code" className="text-white text-lg" />
          Bantu Guru Yuk - Belajar
        </Link>

        <button
          className="md:hidden text-white bg-black/10 p-1 px-2.5 rounded-md border border-white/30"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <Icon name={open ? "xmark" : "bars"} className="text-lg" />
        </button>

        <ul
          className={`${
            open ? "flex" : "hidden"
          } md:flex absolute md:static top-12 left-0 w-full md:w-auto bg-white md:bg-transparent flex-col md:flex-row items-center gap-6 md:gap-6 p-4 md:p-0 shadow-md md:shadow-none z-50`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-semibold text-sm text-ink md:text-white/90 hover:text-primary-light md:hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="inline-block bg-primary-light md:bg-white text-white md:text-primary font-semibold text-sm px-5 py-1.5 md:py-1 rounded-full md:rounded font-sans hover:bg-primary-bg hover:text-primary transition-transform hover:-translate-y-px"
            >
              Kirim Karya
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
