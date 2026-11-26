"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function GameFrame({ title, src, portraitOk = false, slug, needsKeyboard = false }: { title: string; src: string; portraitOk?: boolean; slug?: string; needsKeyboard?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [portrait, setPortrait] = useState(false);
  const [full, setFull] = useState(false);
  const [intro, setIntro] = useState(true);
  const inRoom = /[?&]room=/.test(src);
  const [menu, setMenuRaw] = useState(false);
  const setMenu = (v: boolean | ((x: boolean) => boolean)) => setMenuRaw((prev) => { const nv = typeof v === 'function' ? v(prev) : v; if (prev && !nv) { try { frameRef.current?.contentWindow?.postMessage({ mainyuk: 'resume' }, '*'); } catch { /* abaikan */ } } return nv; });
  const [dim, setDim] = useState(false);
  const [run, setRun] = useState(0); // naik = muat ulang game
  const [touch, setTouch] = useState(false);
  const external = /^https?:/.test(src);
  const frame = frameRef;
  // Game boleh menaruh tombol ☰ di header-nya sendiri (postMessage), supaya tidak menutupi area main
  const [headerMenu, setHeaderMenu] = useState(false);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const d = e.data as { mainyuk?: string } | null;
      if (d?.mainyuk === "menu-in-header") setHeaderMenu(true);
      if (d?.mainyuk === "open-menu") { setIntro(false); setMenu(true); }
      if (d?.mainyuk === "home") window.location.assign("/");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
    const update = () => setPortrait(!portraitOk && mq.matches);
    update();
    mq.addEventListener("change", update);
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    try { if (sessionStorage.getItem("gf_intro_" + slug) === "1") setIntro(false); } catch { /* abaikan */ }
    return () => {
      mq.removeEventListener("change", update);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [portraitOk, slug]);

  // Tombol menu mengecil otomatis bila tidak disentuh
  useEffect(() => {
    if (menu || intro) { setDim(false); return; }
    const t = setTimeout(() => setDim(true), 3000);
    return () => clearTimeout(t);
  }, [menu, intro, dim]);

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

  async function goFull() {
    try {
      if (!document.fullscreenElement) {
        await box.current?.requestFullscreen();
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.(portraitOk ? "natural" : "landscape");
      }
    } catch { /* tidak didukung: game tetap memenuhi jendela */ }
  }
  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await goFull();
    } catch { /* abaikan */ }
  }
  function begin(fullscreen: boolean) {
    try { sessionStorage.setItem("gf_intro_" + slug, "1"); } catch { /* abaikan */ }
    setIntro(false);
    if (fullscreen) void goFull();
  }

  const btn = "inline-flex items-center gap-1.5 rounded-xl border-[3px] border-[#1b1a3a] shadow-[3px_3px_0_#1b1a3a] font-extrabold text-[#1b1a3a] text-sm px-3 py-1.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  const item = "flex items-center gap-2 w-full min-h-[44px] rounded-xl border-[3px] border-[#1b1a3a] bg-white px-3 font-extrabold text-[#1b1a3a] text-sm text-left active:translate-x-[1px] active:translate-y-[1px]";

  return (
    <div ref={box} className="fixed inset-0 bg-slate-900" style={{ zIndex: 2147483000 }}>
      <iframe ref={frame} key={run} src={src} title={title} className="w-full h-full border-0" allow="fullscreen; autoplay" />

      {/* Satu tombol menu di tepi kiri-tengah: tidak menutupi tombol jawaban di bawah */}
      {!intro && (
        <div className={headerMenu ? "absolute right-2 top-14 z-10" : "absolute left-1.5 top-[36%] -translate-y-1/2 z-10"}>
          {!headerMenu && <button
            onClick={() => setMenu((v) => !v)}
            aria-label="Menu game"
            aria-expanded={menu}
            className={`grid place-items-center w-11 h-11 rounded-full border-[3px] border-[#1b1a3a] bg-[#ffd23f] shadow-[2px_2px_0_#1b1a3a] text-lg font-black text-[#1b1a3a] transition-opacity ${dim && !menu ? "opacity-40" : "opacity-95"}`}
            onPointerDown={() => setDim(false)}
          >
            {menu ? "✕" : "☰"}
          </button>}
          {menu && (
            <div role="menu" className={`absolute ${headerMenu ? "right-0 top-0" : "left-0 top-14"} w-52 rounded-2xl border-[3px] border-[#1b1a3a] bg-[#fff6dc] p-2 shadow-[4px_4px_0_#1b1a3a] grid gap-1.5`}>
              <button role="menuitem" className={item} onClick={() => setMenu(false)}>▶ Lanjut main</button>
              <button role="menuitem" className={item} onClick={() => { setMenu(false); setRun((n) => n + 1); }}>🔄 Main ulang</button>
              <Link role="menuitem" href={slug ? `/?lihat=${slug}` : "/game"} className={item}>◀ Kembali</Link>
              <button role="menuitem" className={item} onClick={() => { setMenu(false); void toggleFull(); }}>{full ? "↙ Keluar layar penuh" : "⛶ Layar penuh"}</button>
              {external && <a role="menuitem" href={src} target="_blank" rel="noopener" className={item}>↗ Buka di tab baru</a>}
              <Link role="menuitem" href="/" className={item}>🏠 Beranda</Link>
            </div>
          )}
        </div>
      )}

      {intro && (
        <div className="absolute inset-0 z-30 bg-slate-900/90 text-white flex flex-col items-center justify-center gap-4 text-center p-6">
          <h1 className="text-3xl sm:text-4xl font-black">{title}</h1>
          {needsKeyboard && (
            <p className={`max-w-md rounded-2xl border-[3px] border-[#1b1a3a] px-4 py-3 text-sm font-extrabold text-[#1b1a3a] ${touch ? "bg-[#ff9aa8]" : "bg-[#ffd23f]"}`}>
              ⌨️ Game ini dimainkan dengan keyboard. Gunakan laptop atau komputer.
              {touch && <span className="block mt-1">Layar ini sepertinya sentuh saja. Papan ketik belum tentu muncul dengan baik.</span>}
            </p>
          )}
          <button onClick={() => begin(true)} className={`${btn} bg-[#22c55e] text-lg px-8 py-3 min-h-[52px]`}>{inRoom ? "▶ MASUK RUANG (LAYAR PENUH)" : "▶ MAIN (LAYAR PENUH)"}</button>
          <button onClick={() => begin(false)} className="underline text-sm font-bold min-h-[44px] px-3">{inRoom ? "Masuk tanpa layar penuh" : "Main tanpa layar penuh"}</button>
          {!inRoom && <Link href={slug ? `/?lihat=${slug}` : "/game"} className="underline text-xs font-bold opacity-80 min-h-[44px] grid place-items-center px-3">◀ Kembali</Link>}
        </div>
      )}

      {portrait && (
        <div className="absolute inset-0 z-40 bg-slate-900 text-white flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="text-6xl animate-pulse">🔄</div>
          <p className="text-xl font-extrabold">Putar HP kamu ke samping</p>
          <p className="text-sm opacity-75">Game ini dimainkan dalam mode landscape.</p>
          <Link href="/" className={`${btn} bg-[#ffd23f]`}>🏠 Beranda</Link>
        </div>
      )}
    </div>
  );
}
