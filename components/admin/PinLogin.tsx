"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";

export default function PinLogin({ onUsePassword }: { onUsePassword: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  async function submit(value: string) {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/admin/pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: value }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { router.push("/admin"); router.refresh(); return; }
      setError(d.error ?? "Gagal masuk.");
      setPin("");
      if (d.needPassword) setTimeout(onUsePassword, 1500);
      ref.current?.focus();
    } catch {
      setError("Tidak dapat terhubung. Periksa internet.");
    } finally { setBusy(false); }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-800 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-light/10 text-primary-light flex items-center justify-center mx-auto mb-3">
          <Icon name="key" className="text-2xl" />
        </div>
        <h1 className="text-xl font-extrabold text-primary dark:text-white">Masuk dengan PIN</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">Perangkat ini sudah dipercaya. Masukkan 6 angka PIN.</p>

        <label htmlFor="pin" className="sr-only">PIN 6 angka</label>
        <input
          id="pin" ref={ref} autoFocus type="password" inputMode="numeric" autoComplete="one-time-code" pattern="\d*" maxLength={6}
          value={pin} disabled={busy} aria-describedby="pin-err"
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPin(v);
            if (v.length === 6) submit(v);
          }}
          className="w-full text-center tracking-[0.6em] text-3xl font-extrabold px-4 py-4 border-2 border-gray-300 dark:border-slate-700 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-light"
          placeholder="••••••"
        />
        <p id="pin-err" role="alert" className="text-sm text-danger mt-3 min-h-[1.25rem]">{error}</p>
        {busy && <p className="text-sm text-gray-500">Memeriksa…</p>}

        <button type="button" onClick={onUsePassword} className="mt-5 text-sm font-semibold text-primary-light hover:underline">
          Masuk dengan password
        </button>
        <a href="/" className="block text-center text-sm text-gray-500 mt-4 hover:text-primary-light">&larr; Kembali ke website</a>
      </div>
    </div>
  );
}
