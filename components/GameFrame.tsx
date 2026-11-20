"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function GameFrame({ title, src }: { title: string; src: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      mq.removeEventListener("change", update);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  async function toggleFull() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await box.current?.requestFullscreen();
        // Kunci landscape (hanya jalan di layar penuh & browser yang mendukung)
        await (screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        }).lock?.("landscape");
      }
    } catch {
      /* tidak didukung: abaikan */
    }
  }

  return (
    <div ref={box} className="fixed inset-0 bg-slate-900" style={{ zIndex: 2147483000 }}>
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        allow="fullscreen; autoplay"
      />

      {!full && (
        <Link
          href="/"
          className="absolute left-2 bottom-2 z-10 rounded-full bg-black/55 text-white text-xs font-bold px-3 py-1.5"
        >
          ← BGY
        </Link>
      )}
      <button
        onClick={toggleFull}
        aria-label="Layar penuh"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/55 text-white text-sm w-9 h-9"
      >
        {full ? "🡼" : "⛶"}
      </button>

      {portrait && (
        <div className="absolute inset-0 z-20 bg-slate-900 text-white flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="text-6xl animate-pulse">🔄</div>
          <p className="text-xl font-extrabold">Putar HP kamu ke samping</p>
          <p className="text-sm opacity-75">Game ini dimainkan dalam mode landscape.</p>
        </div>
      )}
    </div>
  );
}
