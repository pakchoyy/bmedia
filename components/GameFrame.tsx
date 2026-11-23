"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function GameFrame({ title, src, portraitOk = false, slug }: { title: string; src: string; portraitOk?: boolean; slug?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
    const update = () => setPortrait(!portraitOk && mq.matches);
    update();
    mq.addEventListener("change", update);
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      mq.removeEventListener("change", update);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [portraitOk]);

  // Catat "dimainkan" sekali saat game dibuka
  useEffect(() => {
    if (!slug) return;
    try {
      const k = `gp_${slug}`, last = Number(sessionStorage.getItem(k) || 0);
      if (Date.now() - last < 10 * 60 * 1000) return; // sudah dihitung di tab ini
      sessionStorage.setItem(k, String(Date.now()));
    } catch { /* sessionStorage tidak tersedia: tetap kirim, server membatasi */ }
    fetch(`/api/game-play/${slug}`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);

  async function toggleFull() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await box.current?.requestFullscreen();
        // Kunci landscape (hanya jalan di layar penuh & browser yang mendukung)
        await (screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        }).lock?.(portraitOk ? "natural" : "landscape");
      }
    } catch {
      /* tidak didukung: abaikan */
    }
  }

  const btn = "inline-flex items-center gap-1.5 rounded-xl border-[3px] border-[#1b1a3a] shadow-[3px_3px_0_#1b1a3a] font-extrabold text-[#1b1a3a] text-sm px-3 py-1.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

  return (
    <div ref={box} className="fixed inset-0 bg-slate-900" style={{ zIndex: 2147483000 }}>
      <iframe src={src} title={title} className="w-full h-full border-0" allow="fullscreen; autoplay" />

      {/* Kontrol: kiri bawah agar tidak menutupi skor/HUD game */}
      <div className="absolute left-2 bottom-2 z-10 flex gap-2">
        {!full && (
          <Link href="/" className={`${btn} bg-[#ffd23f]`} aria-label="Kembali ke beranda Main-yuk">
            <span aria-hidden="true">🏠</span> Beranda
          </Link>
        )}
        <button onClick={toggleFull} className={`${btn} bg-white`} aria-label={full ? "Keluar layar penuh" : "Layar penuh"}>
          <span aria-hidden="true">{full ? "↙" : "⛶"}</span> {full ? "Keluar" : "Layar penuh"}
        </button>
      </div>

      {portrait && (
        <div className="absolute inset-0 z-20 bg-slate-900 text-white flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="text-6xl animate-pulse">🔄</div>
          <p className="text-xl font-extrabold">Putar HP kamu ke samping</p>
          <p className="text-sm opacity-75">Game ini dimainkan dalam mode landscape.</p>
          <Link href="/" className={`${btn} bg-[#ffd23f]`}>🏠 Beranda</Link>
        </div>
      )}
    </div>
  );
}
