import Icon from "./Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";

export default function Footer() {
  return (
    <footer style={{ background: "var(--grad)", color: "#fff" }} className="text-center px-5 pt-3.5 pb-3">
      <div className="text-[.84rem] font-bold">Media Belajar</div>
      <div className="text-[.7rem] mt-0.5 text-white/85">
        © 2026 Bantu Guru Yuk by{" "}
        <a
          href="https://tiktok.com/@pak.choyy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:text-accent transition-colors"
        >
          pak.choyy
        </a>{" "}
        &bull; v1.0.0
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <a
          href={CONTACT_TIKTOK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[.75rem] text-white/80 hover:text-white transition-colors"
        >
          <Icon name="tiktok" size={14} className="shrink-0" />
          TikTok
        </a>
        <a
          href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[.75rem] text-white/80 hover:text-white transition-colors"
        >
          <Icon name="whatsapp" size={14} className="shrink-0" />
          WhatsApp
        </a>
        <a
          href="https://bantuguruyuk.web.id"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[.75rem] text-white/80 hover:text-white transition-colors"
        >
          <Icon name="arrow-up-right-from-square" size={14} className="shrink-0" />
          BGY Web
        </a>
      </div>
    </footer>
  );
}
