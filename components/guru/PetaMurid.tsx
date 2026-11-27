"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ff5d8f", "#4aa8ff", "#ffd23f", "#2ec4b6", "#ff7a1a", "#b79cff", "#8cf0b8", "#ff9f43"];
// Batas dunia Cari Soal Yuk (sama dengan game): x -44..44, z -34..34
const W = 88, H = 68;

/** Peta mini posisi murid untuk guru (Cari Soal Yuk). */
export default function PetaMurid({ code }: { code: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    const draw = (players: { name: string; x: number; z: number; f: number }[]) => {
      const c = ref.current; if (!c) return;
      const x = c.getContext("2d"); if (!x) return;
      const cw = c.width, ch = c.height, sx = (v: number) => ((v + W / 2) / W) * cw, sz = (v: number) => ((v + H / 2) / H) * ch;
      x.fillStyle = "#86cf6c"; x.fillRect(0, 0, cw, ch);
      x.fillStyle = "#d8d0bf"; x.fillRect(sx(-20), sz(-11), sx(20) - sx(-20), sz(15) - sz(-11));
      x.fillStyle = "#fff3d6"; x.strokeStyle = "#1b1a3a"; x.lineWidth = 2;
      [[0, -24, 30, 7], [-35, 0, 7, 22], [35, 0, 7, 22], [-22, 26, 14, 6], [22, 26, 14, 6]].forEach(([bx, bz, bw, bd]) => { x.fillRect(sx(bx - bw / 2), sz(bz - bd / 2), (bw / W) * cw, (bd / H) * ch); x.strokeRect(sx(bx - bw / 2), sz(bz - bd / 2), (bw / W) * cw, (bd / H) * ch); });
      x.font = "800 12px Nunito, sans-serif"; x.textAlign = "center";
      players.forEach((p, i) => {
        const px = sx(p.x), pz = sz(p.z);
        x.fillStyle = COLORS[i % COLORS.length]; x.beginPath(); x.arc(px, pz, 7, 0, Math.PI * 2); x.fill(); x.stroke();
        x.fillStyle = "#1b1a3a"; x.fillText(`${p.name} · ${p.f}`, px, pz - 11);
      });
    };
    const load = () => fetch(`/api/ruang/${code}/pos`, { cache: "no-store" }).then((r) => r.json()).then((d) => alive && draw(d.players || [])).catch(() => {});
    load(); const t = setInterval(load, 1500);
    return () => { alive = false; clearInterval(t); };
  }, [code]);
  return (
    <div className="mt-4">
      <p className="text-xs font-extrabold text-nb-ink dark:text-white mb-1">🗺️ Posisi murid (angka = kertas ditemukan)</p>
      <canvas ref={ref} width={440} height={340} className="w-full rounded-xl border-[3px] border-nb-ink bg-[#86cf6c]" />
    </div>
  );
}
