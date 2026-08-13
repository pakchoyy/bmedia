import Icon from "./Icon";
import { CONTACT_EMAIL, CONTACT_WA } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 text-ink dark:text-slate-200 border-t border-gray-200 dark:border-slate-800 mt-16">
      <div className="container mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 mb-8 grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-primary font-extrabold mb-4 text-sm">
              <Icon name="laptop-code" className="text-primary-light text-lg" />
              Bantu Guru Yuk - Belajar
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Satu Tempat untuk Media Pembelajaran Interaktif Guru Indonesia. BGY
              (Bantu Guru Yuk) merupakan ekosistem aplikasi pendidikan yang
              membantu guru bekerja lebih mudah, cepat, dan terorganisir melalui
              pemanfaatan teknologi.
            </p>
          </div>
          <div>
            <h3 className="text-primary font-extrabold mb-4 text-sm pb-2 relative">
              Informasi &amp; Kontak Admin
            </h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#panduan" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
                  <Icon name="book-open" className="w-5 text-primary-light inline" />{" "}
                  Panduan Penggunaan
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium"
                >
                  <Icon name="envelope" className="w-5 text-primary-light inline" />{" "}
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium"
                >
                  <Icon name="whatsapp" className="w-5 text-primary-light inline" />{" "}
                  {CONTACT_WA}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-danger border-t border-gray-200 dark:border-slate-800 pt-4 mb-5">
          * Apabila terdapat data yang salah atau Anda ingin menghapus media yang
          telah dipublikasikan, silakan hubungi Admin.
        </p>
      </div>
      <div className="bg-primary text-center py-5">
        <div className="container mx-auto max-w-[1200px] px-6 text-sm text-white/90">
          &copy; 2026 Bantu Guru Yuk by{" "}
          <a href="https://bantuguruyuk.web.id" target="_blank" rel="noreferrer" className="font-extrabold hover:text-accent transition-colors">
            @pak.choyy
          </a>{" "}
          &bull; v1.0.0
        </div>
      </div>
    </footer>
  );
}
