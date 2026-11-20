"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bgy-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Mode terang" : "Mode gelap"}
      className="nb-sm nb-press w-11 h-11 flex items-center justify-center rounded-lg text-nb-ink dark:text-white bg-white dark:bg-slate-800"
    >
      <Icon name={dark ? "sun" : "moon"} className="text-lg" />
    </button>
  );
}
