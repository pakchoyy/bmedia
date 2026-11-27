import { saveCariOpts } from "@/app/(public)/guru/actions";

/** Pengaturan Cari Soal Yuk untuk set ini. Murid tidak perlu memilih apa pun selain nama & karakter. */
export default function CariSoalOpts({ id, opts, n }: { id: string; opts: Record<string, number>; n: number }) {
  const mode = opts.mode === 0 ? 0 : 1, per = opts.per || 1, menit = opts.menit || 10;
  const sel = "nb-flat w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-sm";
  return (
    <form action={saveCariOpts.bind(null, id)} className="nb rounded-2xl bg-white dark:bg-slate-900 p-4 space-y-3">
      <h2 className="font-display font-bold text-lg text-nb-ink dark:text-white">🔍 Pengaturan Cari Soal Yuk</h2>
      <label className="block text-xs font-bold">Cara menjawab
        <select name="mode" defaultValue={mode} className={sel}>
          <option value={1}>Jawab langsung di game (dikoreksi otomatis)</option>
          <option value={0}>Murid menulis soal & jawaban di kertas</option>
        </select>
      </label>
      <label className="block text-xs font-bold">Soal per kertas
        <select name="per" defaultValue={per} className={sel}>
          {[1, 2, 3, 4, 5].map((k) => <option key={k} value={k}>{k} soal · jadi {Math.ceil(n / k)} kertas</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold">Lama mencari
        <select name="menit" defaultValue={menit} className={sel}>
          {[5, 10, 15, 20].map((k) => <option key={k} value={k}>{k} menit</option>)}
        </select>
      </label>
      <button className="w-full nb-sm nb-press bg-nb-yellow text-nb-ink rounded-xl py-2.5 font-extrabold">Simpan pengaturan</button>
      <p className="text-xs text-slate-500">Murid cukup menulis nama dan memilih karakter.</p>
    </form>
  );
}
