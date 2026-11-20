"use client";

import { useState, useTransition } from "react";
import { saveSet, deleteSet } from "@/app/(public)/guru/actions";
import { CSV_TEMPLATE, MAX_SOAL, parseCsvSoal, type QuestionSet, type Soal } from "@/lib/soal";
import { GAMES, gameLabel } from "@/lib/games";
import { htmlToLines, parsePlainText, parseSoalLines, type ImportResult } from "@/lib/soal-import";

const inputCls =
  "w-full px-3 py-2 nb-flat dark:bg-slate-950 rounded-lg text-sm outline-none focus:ring-4 focus:ring-nb-yellow/60";

const emptySoal = (): Soal => ({ q: "", o: ["", "", "", ""], a: 0 });
const LETTERS = "ABCDE";

export default function SetEditor({ set }: { set: QuestionSet }) {
  const [title, setTitle] = useState(set.title);
  const [subject, setSubject] = useState(set.subject ?? "");
  const [grade, setGrade] = useState(set.grade ?? "");
  const [game, setGame] = useState(set.game || "kupu-kupu");
  const [soal, setSoal] = useState<Soal[]>(set.questions.length ? set.questions : [emptySoal()]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  // Indeks soal hasil impor yang belum punya kunci jawaban (perlu dicek guru)
  const [needCheck, setNeedCheck] = useState<Set<number>>(new Set());
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);

  function update(i: number, patch: Partial<Soal>) {
    if (patch.a !== undefined) setNeedCheck((p) => { const n = new Set(p); n.delete(i); return n; });
    setSoal((prev) => prev.map((s, k) => (k === i ? { ...s, ...patch } : s)));
    setDirty(true);
  }
  function setOpt(i: number, j: number, v: string) {
    setSoal((prev) => prev.map((s, k) => (k === i ? { ...s, o: s.o.map((x, m) => (m === j ? v : x)) } : s)));
    setDirty(true);
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveSet(set.id, { title, subject, grade, questions: soal, game });
      if (res.ok) {
        setDirty(false);
        setMsg({ type: "ok", text: `Tersimpan ✓ (${soal.length} soal)` });
      } else {
        setMsg({ type: "err", text: res.error });
      }
    });
  }

  function addImported(r: ImportResult, sumber: string) {
    if (!r.soal.length) {
      setMsg({
        type: "err",
        text: `Tidak ada soal yang terbaca dari ${sumber}. Pastikan soal bernomor (1., 2., …) dengan 4 atau 5 pilihan (a–d atau a–e).` +
          (r.skipped.length ? ` (${r.skipped.slice(0, 2).join("; ")})` : ""),
      });
      return;
    }
    let startIdx = 0;
    setSoal((prev) => {
      const base = prev.filter((s) => s.q.trim() || s.o.some((x) => x.trim()));
      startIdx = base.length;
      return [...base, ...r.soal].slice(0, MAX_SOAL);
    });
    setNeedCheck((prev) => {
      const next = new Set(prev);
      r.noKey.forEach((n) => next.add(startIdx + n - 1));
      return next;
    });
    setDirty(true);
    const parts = [`${r.soal.length} soal diimpor dari ${sumber}`];
    if (r.noKey.length) parts.push(`${r.noKey.length} soal belum ada kuncinya (ditandai kuning, cek dulu)`);
    if (r.skipped.length) parts.push(`${r.skipped.length} dilewati: ${r.skipped.slice(0, 2).join("; ")}${r.skipped.length > 2 ? "…" : ""}`);
    setMsg({ type: r.noKey.length || r.skipped.length ? "err" : "ok", text: parts.join(". ") + ". Jangan lupa Simpan." });
  }

  async function importCsv(file: File) {
    const { soal: hasil, skipped } = parseCsvSoal(await file.text());
    addImported({ soal: hasil, noKey: [], skipped: skipped ? [`${skipped} baris tidak lengkap`] : [] }, "CSV");
  }

  async function importWord(file: File) {
    if (/\.doc$/i.test(file.name)) {
      setMsg({ type: "err", text: "File .doc (Word lama) belum didukung. Buka di Word lalu Simpan Sebagai → .docx." });
      return;
    }
    setBusy(true);
    try {
      const mammoth = await import("mammoth/mammoth.browser");
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      addImported(parseSoalLines(htmlToLines(value)), "Word");
    } catch {
      setMsg({ type: "err", text: "File Word tidak bisa dibaca. Pastikan formatnya .docx." });
    } finally {
      setBusy(false);
    }
  }

  function importPaste() {
    addImported(parsePlainText(pasteText), "teks");
    setPasteText("");
    setPasteOpen(false);
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
        <div>
          <label className="block text-xs font-bold mb-1">Game untuk murid</label>
          <select value={game} onChange={(e) => { setGame(e.target.value); setDirty(true); }} className={inputCls}>
            {GAMES.map((g) => <option key={g.slug} value={g.slug}>{gameLabel(g)}</option>)}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Game yang terbuka saat murid memasukkan kode kelas. Di panel kanan kamu bisa mencoba semua game dengan soal ini.</p>
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
      <div className="nb-sm bg-nb-yellow/30 dark:bg-slate-900 rounded-2xl p-4 text-sm">
        <p className="font-extrabold">📥 Sudah punya soal? Impor saja</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          Tidak perlu template. Tulis soal bernomor (1., 2., …) dengan pilihan a–d (boleh a–e), lalu tandai jawaban benar
          dengan <b>Kunci: A</b>, huruf <b>tebal</b>, atau tanda <b>*</b>.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <label className={`px-3 py-2 rounded-lg nb-sm nb-press bg-nb-blue text-white font-bold cursor-pointer ${busy ? "opacity-60" : ""}`}>
            {busy ? "Membaca..." : "📄 Impor Word"}
            <input type="file" accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importWord(f); e.target.value = ""; }} />
          </label>
          <button onClick={() => setPasteOpen((v) => !v)} className="px-3 py-2 rounded-lg nb-sm nb-press bg-white dark:bg-slate-800 font-bold">
            📋 Tempel teks
          </button>
          <label className="px-3 py-2 rounded-lg nb-sm nb-press bg-nb-mint text-nb-ink font-bold cursor-pointer">
            📊 Impor CSV
            <input type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ""; }} />
          </label>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-semibold">
          <a href="/contoh-soal-bgy.docx" download className="underline text-nb-ink dark:text-slate-200">Unduh contoh Word</a>
          <button onClick={downloadTemplate} className="underline text-nb-ink dark:text-slate-200">Unduh template CSV (Excel)</button>
        </div>

        {pasteOpen && (
          <div className="mt-3">
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={8}
              placeholder={"1. Hewan yang mengalami metamorfosis sempurna adalah ...\na. Kupu-kupu\nb. Kucing\nc. Ayam\nd. Kambing\nKunci: A"}
              className={inputCls + " font-mono text-xs"} />
            <div className="flex gap-2 mt-2">
              <button onClick={importPaste} disabled={!pasteText.trim()}
                className="px-3 py-2 rounded-lg nb-sm nb-press bg-nb-orange text-nb-ink font-bold disabled:opacity-50">
                Baca soal
              </button>
              <button onClick={() => setPasteOpen(false)} className="px-3 py-2 text-xs font-semibold text-slate-500">Batal</button>
            </div>
          </div>
        )}
      </div>

      {/* Daftar soal */}
      {soal.map((s, i) => (
        <div key={i} className={`nb-sm rounded-2xl p-4 ${needCheck.has(i) ? "bg-nb-yellow/40 dark:bg-yellow-900/40" : "bg-white dark:bg-slate-900"}`}>
          {needCheck.has(i) && (
            <p className="text-xs font-extrabold text-nb-ink dark:text-nb-yellow mb-2">⚠️ Kunci jawaban belum ditemukan. Pilih jawaban yang benar.</p>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-nb-ink dark:text-white">SOAL {i + 1}</span>
            <button onClick={() => {
              setSoal((p) => p.filter((_, k) => k !== i));
              setNeedCheck((p) => new Set(Array.from(p).filter((k) => k !== i).map((k) => (k > i ? k - 1 : k))));
              setDirty(true);
            }}
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
                  className="accent-green-600" aria-label={`Jawaban benar ${LETTERS[j]}`} />
                <span className="text-xs font-bold w-3">{LETTERS[j]}</span>
                <input value={opt} maxLength={300} onChange={(e) => setOpt(i, j, e.target.value)}
                  placeholder={`Pilihan ${LETTERS[j]}`} className="flex-1 min-w-0 bg-transparent outline-none text-sm py-1" />
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-[11px] text-gray-400">Pilih bulatan di samping jawaban yang benar.</p>
            {s.o.length === 4 ? (
              <button type="button" onClick={() => { update(i, { o: [...s.o, ""] }); }}
                className="ml-auto text-xs font-bold underline text-nb-ink dark:text-slate-200">+ Pilihan E</button>
            ) : (
              <button type="button" onClick={() => { update(i, { o: s.o.slice(0, 4), a: s.a === 4 ? 0 : s.a }); }}
                className="ml-auto text-xs font-bold underline text-nb-ink dark:text-slate-200">− Hapus pilihan E</button>
            )}
          </div>
        </div>
      ))}

      <button onClick={() => { setSoal((p) => [...p, emptySoal()].slice(0, MAX_SOAL)); setDirty(true); }}
        className="w-full border-[3px] border-dashed border-nb-ink/60 dark:border-[var(--nb-ink)] rounded-2xl py-3 font-bold text-gray-500  hover:text-nb-orange">
        + Tambah Soal
      </button>

      {/* Bar simpan */}
      <div className="sticky bottom-3 z-10 nb bg-white dark:bg-slate-900 rounded-2xl p-3 flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={pending}
          className="nb-sm nb-press bg-nb-orange text-nb-ink font-bold px-5 py-2.5 rounded-lg disabled:opacity-60">
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
