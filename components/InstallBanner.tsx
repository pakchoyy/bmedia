"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Daftar SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    // Cek sudah pernah dismiss dalam 24 jam
    const dismissed = localStorage.getItem("bgy-install-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 86400000) return;

    // Cek sudah standalone (sudah terinstall)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("bgy-install-dismissed", String(Date.now()));
    } catch {}
  };

  if (!show) return null;

  return (
    <div
      id="installPopup"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[500] w-[calc(100%-32px)] max-w-sm
        bg-[var(--card-bg,#fff)] dark:bg-slate-900 border border-[var(--border)] dark:border-slate-700
        rounded-[12px] shadow-[var(--shadow-lg)] px-4 py-3 flex items-center gap-3"
      role="dialog"
      aria-label="Install aplikasi BGY"
    >
      <img src="/guru-cibisd2.png" alt="BGY" className="w-10 h-10 rounded-[10px] shrink-0 object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[.83rem] text-[var(--text)] dark:text-slate-100 leading-tight">
          Install BGY Media Belajar
        </div>
        <div className="text-[.75rem] text-[var(--text-light)] mt-0.5">
          Buka lebih cepat, bisa offline
        </div>
      </div>
      <button
        onClick={install}
        className="h-9 px-3 rounded-[10px] text-white text-[.78rem] font-bold shrink-0 flex items-center gap-1.5"
        style={{ background: "var(--grad)" }}
      >
        <Download size={14} />
        Install
      </button>
      <button
        onClick={dismiss}
        className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[var(--text-light)] hover:bg-[var(--bg)] transition-colors shrink-0"
        aria-label="Tutup"
      >
        <X size={16} />
      </button>
    </div>
  );
}
