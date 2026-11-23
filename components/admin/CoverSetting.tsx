"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSetting } from "@/app/admin/actions";
import Icon from "@/components/Icon";

/** Unggah/ganti satu gambar cover (hero atau game). Gambar disimpan di penyimpanan yang sama dengan thumbnail karya. */
export default function CoverSetting({ label, settingKey, current, fallback, ratio = "16/9", hint }: {
  label: string; settingKey: string; current: string | null; fallback: string; ratio?: string; hint?: string;
}) {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const shown = current || fallback;

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setMsg({ ok: false, t: "Format harus JPG, PNG, atau WEBP." }); return; }
    if (f.size > 3 * 1024 * 1024) { setMsg({ ok: false, t: "Ukuran maksimal 3 MB." }); return; }
    setBusy(true); setMsg(null);
    try {
      const body = new FormData(); body.append("file", f);
      const res = await fetch("/api/upload-thumbnail", { method: "POST", body });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error(d.error || "Gagal mengunggah.");
      start(async () => {
        const r = await setSetting(settingKey, d.url);
        setMsg(r.ok ? { ok: true, t: "Cover disimpan." } : { ok: false, t: r.error });
        if (r.ok) router.refresh();
      });
    } catch (e) {
      setMsg({ ok: false, t: e instanceof Error ? e.message : "Gagal mengunggah." });
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white">{label}</h3>
        {current ? <span className="text-[11px] font-bold rounded-full bg-nb-mint/30 px-2 py-0.5 text-nb-ink">Custom</span>
          : <span className="text-[11px] font-bold rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">Bawaan</span>}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shown} alt={`Cover ${label}`} className="w-full rounded-lg border-2 border-nb-ink object-cover bg-nb-cream" style={{ aspectRatio: ratio }} />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id={`f-${settingKey}`} onChange={(e) => onFile(e.target.files?.[0])} />
        <label htmlFor={`f-${settingKey}`} className={`cursor-pointer rounded-lg bg-nb-orange border-2 border-nb-ink px-3 py-2 text-sm font-bold text-nb-ink inline-flex items-center gap-2 ${busy || pending ? "opacity-60 pointer-events-none" : ""}`}>
          <Icon name="cloud-arrow-up" /> {busy || pending ? "Mengunggah…" : "Ganti gambar"}
        </label>
        {current && (
          <button type="button" disabled={pending} onClick={() => start(async () => {
            const r = await setSetting(settingKey, null);
            setMsg(r.ok ? { ok: true, t: "Kembali ke cover bawaan." } : { ok: false, t: r.error });
            if (r.ok) router.refresh();
          })} className="rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 dark:text-slate-200">
            Pakai bawaan
          </button>
        )}
      </div>
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
    </div>
  );
}
