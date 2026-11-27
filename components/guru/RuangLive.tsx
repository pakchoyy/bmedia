"use client";

import PetaMurid from "./PetaMurid";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

interface Player { id: string; name: string; score: number; caught: number; quiz_right: number; quiz_wrong: number; finished: boolean }
interface Live {
  code: string; status: "lobby" | "playing" | "finished"; duration: number; quizEvery: number;
  serverNow: number; startsAt: number | null; endsAt: number | null; players: Player[];
}

export default function RuangLive({ roomId, code, setId, title, game = "kupu-kupu" }: { game?: string; roomId: string; code: string; setId: string; title: string }) {
  const [live, setLive] = useState<Live | null>(null);
  const [offset, setOffset] = useState(0);
  const [tick, setTick] = useState(0);
  const [qr, setQr] = useState("");
  const cari = game === "cari-soal";
  const [duration, setDuration] = useState(cari ? 600 : 90);
  const [quizEvery, setQuizEvery] = useState(cari ? 1 : 3);
  const [perPaper, setPerPaper] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const joinRef = useRef("");

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/guru/ruang/${roomId}`, { cache: "no-store" });
      if (!r.ok) return;
      const d: Live = await r.json();
      setOffset(d.serverNow - Date.now());
      setLive(d);
    } catch { /* abaikan, coba lagi di putaran berikutnya */ }
  }, [roomId]);

  // Polling: 2,5 dtk saat lobi/bermain, berhenti saat selesai
  useEffect(() => {
    load();
    const t = setInterval(() => { if (live?.status !== "finished") load(); }, 2500);
    return () => clearInterval(t);
  }, [load, live?.status]);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 500); return () => clearInterval(t); }, []);

  useEffect(() => {
    joinRef.current = `${window.location.origin}/ruang/${code}`;
    QRCode.toDataURL(joinRef.current, { margin: 1, width: 360, color: { dark: "#1b1a3a", light: "#ffffff" } }).then(setQr).catch(() => setQr(""));
  }, [code]);

  async function post(path: string, body?: unknown) {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/guru/ruang/${roomId}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setErr(d.error ?? "Gagal.");
      await load();
    } finally { setBusy(false); }
  }

  const now = Date.now() + offset; void tick;
  const status = live?.status ?? "lobby";
  const players = live?.players ?? [];
  const toStart = live?.startsAt ? Math.ceil((live.startsAt - now) / 1000) : 0;
  const remain = live?.endsAt ? Math.max(0, Math.ceil((live.endsAt - now) / 1000)) : 0;
  const maxScore = Math.max(1, ...players.map((p) => p.score));

  return (
    <div className="container mx-auto max-w-[1100px] px-4 py-6">
      <Link href={`/guru/set/${setId}`} className="text-sm text-gray-500 hover:text-nb-orange">&larr; Kembali ke set soal</Link>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-5">
        <div>
          <p className="text-sm text-gray-500">Mabar Online</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-nb-ink dark:text-white">{title}</h1>
        </div>
        <span className={`nb-sm rounded-full px-3 py-1 text-sm font-extrabold text-nb-ink ${status === "lobby" ? "bg-nb-yellow" : status === "playing" ? "bg-nb-mint" : "bg-nb-pink"}`}>
          {status === "lobby" ? "Menunggu murid" : status === "playing" ? (toStart > 0 ? `Mulai ${toStart}…` : remain > 0 ? `Berlangsung · ${remain} dtk` : "Menghitung hasil…") : "Selesai"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Kode masuk */}
        <aside className="nb rounded-2xl bg-white dark:bg-slate-900 p-5 text-center h-fit">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Kode ruang</p>
          <div className="font-mono text-5xl font-extrabold tracking-[0.2em] text-nb-ink dark:text-white mt-1" aria-label={`Kode ruang ${code.split("").join(" ")}`}>{code}</div>
          {qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt={`QR ruang ${code}`} className="mx-auto mt-3 w-44 h-44 rounded-lg border-2 border-nb-ink" />}
          <p className="text-xs text-gray-500 mt-2">Murid buka <b>Mabar Yuk</b> lalu ketik kode ini, atau scan QR.</p>

          {status === "lobby" && (
            <div className="mt-4 space-y-3 text-left">
              <label className="block text-xs font-bold">Lama bermain
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="nb-flat w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-sm">
                  {(cari ? [300, 600, 900] : [60, 90, 120, 180]).map((d) => <option key={d} value={d}>{d >= 300 ? `${d / 60} menit` : `${d} detik`}</option>)}
                </select>
              </label>
              {cari ? (
                <label className="block text-xs font-bold">Cara menjawab
                  <select value={quizEvery} onChange={(e) => setQuizEvery(Number(e.target.value))} className="nb-flat w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-sm">
                    <option value={1}>Jawab langsung di game (dikoreksi otomatis)</option>
                    <option value={0}>Murid mencatat di kertas, guru mengoreksi</option>
                  </select>
                </label>
              ) : null}
              {cari ? (
                <label className="block text-xs font-bold">Soal per kertas
                  <select value={perPaper} onChange={(e) => setPerPaper(Number(e.target.value))} className="nb-flat w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-sm">
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} soal di setiap kertas</option>)}
                  </select>
                </label>
              ) : (
              <label className="block text-xs font-bold">Soal muncul tiap
                <select value={quizEvery} onChange={(e) => setQuizEvery(Number(e.target.value))} className="nb-flat w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-sm">
                  {[2, 3, 5].map((d) => <option key={d} value={d}>{d} tangkapan</option>)}
                </select>
              </label>
              )}
              <button disabled={busy || players.length === 0} onClick={() => post("mulai", { duration, quizEvery: cari ? perPaper * 10 + quizEvery : quizEvery })}
                className="w-full nb nb-press bg-nb-orange text-nb-ink rounded-xl py-3 font-extrabold disabled:opacity-50">
                ▶ Mulai ({players.length} murid)
              </button>
            </div>
          )}
          {status === "playing" && cari && <PetaMurid code={code} />}
          {status === "playing" && (
            <button disabled={busy} onClick={() => confirm("Hentikan permainan sekarang?") && post("selesai")}
              className="w-full mt-4 nb-sm nb-press bg-white text-nb-ink rounded-xl py-2.5 font-extrabold">⏹ Hentikan sekarang</button>
          )}
          {status === "lobby" && (
            <button disabled={busy} onClick={() => confirm("Tutup ruang ini?") && post("selesai")}
              className="w-full mt-2 text-xs font-bold text-gray-500 underline">Tutup ruang</button>
          )}
          {status === "finished" && (
            <div className="mt-4 grid gap-2">
              <Link href={`/guru/set/${setId}/hasil`} className="nb-sm nb-press bg-nb-mint text-nb-ink rounded-xl py-2.5 font-extrabold block">📊 Lihat di Hasil Murid</Link>
              <Link href={`/guru/set/${setId}`} className="nb-sm nb-press bg-nb-yellow text-nb-ink rounded-xl py-2.5 font-extrabold block">Kembali</Link>
            </div>
          )}
          {err && <p role="alert" className="text-sm text-danger mt-3">{err}</p>}
        </aside>

        {/* Daftar murid / papan skor */}
        <section className="nb rounded-2xl bg-white dark:bg-slate-900 p-4">
          <h2 className="font-display font-bold text-xl text-nb-ink dark:text-white mb-3">
            {status === "lobby" ? `Murid bergabung (${players.length})` : status === "playing" ? "Papan skor langsung" : "Hasil akhir"}
          </h2>
          {players.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Belum ada murid. Bagikan kode di samping.</p>
          ) : status === "lobby" ? (
            <ul className="flex flex-wrap gap-2">
              {players.map((p) => (
                <li key={p.id} className="nb-flat rounded-full bg-nb-yellow/40 pl-3 pr-1 py-1 text-sm font-bold text-nb-ink dark:text-white flex items-center gap-1">
                  {p.name}
                  <button aria-label={`Keluarkan ${p.name}`} onClick={() => post("keluarkan", { pid: p.id })} className="w-6 h-6 rounded-full hover:bg-white/70 text-xs">✕</button>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="space-y-2">
              {players.map((p, i) => (
                <li key={p.id} className="relative overflow-hidden nb-flat rounded-xl">
                  <div className="absolute inset-y-0 left-0 bg-nb-yellow/60 transition-all duration-700" style={{ width: `${(p.score / maxScore) * 100}%` }} />
                  <div className="relative flex items-center gap-3 px-3 py-2 text-nb-ink dark:text-white">
                    <span className="font-extrabold w-6">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
                    <span className="font-bold flex-1 truncate">{p.name}</span>
                    <span className="text-xs hidden sm:inline">{p.caught} {game === "kupu-kupu" ? "kupu" : game === "cari-soal" ? "kertas" : "benar"} · kuis {p.quiz_right}/{p.quiz_right + p.quiz_wrong}</span>
                    <span className="font-extrabold tabular-nums w-14 text-right">{p.score}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
