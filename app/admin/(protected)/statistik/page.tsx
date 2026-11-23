import { requireAdmin } from "@/lib/admin";
import { getAppStats, type DayPoint } from "@/lib/stats";

export const metadata = { title: "Statistik" };
export const dynamic = "force-dynamic";

const MODE: Record<string, string> = { free: "Bebas", edu: "Edukasi", race: "Layar Bersama", online: "Mabar" };

function Card({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="text-3xl font-extrabold text-ink leading-none mb-1">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Bars({ data, color }: { data: DayPoint[]; color: string }) {
  const max = Math.max(1, ...data.map((p) => p.n));
  return (
    <div>
      <div className="flex items-end gap-1 h-24" role="img" aria-label={`Grafik 14 hari: ${data.map((p) => `${p.d} ${p.n}`).join(", ")}`}>
        {data.map((p) => (
          <div key={p.d} className="flex-1 flex flex-col justify-end h-full" title={`${p.d}: ${p.n}`}>
            <div className={`${color} rounded-t`} style={{ height: `${p.n ? Math.max(6, (p.n / max) * 100) : 2}%`, opacity: p.n ? 1 : 0.25 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>{data[0]?.d}</span><span>{data[data.length - 1]?.d}</span></div>
    </div>
  );
}

export default async function StatistikPage() {
  await requireAdmin();
  const s = await getAppStats();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Statistik Guru &amp; Murid</h1>
        <p className="text-sm text-gray-500 mt-1">Dasar untuk memutuskan arah web: apakah guru benar-benar memakai fitur ini?</p>
      </div>

      <section>
        <h2 className="font-bold text-primary mb-3">Guru</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card label="Guru terdaftar" value={s.teachers.total} sub={`+${s.teachers.new7} minggu ini · +${s.teachers.new30} bulan ini`} />
          <Card label="Aktif 7 hari terakhir" value={s.teachers.active7} sub="ubah soal / ada murid main / buat ruang" />
          <Card label="Sudah membuat set soal" value={s.teachers.withSet} sub={s.teachers.total ? `${Math.round((s.teachers.withSet / s.teachers.total) * 100)}% dari yang daftar` : undefined} />
          <Card label="Set soal" value={s.sets.total} sub={`rata-rata ${s.sets.avgQuestions} soal · +${s.sets.new7} minggu ini`} />
        </div>
      </section>

      <section>
        <h2 className="font-bold text-primary mb-3">Murid &amp; permainan</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card label="Sesi main (dengan kode kelas)" value={s.sessions.total} sub={`${s.sessions.last7} dalam 7 hari`} />
          <Card label="Murid unik (per set)" value={s.sessions.students} />
          <Card label="Ruang Mabar dibuat" value={s.rooms.total} sub={`${s.rooms.finished} selesai dimainkan`} />
          <Card label="Murid masuk Mabar" value={s.rooms.players} />
        </div>
        {s.sessions.byMode.length > 0 && (
          <p className="text-sm text-gray-600 mt-3">Per mode: {s.sessions.byMode.map((m) => `${MODE[m.mode] ?? m.mode} ${m.n}`).join(" · ")}</p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h2 className="font-bold text-primary mb-3">Sesi main per hari (14 hari)</h2>
          <Bars data={s.daily.sessions} color="bg-primary-light" />
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h2 className="font-bold text-primary mb-3">Guru baru per hari (14 hari)</h2>
          <Bars data={s.daily.teachers} color="bg-accent" />
        </div>
      </section>

      <section>
        <h2 className="font-bold text-primary mb-3">Set soal paling sering dimainkan</h2>
        {s.topSets.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada set soal.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-gray-500 border-b"><th className="p-3">Set soal</th><th className="p-3">Guru</th><th className="p-3 text-right">Sesi</th><th className="p-3 text-right">Murid</th></tr></thead>
              <tbody>
                {s.topSets.map((t, i) => (
                  <tr key={i} className="border-b last:border-0"><td className="p-3 font-semibold">{t.title}</td><td className="p-3 text-gray-600">{t.teacher}</td><td className="p-3 text-right">{t.sesi}</td><td className="p-3 text-right">{t.murid}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-gray-400">Catatan: data sesi hanya mencakup permainan memakai kode kelas/Mabar. Pemain solo tanpa kode tidak terhitung.</p>
    </div>
  );
}
