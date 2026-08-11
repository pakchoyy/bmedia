import Link from "next/link";
import type { Media } from "@/types/media";
import { formatPlays } from "@/lib/utils";
import MediaThumb from "./MediaThumb";
import Icon from "./Icon";

export default function TrendingSidebar({ media }: { media: Media[] }) {
  return (
    <aside className="bg-white p-6 rounded-xl h-fit shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2 border-b border-gray-200 pb-2.5">
        <Icon name="fire" className="text-accent" />
        Media Terpopuler
      </h3>
      <div className="space-y-4">
        {media.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        )}
        {media.map((m, i) => (
          <Link
            key={m.id}
            href={`/media/${m.id}`}
            className="flex gap-2.5 items-center hover:translate-x-1 transition-transform"
          >
            <span className="text-lg font-bold text-gray-300 w-5 shrink-0">
              {i + 1}
            </span>
            <div className="w-[60px] h-[60px] shrink-0 rounded-lg overflow-hidden bg-primary-bg">
              <MediaThumb media={m} className="w-[60px] h-[60px]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-ink leading-snug line-clamp-2">
                {m.title}
              </h4>
              <p className="text-xs text-gray-500">
                {m.mapel} &bull;{" "}
                <Icon name="play" className="text-[0.7rem] inline" />{" "}
                {formatPlays(m.plays)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
