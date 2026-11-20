"use client";

import { useState } from "react";

export default function RuangJoinForm({ code }: { code: string }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`/api/ruang/${code}/gabung`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error ?? "Gagal bergabung."); return; }
      try { localStorage.setItem("bgy_player_name", name.trim()); } catch { /* abaikan */ }
      // Muat halaman penuh agar lapisan situs tidak ikut ke game
      window.location.assign(`/game/kupu-kupu?set=${d.setCode}&room=${code}&pid=${d.pid}&tok=${d.tok}`);
    } catch {
      setErr("Tidak dapat terhubung. Periksa internet.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={join} className="space-y-3">
      <label htmlFor="nama" className="block text-left text-sm font-bold">Namamu</label>
      <input id="nama" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required autoComplete="off"
        placeholder="Tulis nama" className="nb-sm w-full px-4 py-3 rounded-xl text-lg font-bold bg-white dark:bg-slate-950 outline-none focus:ring-4 focus:ring-nb-yellow/60" />
      {err && <p role="alert" className="text-sm text-danger text-left">{err}</p>}
      <button disabled={busy} className="w-full nb nb-press bg-nb-orange text-nb-ink py-3.5 rounded-xl text-lg font-extrabold disabled:opacity-60">
        {busy ? "Bergabung..." : "Gabung ▶"}
      </button>
    </form>
  );
}
