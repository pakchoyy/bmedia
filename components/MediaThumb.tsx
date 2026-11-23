import type { Media } from "@/types/media";
import { CATEGORY_PLACEHOLDER_COLORS } from "@/lib/constants";
import { thumbCropStyle } from "@/lib/storage";
import Icon from "./Icon";
import { CATEGORIES } from "@/lib/constants";

interface MediaThumbProps {
  media: Pick<
    Media,
    | "title"
    | "thumbnail_url"
    | "category"
    | "thumbnail_position"
    | "thumbnail_pos_y"
    | "thumbnail_zoom"
  >;
  className?: string;
}

export default function MediaThumb({ media, className }: MediaThumbProps) {
  if (media.thumbnail_url) {
    return (
      <div className={`${className} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.thumbnail_url}
          alt={media.title}
          className="object-cover w-full h-full"
          style={thumbCropStyle(media)}
        />
      </div>
    );
  }

  // Sampul otomatis bergaya Main-yuk untuk karya tanpa gambar
  const color = CATEGORY_PLACEHOLDER_COLORS[media.category] ?? "#2ec4b6";
  const cat = CATEGORIES.find((c) => c.name === media.category);

  return (
    <div
      className={`${className} relative flex items-center justify-center w-full h-full overflow-hidden`}
      style={{
        backgroundColor: color,
        backgroundImage: "radial-gradient(rgba(27,26,58,.18) 1.5px, transparent 1.5px)",
        backgroundSize: "14px 14px",
      }}
    >
      <span aria-hidden="true" className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/25" />
      <span aria-hidden="true" className="absolute -left-4 -bottom-5 w-16 h-16 rotate-12 bg-nb-yellow/80 border-2 border-nb-ink" />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <span className="w-12 h-12 rounded-xl bg-white border-[3px] border-nb-ink shadow-[3px_3px_0_#1b1a3a] flex items-center justify-center">
          <Icon name={cat?.icon ?? "book-open"} className="text-nb-ink text-2xl" />
        </span>
        <span className="bg-white border-2 border-nb-ink rounded-lg px-2 py-0.5 text-nb-ink text-xs sm:text-sm font-extrabold line-clamp-2 max-w-full">
          {media.title}
        </span>
      </div>
    </div>
  );
}
