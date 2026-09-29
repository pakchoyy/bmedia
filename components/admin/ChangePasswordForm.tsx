"use client";

import { useState } from "react";
import { changePassword } from "@/app/admin/actions";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ ok: false, text: "Konfirmasi password tidak sama." });
      return;
    }
    setSaving(true);
    const res = await changePassword(current, next);
    setSaving(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg({ ok: true, text: "Password berhasil diganti." });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div>
        <label htmlFor="current" className="block font-semibold mb-2 text-primary text-sm">Password lama</label>
        <input id="current" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="next" className="block font-semibold mb-2 text-primary text-sm">Password baru (min. 8 karakter)</label>
        <input id="next" type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm" className="block font-semibold mb-2 text-primary text-sm">Ulangi password baru</label>
        <input id="confirm" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </div>
      {msg && (
        <div role="alert" className={`rounded-lg px-4 py-3 text-sm border ${msg.ok ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"}`}>
          {msg.text}
        </div>
      )}
      <button type="submit" disabled={saving} className="w-full bg-primary-light text-white py-3 rounded-lg font-bold hover:bg-primary transition-colors disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan Password"}
      </button>
    </form>
  );
}
