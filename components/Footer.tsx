import Icon from "./Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 text-ink dark:text-slate-200 border-t border-gray-200 dark:border-slate-800 mt-2">
      <div className="container mx-auto max-w-[1200px] px-6 py-4">
        <div className="grid gap-4 mb-2 grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-primary font-extrabold mb-2 text-sm">
              <Icon name="laptop-code" className="text-primary-light text-lg" />
              Bantu Guru Yuk - Media Belajar
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
              &ldquo;Ruang berbagi media pembelajaran interaktif untuk membantu
              guru Indonesia mengajar dengan lebih mudah dan menarik.&rdquo;
            </p>
          </div>
          <div>
            <h3 className="text-primary font-extrabold mb-2 text-sm">
              Kontak Pak Choy
            </h3>
            <ul className="text-sm space-y-1.5 mb-2">
              <li>
                <a
                  href={CONTACT_TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Icon name="tiktok" className="w-4 text-primary-light" />
                  TikTok Pak Choyy
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-slate-400 hover:text-primary-light transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Icon name="whatsapp" className="w-4 text-primary-light" />
                  WhatsApp Pak Choy
                </a>
              </li>
            </ul>
            <p className="text-xs text-danger leading-relaxed">
              Ada data yang perlu diperbaiki atau ingin berbagi media? Hubungi
              Pak Choy.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-primary text-center py-2">
        <div className="container mx-auto max-w-[1200px] px-6">
          <div className="text-white font-extrabold">Media Belajar</div>
          <div className="text-xs text-white/75 mt-0.5">
            Bantu Guru Yuk by{" "}
            <a
              href="https://bantuguruyuk.web.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-accent transition-colors"
            >
              Pak Choyy
            </a>{" "}
            &bull; v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}