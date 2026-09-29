import type { CSSProperties } from "react";

export function isStoredThumbnail(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("/media/thumbnails/");
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export interface ThumbCrop {
  x: number; // posisi horizontal 0-100 (50 = tengah)
  y: number; // posisi vertikal 0-100 (50 = tengah)
  zoom: number; // skala 1 = pas, lebih besar = lebih dekat
}

export function clampCrop(crop: ThumbCrop): ThumbCrop {
  return {
    x: clamp(Math.round(crop.x), 0, 100),
    y: clamp(Math.round(crop.y), 0, 100),
    zoom: clamp(crop.zoom, 1, 4),
  };
}

/** Gaya CSS untuk menampilkan thumbnail sesuai crop (dipakai MediaThumb & preview). */
export function thumbCropStyle(media: {
  thumbnail_position?: number | null;
  thumbnail_pos_y?: number | null;
  thumbnail_zoom?: number | null;
}): CSSProperties {
  const crop = clampCrop({
    x: media.thumbnail_position ?? 50,
    y: media.thumbnail_pos_y ?? 50,
    zoom: media.thumbnail_zoom ?? 1,
  });
  return {
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: crop.zoom > 1 ? `scale(${crop.zoom})` : undefined,
    transformOrigin: `${crop.x}% ${crop.y}%`,
  };
}