import Link from "next/link";
import Icon from "./Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-6 bg-nb-ink text-white border-t-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
      <div className="container mx-auto max-w-[1200px] px-5 py-8 grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <img src="/logo-main-yuk.png" alt="" width={36} height={36} className="w-9 h-9" />
            <span>Main<span className="text-nb-yellow">-yuk</span></span>
          </div>
          <p className="mt-3 text-sm text-white/75 max-w-[360px]">
            Ruang berbagi media pembelajaran interaktif karya guru Indonesia. Belajar jadi seru, mengajar jadi lebih mudah.
          </p>
        </div>

        <div>
          <h3 className="font-display font-bold text-nb-yellow mb-2">Jelajahi</h3>
          <ul className="space-y-1.5 text-sm font-semibold text-white/85">
            <li><Link href="/catalog" className="hover:text-nb-yellow">Katalog Media</Link></li>
            <li><Link href="/game" className="hover:text-nb-yellow">Game</Link></li>
            <li><Link href="/main" className="hover:text-nb-yellow">Masuk Kelas</Link></li>
            <li><Link href="/guru" className="hover:text-nb-yellow">Ruang Guru</Link></li>
            <li><Link href="/submit" className="hover:text-nb-yellow">Kirim Karya</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold text-nb-yellow mb-2">Kontak Pak Choy</h3>
          <div className="flex flex-wrap gap-2">
            <a href={CONTACT_TIKTOK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-nb-ink font-bold text-sm px-3 py-2 border-2 border-white shadow-[3px_3px_0_#ffd23f]">
              <Icon name="tiktok" /> TikTok
            </a>
            <a href={`https://wa.me/62${CONTACT_WA.slice(1)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-nb-mint text-nb-ink font-bold text-sm px-3 py-2 border-2 border-white shadow-[3px_3px_0_#ffd23f]">
              <Icon name="whatsapp" /> WhatsApp
            </a>
          </div>
          <p className="text-xs text-white/60 mt-3">Ada data yang perlu diperbaiki? Hubungi Pak Choy.</p>
        </div>
      </div>
      <div className="border-t-2 border-white/15 text-center py-3 text-xs text-white/60">
        © Main-yuk · dibuat oleh Pak Choyy untuk guru Indonesia
      </div>
    </footer>
  );
}
