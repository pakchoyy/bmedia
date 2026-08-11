"use client";

import { useState } from "react";
import { CATEGORIES, JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { isValidUrl } from "@/lib/utils";
import type { Jenjang, MediaCategory } from "@/types/media";
import Icon from "./Icon";
import Toast from "./Toast";

const emptyForm = {
  guru_name: "",
  sekolah: "",
  guru_wa: "",
  title: "",
  mapel: "",
  jenjang: "",
  kelas: "",
  category: "",
  tool: "",
  link_url: "",
  thumbnail_url: "",
  description: "",
};

type FormState = typeof emptyForm;

export default function SubmitForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setToast("");

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local."
      );
      return;
    }

    if (form.thumbnail_url && !isValidUrl(form.thumbnail_url)) {
      setError("URL thumbnail tidak valid. Pastikan dimulai dengan http:// atau https://");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("media").insert({
        title: form.title.trim(),
        mapel: form.mapel.trim(),
        jenjang: form.jenjang as Jenjang,
        kelas: form.kelas.trim(),
        category: form.category as MediaCategory,
        tool: form.tool.trim(),
        link_url: form.link_url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        description: form.description.trim(),
        guru_name: form.guru_name.trim(),
        sekolah: form.sekolah.trim(),
        guru_wa: form.guru_wa.trim(),
        status: "pending",
        plays: 0,
      });

      if (insertError) {
        setError(`Gagal mengirim data: ${insertError.message}`);
        return;
      }

      setSuccess(true);
      setToast("Berhasil! Media Anda telah dikirim dan menunggu tinjauan Admin.");
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full px-4 py-3 border border-gray-300 rounded-lg font-sans text-base focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 outline-none transition";

  const labelCls = "block font-semibold mb-2 text-primary";

  return (
    <>
      <div className="max-w-[800px] mx-auto bg-pagebg p-8 rounded-[15px] shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-6">
              <label htmlFor="guru_name" className={labelCls}>
                Nama Guru *
              </label>
              <input
                id="guru_name"
                type="text"
                required
                value={form.guru_name}
                onChange={(e) => update("guru_name", e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd"
                className={field}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="sekolah" className={labelCls}>
                Asal Sekolah *
              </label>
              <input
                id="sekolah"
                type="text"
                required
                value={form.sekolah}
                onChange={(e) => update("sekolah", e.target.value)}
                placeholder="Contoh: SDN 1 Nusantara"
                className={field}
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="guru_wa" className={labelCls}>
              Nomor WhatsApp *
            </label>
            <input
              id="guru_wa"
              type="text"
              required
              value={form.guru_wa}
              onChange={(e) => update("guru_wa", e.target.value)}
              placeholder="Contoh: 081234567890"
              className={field}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="title" className={labelCls}>
              Judul Media *
            </label>
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Contoh: Petualangan Pecahan"
              className={field}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-6">
              <label htmlFor="mapel" className={labelCls}>
                Mata Pelajaran (Materi Pembelajaran) *
              </label>
              <input
                id="mapel"
                type="text"
                required
                value={form.mapel}
                onChange={(e) => update("mapel", e.target.value)}
                placeholder="Contoh: Matematika, IPA, Pengenalan Warna"
                className={field}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="jenjang" className={labelCls}>
                Jenjang *
              </label>
              <select
                id="jenjang"
                required
                value={form.jenjang}
                onChange={(e) => update("jenjang", e.target.value)}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-6">
              <label htmlFor="kelas" className={labelCls}>
                Kelas *
              </label>
              <select
                id="kelas"
                required
                value={form.kelas}
                onChange={(e) => update("kelas", e.target.value)}
                className={field}
              >
                <option value="">Pilih Kelas...</option>
                {KELAS_OPTIONS.map((k, idx) => {
                  const prev = idx === 0 ? null : KELAS_OPTIONS[idx - 1].group;
                  if (k.group === "" || k.group !== prev) {
                    return (
                      <optgroup key={k.group || "Umum"} label={k.group || "Umum / Semua Kelas"}>
                        {KELAS_OPTIONS.filter((o) => o.group === k.group).map(
                          (o) => (
                            <option key={o.label} value={o.label}>
                              {o.label}
                            </option>
                          )
                        )}
                      </optgroup>
                    );
                  }
                  return null;
                })}
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="category" className={labelCls}>
                Kategori *
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={field}
              >
                <option value="">Pilih Kategori...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="tool" className={labelCls}>
              Dibuat dengan (Tool) *
            </label>
            <input
              id="tool"
              type="text"
              required
              value={form.tool}
              onChange={(e) => update("tool", e.target.value)}
              placeholder="Contoh: Scratch, Canva, Genially, H5P, HTML5"
              className={field}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="link_url" className={labelCls}>
              Link Media (URL) *
            </label>
            <input
              id="link_url"
              type="url"
              required
              value={form.link_url}
              onChange={(e) => update("link_url", e.target.value)}
              placeholder="https://... link hosting media interaktif (Scratch, Canva, Genially, dll)"
              className={field}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="thumbnail_url" className={labelCls}>
              URL Thumbnail / Screenshot (Opsional)
            </label>
            <input
              id="thumbnail_url"
              type="url"
              value={form.thumbnail_url}
              onChange={(e) => update("thumbnail_url", e.target.value)}
              placeholder="https://... (disarankan, jika tidak diisi akan memakai placeholder otomatis)"
              className={field}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className={labelCls}>
              Deskripsi Singkat *
            </label>
            <textarea
              id="description"
              required
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Jelaskan cara penggunaan dan tujuan pembelajaran dari media ini..."
              className={`${field} resize-y min-h-[120px]`}
            />
          </div>

          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 mb-4 text-sm">
              <Icon name="xmark" className="mr-1.5 inline" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 text-success border border-success/30 rounded-lg px-4 py-3 mb-4 text-sm">
              <Icon name="circle-check" className="mr-1.5 inline" />
              Berhasil! Media Anda telah dikirim dan menunggu tinjauan Admin.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-success text-white py-4 rounded-lg text-xl font-bold mt-4 transition-colors hover:bg-green-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Icon name="paper-plane" />
            {submitting ? "Mengirim..." : "Kirim Media Pembelajaran"}
          </button>
        </form>
      </div>

      <Toast message={toast} visible={Boolean(toast)} />
    </>
  );
}
