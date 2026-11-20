"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { GAMES, getGame } from "@/lib/games";

export default function SharePanel({ id, code, game }: { id: string; code: string; game: string }) {
  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);
  const joinUrl = origin ? `${origin}/main/${code}` : "";

  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, { margin: 1, width: 480, color: { dark: "#1e293b", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [joinUrl]);

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      window.prompt("Salin teks ini:", text);
    }
  }

  return (
    <aside className="lg:sticky lg:top-20 h-fit nb-sm bg-white dark:bg-slate-900 rounded-2xl p-5 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Kode Kelas · {getGame(game)?.title ?? game}</p>
      <button onClick={() => copy(code, "kode")} title="Salin kode"
        className="mt-1 font-mono text-4xl font-extrabold tracking-[0.25em] text-nb-ink dark:text-white">
        {code}
      </button>
      <p className="text-xs text-gray-500 h-4">{copied === "kode" ? "Kode disalin ✓" : "Ketuk kode untuk menyalin"}</p>

      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={`QR kode kelas ${code}`} className="mx-auto mt-3 w-48 h-48 rounded-lg border border-gray-200" />
      ) : (
        <div className="mx-auto mt-3 w-48 h-48 rounded-lg bg-gray-100 dark:bg-slate-800" />
      )}
      <p className="text-xs text-gray-500 mt-2">Murid scan QR, atau buka <b>Masuk Kelas</b> lalu ketik kode.</p>

      <div className="grid gap-2 mt-4">
        <button onClick={() => joinUrl && copy(joinUrl, "link")}
          className="w-full nb-flat rounded-lg py-2.5 text-sm font-semibold ">
          {copied === "link" ? "Link disalin ✓" : "🔗 Salin link untuk murid"}
        </button>
        <a href={`/guru/set/${id}/hasil`}
          className="nb-sm nb-press w-full bg-nb-mint text-nb-ink rounded-lg py-2.5 text-sm font-extrabold block">
          📊 Lihat hasil murid
        </a>
        {GAMES.map((g) => (
          <a key={g.slug} href={`/game/${g.slug}?set=${code}`} target="_blank" rel="noopener"
            className="w-full nb-sm nb-press bg-nb-yellow text-nb-ink rounded-lg py-2.5 text-sm font-extrabold block">
            ▶ Coba: {g.title}{g.slug === "balap-kupu" ? " (IFP)" : ""}
          </a>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">Simpan perubahan soal dulu sebelum murid bermain.</p>
    </aside>
  );
}
