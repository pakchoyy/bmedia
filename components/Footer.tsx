import Icon from "./Icon";
import { CONTACT_EMAIL, CONTACT_WA } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 text-ink dark:text-slate-200 border-t border-gray-200 dark:border-slate-800 mt-4">
      <div className="container mx-auto max-w-[1200px] px-6 py-6">
        <div className="grid gap-6 mb-4 grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-primary font-extrabold mb-3 text-sm">
              <Icon name="laptop-code" className="text-primary-light text-lg" />
              Bantu Guru Yuk - Belajar
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
              Satu Tempat untuk Media Pembelajaran Interaktif Guru Indonesia. BGY
              (Bantu Guru Yuk) merupakan ekosistem aplikasi pendidikan yang
              membantu guru bekerja lebih mudah, cepat, dan terorganisir melalui
              pemanfaatan teknologi.
            </p>
          </div>
          <div>
            <h3 className="text-primary font-extrabold mb-3 text-sm">
              Kontak Admin
            </h3>
            <ul className="text-sm space-y-2 mb-4">
              <li>
                <a href="#panduan" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
                  <Icon name="book-open" className="w-4 text-primary-light inline" />{" "}
                  Panduan Penggunaan
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
                  <Icon name="envelope" className="w-4 text-primary-light inline" />{" "}
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/62${CONTACT_WA.slice(1)}`} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium">
                  <Icon name="whatsapp" className="w-4 text-primary-light inline" />{" "}
                  {CONTACT_WA}
                </a>
              </li>
            </ul>
            <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
              Ada data salah atau ingin hapus media? Hubungi admin via WhatsApp.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-primary text-center py-3">
        <div className="container mx-auto max-w-[1200px] px-6">
          <div className="text-white font-extrabold">Media Belajar</div>
          <div className="text-xs text-white/75 mt-0.5">
            Bantu Guru Yuk by{" "}
            <a href="https://bantuguruyuk.web.id" target="_blank" rel="noreferrer" className="font-semibold hover:text-accent transition-colors">
              Pak Choyy
            </a>{" "}
            &bull; v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
