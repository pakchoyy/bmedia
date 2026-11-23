import { getSettings, HERO_KEY, HERO_DEFAULT, coverKey, gameMeta } from "@/lib/settings";
import GameMetaForm from "@/components/admin/GameMetaForm";
import { MAIN_GAMES } from "@/lib/games";
import CoverSetting from "@/components/admin/CoverSetting";

export const dynamic = "force-dynamic";

export default async function AdminTampilanPage() {
  const s = await getSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tampilan & Cover</h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
          Ganti gambar banner beranda dan cover tiap Karya Admin. Bisa pakai gambar buatan AI (mis. GPT Image). JPG/PNG/WEBP, maks 3 MB.
        </p>
      </div>
      <section>
        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Banner beranda</h2>
        <div className="max-w-xl">
          <CoverSetting label="Banner beranda" settingKey={HERO_KEY} current={s[HERO_KEY] ?? null} fallback={HERO_DEFAULT} ratio="16/10" hint="Saran ukuran 1600×1000 piksel (rasio 16:10)." />
        </div>
      </section>
      <section>
        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Cover & info Karya Admin Main-yuk</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MAIN_GAMES.map((g) => (
            <div key={g.slug} className="space-y-2">
              <CoverSetting label={g.title} settingKey={coverKey(g.slug)} current={s[coverKey(g.slug)] ?? null} fallback={g.preview} hint="Saran ukuran 1280×720 piksel (16:9). Taruh judul/karakter di tengah." />
              <div className="rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                <GameMetaForm slug={g.slug} meta={gameMeta(s, g)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
