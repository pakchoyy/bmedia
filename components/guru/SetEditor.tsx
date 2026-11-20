"use client";

import { useState, useTransition } from "react";
import { saveSet, deleteSet } from "@/app/(public)/guru/actions";
import { CSV_TEMPLATE, MAX_SOAL, parseCsvSoal, type QuestionSet, type Soal } from "@/lib/soal";

const inputCls =
  "w-full px-3 py-2 nb-flat dark:bg-slate-950 rounded-lg text-sm outline-none focus:ring-4 focus:ring-nb-yellow/60";

const emptySoal = (): Soal => ({ q: "", o: ["", "", "", ""], a: 0 });

export default function SetEditor({ set }: { set: QuestionSet }) {
  const [title, setTitle] = useState(set.title);
  const [subject, setSubject] = useState(set.subject ?? "");
  const [grade, setGrade] = useState(set.grade ?? "");
  const [soal, setSoal] = useState<Soal[]>(set.questions.length ? set.questions : [emptySoal()]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  function update(i: number, patch: Partial<Soal>) {
    setSoal((prev) => prev.map((s, k) => (k === i ? { ...s, ...patch } : s)));
    setDirty(true);
  }
  function setOpt(i: number, j: number, v: string) {
    setSoal((prev) => prev.map((s, k) => (k === i ? { ...s, o: s.o.map((x, m) => (m === j ? v : x)) as Soal["o"] } : s)));
    setDirty(true);
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveSet(set.id, { title, subject, grade, questions: soal });
      if (res.ok) {
        setDirty(false);
        setMsg({ type: "ok", text: `Tersimpan ✓ (${soal.length} soal)` });
      } else {
        setMsg({ type: "err", text: res.error });
      }
    });
  }

  async function importCsv(file: File) {
    const { soal: hasil, skipped } = parseCsvSoal(await file.text());
    if (!hasil.length) {
      setMsg({ type: "err", text: "Tidak ada soal yang terbaca. Pastikan formatnya sesuai template." });
      return;
    }
    setSoal((prev) => {
      const base = prev.filter((s) => s.q.trim() || s.o.some((x) => x.trim()));
      return [...base, ...hasil].slice(0, MAX_SOAL);
    });
    setDirty(true);
    setMsg({
      type: "ok",
      text: `${hasil.length} soal diimpor${skipped ? `, ${skipped} baris dilewati karena tidak lengkap` : ""}. Jangan lupa Simpan.`,
    });
  }

  function downloadTemplate() {
    const blob = new Blob(["﻿" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "template-soal-bgy.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-4 min-w-0">
      {/* Info set */}
      <div className="nb-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
        <div>
          <label className="block text-xs font-bold mb-1">Judul set soal</label>
          <input value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            placeholder="Contoh: IPA Kelas 5 – Metamorfosis" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">Mapel</label>
            <input value={subject} maxLength={60} onChange={(e) => { setSubject(e.target.value); setDirty(true); }}
              placeholder="IPA" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Kelas</label>
            <input value={grade} maxLength={40} onChange={(e) => { setGrade(e.target.value); setDirty(true); }}
              placeholder="5 SD" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Impor */}
      <div className="nb-sm bg-nb-yellow/30 dark:bg-slate-900 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold mr-auto">📥 Punya soal di Excel?</span>
        <button onClick={downloadTemplate} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 nb-flat font-semibold">
          Unduh template
        </button>
        <label className="px-3 py-2 rounded-lg nb-sm nb-press bg-nb-orange text-white font-semibold cursor-pointer">
          Impor CSV
          <input type="file" accept=".csv,text/csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ""; }} />
        </label>
        <p className="w-full text-xs text-gray-500">Di Excel: isi template, lalu <i>Simpan Sebagai → CSV</i>. Kolom: pertanyaan, A, B, C, D, jawaban (A/B/C/D).</p>
      </div>

      {/* Daftar soal */}
      {soal.map((s, i) => (
        <div key={i} className="nb-sm bg-white dark:bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-nb-ink dark:text-white">SOAL {i + 1}</span>
            <button onClick={() => { setSoal((p) => p.filter((_, k) => k !== i)); setDirty(true); }}
              className="text-xs font-semibold text-gray-400 hover:text-danger" aria-label={`Hapus soal ${i + 1}`}>
              Hapus
            </button>
          </div>
          <textarea value={s.q} maxLength={300} rows={2} onChange={(e) => update(i, { q: e.target.value })}
            placeholder="Tulis pertanyaan..." className={inputCls + " resize-y"} />
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {s.o.map((opt, j) => (
              <label key={j} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${s.a === j ? "border-success bg-success/10" : "border-gray-200 dark:border-slate-700"}`}>
                <input type="radio" name={`ans-${i}`} checked={s.a === j} onChange={() => update(i, { a: j })}
                  className="accent-green-600" aria-label={`Jawaban benar ${"ABCD"[j]}`} />
                <span className="text-xs font-bold w-3">{"ABCD"[j]}</span>
                <input value={opt} maxLength={300} onChange={(e) => setOpt(i, j, e.target.value)}
                  placeholder={`Pilihan ${"ABCD"[j]}`} className="flex-1 min-w-0 bg-transparent outline-none text-sm py-1" />
              </label>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Pilih bulatan di samping jawaban yang benar.</p>
        </div>
      ))}

      <button onClick={() => { setSoal((p) => [...p, emptySoal()].slice(0, MAX_SOAL)); setDirty(true); }}
        className="w-full border-[3px] border-dashed border-nb-ink/60 dark:border-[var(--nb-ink)] rounded-2xl py-3 font-bold text-gray-500  hover:text-nb-orange">
        + Tambah Soal
      </button>

      {/* Bar simpan */}
      <div className="sticky bottom-3 z-10 nb bg-white dark:bg-slate-900 rounded-2xl p-3 flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={pending}
          className="nb-sm nb-press bg-nb-orange text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60">
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        <span className={`text-sm ${msg?.type === "err" ? "text-danger" : "text-success"}`} role="status">
          {msg?.text ?? (dirty ? <span className="text-accent">Ada perubahan belum disimpan</span> : "")}
        </span>
        <form action={deleteSet.bind(null, set.id)} className="ml-auto"
          onSubmit={(e) => { if (!confirm("Hapus set soal ini? Kode kelasnya tidak bisa dipakai lagi.")) e.preventDefault(); }}>
          <button className="text-sm font-semibold text-gray-400 hover:text-danger">Hapus set</button>
        </form>
      </div>
    </div>
  );
}
