import type { Media } from "@/types/media";
import { CATEGORY_PLACEHOLDER_COLORS } from "@/lib/constants";
import Icon from "./Icon";
import { CATEGORIES } from "@/lib/constants";

interface MediaThumbProps {
  media: Pick<Media, "title" | "thumbnail_url" | "category" | "thumbnail_position">;
  className?: string;
}

export default function MediaThumb({ media, className }: MediaThumbProps) {
  if (media.thumbnail_url) {
    const pos = media.thumbnail_position ?? 50;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.thumbnail_url}
        alt={media.title}
        className={`${className} object-cover w-full h-full`}
        style={{ objectPosition: `${pos}% center` }}
      />
    );
  }

  const color = CATEGORY_PLACEHOLDER_COLORS[media.category] ?? "#0ea5a0";
  const cat = CATEGORIES.find((c) => c.name === media.category);

  return (
    <div
      className={`${className} flex items-center justify-center w-full h-full`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #0d7a8a 100%)`,
      }}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <Icon name={cat?.icon ?? "book-open"} className="text-white/70 text-4xl" />
        <span className="text-white/90 text-sm font-semibold line-clamp-2">
          {media.title}
        </span>
      </div>
    </div>
  );
}
