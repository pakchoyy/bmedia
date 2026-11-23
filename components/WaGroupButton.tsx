import { GRUP_WA_URL } from "@/lib/constants";
import Icon from "./Icon";

/** Tombol gabung grup WhatsApp (usul game, diskusi). Tersembunyi sampai GRUP_WA_URL diisi. */
export default function WaGroupButton({ className = "" }: { className?: string }) {
  if (!GRUP_WA_URL) return null;
  return (
    <a href={GRUP_WA_URL} target="_blank" rel="noopener noreferrer"
      className={`nb-sm nb-press inline-flex items-center gap-2 bg-nb-mint text-nb-ink font-extrabold rounded-xl px-4 py-2.5 text-sm ${className}`}>
      <Icon name="whatsapp" /> Gabung Grup WhatsApp
    </a>
  );
}
