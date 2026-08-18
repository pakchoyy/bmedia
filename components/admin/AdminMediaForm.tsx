"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createMedia,
  updateMedia,
  type ActionResult,
} from "@/app/admin/actions";
import { CATEGORIES, JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";
import type { Jenjang, Media, MediaCategory } from "@/types/media";
import type { ThumbCrop } from "@/lib/storage";
import ThumbnailUpload from "../ThumbnailUpload";
import Icon from "../Icon";

export interface AdminMediaFormProps {
  mode: "create" | "edit";
  media?: Media;
}

export default function AdminMediaForm({ mode, media }: AdminMediaFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() =>
    media
      ? {
          title: media.title,
          description: media.description,
          mapel: media.mapel,
          jenjang: media.jenjang,
          kelas: media.kelas,
          category: media.category,
          tool: media.tool,
          link_url: media.link_url,
          thumbnail_url: media.thumbnail_url,
          thumbnail_position: media.thumbnail_position ?? 50,
          thumbnail_pos_y: media.thumbnail_pos_y ?? 50,
          thumbnail_zoom: media.thumbnail_zoom ?? 1,
          guru_name: media.guru_name,
          sekolah: media.sekolah,
          guru_wa: media.guru_wa,
        }
      : {
          title: "",
          description: "",
          mapel: "",
          jenjang: "",
          kelas: "",
          category: "",
          tool: "Lainnya",
          link_url: "",
          thumbnail_url: null as string | null,
          thumbnail_position: 50,
          thumbnail_pos_y: 50,
          thumbnail_zoom: 1,
          guru_name: "",
          sekolah: "",
          guru_wa: "",
        }
  );

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const input = {
      title: form.title,
      description: form.description,
      mapel: form.mapel,
      jenjang: form.jenjang as Jenjang,
      kelas: form.kelas,
      category: form.category as MediaCategory,
      tool: form.tool,
      link_url: form.link_url,
      thumbnail_url: form.thumbnail_url ?? "",
      thumbnail_position: form.thumbnail_position ?? 50,
      thumbnail_pos_y: form.thumbnail_pos_y ?? 50,
      thumbnail_zoom: form.thumbnail_zoom ?? 1,
      guru_name: form.guru_name,
      sekolah: form.sekolah,
      guru_wa: form.guru_wa,
    };

    let res: ActionResult;
    if (mode === "edit" && media) {
      res = await updateMedia(media.id, input);
    } else {
      res = await createMedia(input);
    }
    setBusy(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(
      mode === "edit" ? `/admin/submissions/${media?.id}` : "/admin/media"
    );
    router.refresh();
  };

  const field =
    "w-full px-4 py-3 border border-gray-300 rounded-lg font-sans text-base focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 outline-none transition";
  const labelCls = "block font-semibold mb-2 text-primary text-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-4"
    >
      <div>
        <label htmlFor="amf-title" className={labelCls}>
          Judul Media <span className="text-danger">*</span>
        </label>
        <input
          id="amf-title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Contoh: Permainan Pecahan"
          className={field}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amf-mapel" className={labelCls}>
            Mata Pelajaran <span className="text-danger">*</span>
          </label>
          <input
            id="amf-mapel"
            value={form.mapel}
            onChange={(e) => update("mapel", e.target.value)}
            placeholder="Contoh: Matematika"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="amf-jenjang" className={labelCls}>
            Jenjang <span className="text-danger">*</span>
          </label>
          <select
            id="amf-jenjang"
            value={form.jenjang}
            onChange={(e) => {
              update("jenjang", e.target.value);
              setForm((f) => ({ ...f, kelas: "" }));
            }}
            className={field}
          >
            <option value="">Pilih Jenjang...</option>
            {JENJANG_OPTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amf-kelas" className={labelCls}>
            Kelas <span className="text-danger">*</span>
          </label>
          <select
            id="amf-kelas"
            value={form.kelas}
            onChange={(e) => update("kelas", e.target.value)}
            disabled={!form.jenjang}
            className={field}
          >
            <option value="">
              {form.jenjang ? "Pilih Kelas..." : "Pilih Jenjang terlebih dahulu"}
            </option>
            <option value="Umum / Semua Kelas">Umum / Semua Kelas</option>
            {KELAS_OPTIONS.map((k) => (
              <option key={k.label} value={k.label}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amf-category" className={labelCls}>
            Tipe Media <span className="text-danger">*</span>
          </label>
          <select
            id="amf-category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={field}
          >
            <option value="">Pilih Tipe Media...</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="amf-link" className={labelCls}>
          Link Media <span className="text-danger">*</span>
        </label>
        <input
          id="amf-link"
          value={form.link_url}
          onChange={(e) => update("link_url", e.target.value)}
          placeholder="https://... atau contoh: misisekolahhijau.vercel.app"
          className={field}
        />
      </div>

      <ThumbnailUpload
        value={form.thumbnail_url}
        onChange={(url) =>
          setForm((f) => ({
            ...f,
            thumbnail_url: url,
            thumbnail_position: 50,
            thumbnail_pos_y: 50,
            thumbnail_zoom: 1,
          }))
        }
        crop={{
          x: form.thumbnail_position,
          y: form.thumbnail_pos_y,
          zoom: form.thumbnail_zoom,
        }}
        onCropChange={(crop: ThumbCrop) =>
          setForm((f) => ({
            ...f,
            thumbnail_position: crop.x,
            thumbnail_pos_y: crop.y,
            thumbnail_zoom: crop.zoom,
          }))
        }
        label="Thumbnail"
      />

      <div>
        <label htmlFor="amf-desc" className={labelCls}>
          Deskripsi Singkat <span className="text-danger">*</span>
        </label>
        <textarea
          id="amf-desc"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${field} resize-y min-h-[120px]`}
        />
      </div>

      <div>
        <label htmlFor="amf-tool" className={labelCls}>
          Dibuat dengan Tool{" "}
          <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <input
          id="amf-tool"
          value={form.tool}
          onChange={(e) => update("tool", e.target.value)}
          placeholder="Contoh: Scratch, Canva, Articulate..."
          className={field}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="amf-guru" className={labelCls}>
            Nama Guru <span className="text-danger">*</span>
          </label>
          <input
            id="amf-guru"
            value={form.guru_name}
            onChange={(e) => update("guru_name", e.target.value)}
            placeholder="Contoh: Budi Santoso, S.Pd"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="amf-sekolah" className={labelCls}>
            Asal Sekolah{" "}
            <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            id="amf-sekolah"
            value={form.sekolah}
            onChange={(e) => update("sekolah", e.target.value)}
            placeholder="Contoh: SDN 1 Nusantara"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="amf-wa" className={labelCls}>
            WhatsApp <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            id="amf-wa"
            value={form.guru_wa}
            onChange={(e) => update("guru_wa", e.target.value)}
            placeholder="081234567890"
            className={field}
          />
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <Icon name="xmark" className="text-lg shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href={mode === "edit" && media ? `/admin/submissions/${media.id}` : "/admin/media"}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {busy ? (
            <>
              <Icon name="hourglass" className="animate-pulse" />
              Menyimpan...
            </>
          ) : mode === "edit" ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Media"
          )}
        </button>
      </div>
    </form>
  );
}