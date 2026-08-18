"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { THUMBNAIL_BUCKET, thumbnailPublicUrl } from "@/lib/storage";
import { thumbCropStyle, clampCrop, type ThumbCrop } from "@/lib/storage";
import Icon from "./Icon";

const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

interface ThumbnailUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  crop?: ThumbCrop;
  onCropChange?: (crop: ThumbCrop) => void;
}

const DEFAULT_CROP: ThumbCrop = { x: 50, y: 50, zoom: 1 };

export default function ThumbnailUpload({
  value,
  onChange,
  label = "Thumbnail (opsional)",
  crop = DEFAULT_CROP,
  onCropChange,
}: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const displayUrl = preview ?? value;
  const activeCrop = clampCrop(crop);

  const cropStyle = thumbCropStyle({
    thumbnail_position: activeCrop.x,
    thumbnail_pos_y: activeCrop.y,
    thumbnail_zoom: activeCrop.zoom,
  });

  // Revoke object URL yang tidak dipakai agar tidak bocor memori.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pickFile = (file: File | null) => {
    setError("");
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      setError(
        "Format gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP."
      );
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran gambar maksimal 1,5 MB.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    if (onCropChange) onCropChange({ ...DEFAULT_CROP });
    void uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!isSupabaseConfigured()) {
      setError("Sistem penyimpanan belum siap. Silakan hubungi administrator.");
      return;
    }
    setUploading(true);
    try {
      const ext = EXT_BY_MIME[file.type] ?? "jpg";
      const name = `thumb-${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(name, file, {
          contentType: file.type,
          cacheControl: "3600",
        });
      if (error) {
        console.error("Thumbnail upload error:", error.message);
        setError(
          "Gagal mengunggah thumbnail. Pastikan bucket storage sudah dibuat atau coba lagi."
        );
        return;
      }
      onChange(thumbnailPublicUrl(name));
    } catch (err) {
      console.error("Thumbnail upload exception:", err);
      setError("Gagal mengunggah thumbnail. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setError("");
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    onChange(null);
    if (onCropChange) onCropChange({ ...DEFAULT_CROP });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if (!onCropChange) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      x: activeCrop.x,
      y: activeCrop.y,
    };
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!onCropChange || !dragState.current) return;
    const box = previewRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const factor = 100 / box.width / activeCrop.zoom;
    onCropChange(
      clampCrop({
        x: dragState.current.x + dx * factor,
        y: dragState.current.y + dy * factor,
        zoom: activeCrop.zoom,
      })
    );
  };

  const handleDragEnd = () => {
    dragState.current = null;
  };

  return (
    <div>
      <label className="block font-semibold mb-2 text-ink dark:text-slate-200 text-sm">
        {label} <span className="text-gray-400 font-normal">(opsional)</span>
      </label>

      {displayUrl ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-40">
              <div
                ref={previewRef}
                className="relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-gray-300 dark:border-slate-700 select-none"
                style={{ cursor: onCropChange ? "grab" : "default", touchAction: "none" }}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                title={onCropChange ? "Seret untuk menggeser gambar" : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt="Pratinjau thumbnail"
                  className="w-full h-full object-cover pointer-events-none"
                  style={cropStyle}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-center">
                Seret gambar untuk menggeser
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-pagebg text-primary border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <Icon name="cloud-arrow-up" />
                {uploading ? "Mengunggah..." : "Ganti Gambar"}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-danger border border-danger/40 hover:bg-danger/10 transition-colors disabled:opacity-60"
              >
                <Icon name="trash" />
                Hapus Gambar
              </button>
            </div>
          </div>

          {onCropChange && (
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Zoom gambar
                </span>
                <span className="text-xs text-gray-400">
                  {activeCrop.zoom.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={activeCrop.zoom}
                onChange={(e) =>
                  onCropChange(
                    clampCrop({ ...activeCrop, zoom: Number(e.target.value) })
                  )
                }
                className="w-full accent-[#0ea5a0]"
                aria-label="Zoom thumbnail"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Pas</span>
                <span>Dekat</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-8 text-left hover:border-primary-light hover:bg-primary/5 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Icon name="hourglass" className="text-3xl text-primary-light animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                Mengunggah...
              </span>
            </>
          ) : (
            <>
              <Icon name="cloud-arrow-up" className="text-3xl text-primary-light" />
              <span className="text-sm font-semibold text-primary">
                Pilih gambar dari perangkat
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                JPG, JPEG, PNG, atau WebP &middot; maksimal 1,5 MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        id="thumbnail-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="text-danger text-sm mt-1">{error}</p>
      )}
    </div>
  );
}