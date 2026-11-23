"use client";

import { useState } from "react";

const input = "w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-base outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20";

export default function PinSettings({ pinActive, deviceTrusted }: { pinActive: boolean; deviceTrusted: boolean }) {
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [trust, setTrust] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(pinActive);
  const [trusted, setTrusted] = useState(deviceTrusted);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pin !== pin2) { setMsg({ ok: false, text: "Konfirmasi PIN tidak sama." }); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/keamanan/pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, pin, trust }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ ok: false, text: d.error ?? "Gagal menyimpan PIN." }); return; }
      setActive(true); if (d.trusted) setTrusted(true);
      setPassword(""); setPin(""); setPin2("");
      setMsg({ ok: true, text: d.trusted ? "PIN aktif dan perangkat ini dipercaya. Lain kali login cukup pakai PIN." : "PIN aktif. Perangkat ini belum dipercaya, jadi PIN belum bisa dipakai di sini." });
    } finally { setBusy(false); }
  }

  async function off() {
    if (!confirm("Matikan PIN dan cabut semua perangkat tepercaya?")) return;
    setBusy(true);
    const r = await fetch("/api/admin/keamanan/cabut", { method: "POST" });
    setBusy(false);
    if (r.ok) { setActive(false); setTrusted(false); setMsg({ ok: true, text: "PIN dimatikan dan semua perangkat tepercaya dicabut." }); }
  }

  return (
    <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold text-primary mb-1">PIN Cepat</h2>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        Masuk lebih cepat di perangkat yang kamu percaya, cukup 6 angka. PIN <b>tidak berlaku</b> di perangkat lain,
        dikunci 15 menit setelah 5 kali salah, dan dinonaktifkan otomatis bila salah terlalu sering.
      </p>
      <p className="text-sm mb-4">
        Status: <b className={active ? "text-success" : "text-gray-500"}>{active ? "PIN aktif" : "PIN belum aktif"}</b>
        {" · "}Perangkat ini: <b>{trusted ? "dipercaya" : "belum dipercaya"}</b>
      </p>

      <form onSubmit={save} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="pw" className="block font-semibold mb-2 text-sm">Password saat ini</label>
          <input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pin" className="block font-semibold mb-2 text-sm">PIN baru (6 angka)</label>
            <input id="pin" type="password" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className={input} />
          </div>
          <div>
            <label htmlFor="pin2" className="block font-semibold mb-2 text-sm">Ulangi PIN</label>
            <input id="pin2" type="password" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="new-password" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} className={input} />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} className="mt-1" />
          <span>Percayai perangkat ini (90 hari). Jangan dicentang di komputer umum.</span>
        </label>
        {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy} className="bg-primary-light hover:bg-primary text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60">
            {active ? "Ganti PIN" : "Aktifkan PIN"}
          </button>
          {active && <button type="button" disabled={busy} onClick={off} className="text-sm font-semibold text-danger underline">Matikan PIN &amp; cabut perangkat</button>}
        </div>
      </form>
    </section>
  );
}
