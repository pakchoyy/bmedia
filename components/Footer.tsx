import Icon from "./Icon";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 text-ink dark:text-slate-200 border-t border-gray-200 dark:border-slate-800 py-12">
      <div className="container mx-auto max-w-[1200px] px-6">
        <div className="text-center mb-8">
          <h3 className="flex items-center justify-center gap-2 text-primary dark:text-primary-light font-bold mb-3 text-lg">
            <Icon name="laptop-code" className="text-xl" />
            Bantu Guru Yuk
          </h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm max-w-[500px] mx-auto">
            Media Belajar Interaktif Karya Guru Indonesia
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <Link href="/catalog" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
            Media Belajar
          </Link>
          <Link href="/#categories" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
            Kategori
          </Link>
          <Link href="/buat" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
            Buat Game
          </Link>
          <Link href="/submit" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
            Kirim Karya
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-slate-500 border-t border-gray-200 dark:border-slate-800 pt-6">
          &copy; 2026 Bantu Guru Yuk by{" "}
          <a
            href="https://bantuguruyuk.web.id"
            target="_blank"
            rel="noreferrer"
            className="font-bold hover:text-primary-light transition-colors"
          >
            @pak.choyy
          </a>
        </div>
      </div>
    </footer>
  );
}
