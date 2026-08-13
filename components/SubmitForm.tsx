"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { isValidUrl } from "@/lib/utils";
import type { Jenjang } from "@/types/media";
import Icon from "./Icon";

const emptyForm = {
  title: "",
  mapel: "",
  jenjang: "",
  kelas: "",
  link_url: "",
  description: "",
  guru_name: "",
  sekolah: "",
  guru_wa: "",
};

type FormState = typeof emptyForm;
type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function SubmitForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => {
      const newForm = { ...f, [field]: value };
      // Reset kelas ketika jenjang berubah
      if (field === "jenjang") {
        newForm.kelas = "";
      }
      return newForm;
    });
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((e) => ({ ...e, [field]: "" }));
    }
  };

  // Filter kelas options berdasarkan jenjang
  const filteredKelasOptions = useMemo(() => {
    if (!form.jenjang) return KELAS_OPTIONS;

    const jenjangMap: Record<string, string[]> = {
      TK: ["TK/PAUD"],
      SD: ["SD/MI"],
      SMP: ["SMP/MTs"],
      SMA: ["SMA/SMK/MA"],
      SMK: ["SMA/SMK/MA"],
      Umum: [""],
    };

    const allowedGroups = jenjangMap[form.jenjang] || [];
    return KELAS_OPTIONS.filter((k) => allowedGroups.includes(k.group));
  }, [form.jenjang]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!form.title.trim()) errors.title = "Judul media wajib diisi.";
    if (!form.mapel.trim()) errors.mapel = "Mata pelajaran wajib diisi.";
    if (!form.jenjang) errors.jenjang = "Jenjang wajib dipilih.";
    if (!form.kelas) errors.kelas = "Kelas wajib dipilih.";
    if (!form.link_url.trim()) {
      errors.link_url = "Link media wajib diisi.";
    } else if (!isValidUrl(form.link_url.trim())) {
      errors.link_url = "Masukkan link media yang valid (harus dimulai dengan http:// atau https://).";
    }
    if (!form.description.trim()) errors.description = "Deskripsi singkat wajib diisi.";
    if (!form.guru_name.trim()) errors.guru_name = "Nama guru wajib diisi.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isSupabaseConfigured()) {
      setError("Sistem belum siap. Silakan hubungi administrator.");
      return;
    }

    if (!validate()) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
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
        category: "Multimedia Interaktif", // Default kategori
        tool: "Lainnya", // Default tool
        link_url: form.link_url.trim(),
        thumbnail_url: null,
        description: form.description.trim(),
        guru_name: form.guru_name.trim(),
        sekolah: form.sekolah.trim() || "-",
        guru_wa: form.guru_wa.trim() || "-",
        status: "pending",
        plays: 0,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Gagal mengirim karya. Silakan coba lagi.");
        return;
      }

      setSuccess(true);
      setForm(emptyForm);
      setFieldErrors({});
    } catch (err) {
      console.error("Submit error:", err);
      setError("Terjadi kesalahan saat mengirim karya. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg text-base bg-white dark:bg-slate-900 dark:text-slate-100 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 outline-none transition";
  const labelClass = "block font-semibold mb-2 text-ink dark:text-slate-200";
  const errorClass = "text-danger text-sm mt-1";

  if (success) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm max-md:p-6">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="circle-check" className="text-5xl text-success" />
          </div>
          <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
            Karya Berhasil Dikirim!
          </h2>
          <p className="text-gray-600 dark:text-slate-300 text-lg mb-6">
            Terima kasih sudah berbagi media pembelajaran. Karya kamu akan ditinjau oleh admin sebelum ditampilkan di website.
          </p>
          <button
            onClick={() => router.push("/catalog")}
            className="inline-flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-8 py-3 rounded-full font-semibold text-base transition-all"
          >
            <Icon name="arrow-left" />
            Kembali ke Media Belajar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 shadow-sm max-md:p-6">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Tentang Media */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-primary dark:text-primary-light mb-6 pb-3 border-b border-gray-200 dark:border-slate-800">
              Tentang Media
            </h3>

            {/* Judul Media */}
            <div className="mb-6">
              <label htmlFor="title" className={labelClass}>
                Judul Media <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Contoh: Permainan Pecahan"
                className={inputClass}
              />
              {fieldErrors.title && <p className={errorClass}>{fieldErrors.title}</p>}
            </div>

            {/* Mata Pelajaran & Jenjang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="mapel" className={labelClass}>
                  Mata Pelajaran <span className="text-danger">*</span>
                </label>
                <input
                  id="mapel"
                  type="text"
                  value={form.mapel}
                  onChange={(e) => update("mapel", e.target.value)}
                  placeholder="Contoh: Matematika"
                  className={inputClass}
                />
                {fieldErrors.mapel && <p className={errorClass}>{fieldErrors.mapel}</p>}
              </div>

              <div>
                <label htmlFor="jenjang" className={labelClass}>
                  Jenjang <span className="text-danger">*</span>
                </label>
                <select
                  id="jenjang"
                  value={form.jenjang}
                  onChange={(e) => update("jenjang", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Pilih Jenjang...</option>
                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                {fieldErrors.jenjang && <p className={errorClass}>{fieldErrors.jenjang}</p>}
              </div>
            </div>

            {/* Kelas */}
            <div className="mb-6">
              <label htmlFor="kelas" className={labelClass}>
                Kelas <span className="text-danger">*</span>
              </label>
              <select
                id="kelas"
                value={form.kelas}
                onChange={(e) => update("kelas", e.target.value)}
                className={inputClass}
                disabled={!form.jenjang}
              >
                <option value="">{form.jenjang ? "Pilih Kelas..." : "Pilih Jenjang terlebih dahulu"}</option>
                {filteredKelasOptions.map((k) => (
                  <option key={k.label} value={k.label}>
                    {k.label}
                  </option>
                ))}
              </select>
              {fieldErrors.kelas && <p className={errorClass}>{fieldErrors.kelas}</p>}
            </div>

            {/* Link Media */}
            <div className="mb-6">
              <label htmlFor="link_url" className={labelClass}>
                Link Media <span className="text-danger">*</span>
              </label>
              <input
                id="link_url"
                type="url"
                value={form.link_url}
                onChange={(e) => update("link_url", e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              {fieldErrors.link_url && <p className={errorClass}>{fieldErrors.link_url}</p>}
            </div>

            {/* Deskripsi */}
            <div className="mb-6">
              <label htmlFor="description" className={labelClass}>
                Deskripsi Singkat <span className="text-danger">*</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Jelaskan singkat tentang media ini dan cara menggunakannya..."
                className={`${inputClass} resize-y min-h-[120px]`}
              />
              {fieldErrors.description && <p className={errorClass}>{fieldErrors.description}</p>}
            </div>
          </div>

          {/* Section: Tentang Pembuat */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary dark:text-primary-light mb-6 pb-3 border-b border-gray-200 dark:border-slate-800">
              Tentang Pembuat
            </h3>

            {/* Nama Guru */}
            <div className="mb-6">
              <label htmlFor="guru_name" className={labelClass}>
                Nama Guru <span className="text-danger">*</span>
              </label>
              <input
                id="guru_name"
                type="text"
                value={form.guru_name}
                onChange={(e) => update("guru_name", e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd"
                className={inputClass}
              />
              {fieldErrors.guru_name && <p className={errorClass}>{fieldErrors.guru_name}</p>}
            </div>

            {/* Asal Sekolah */}
            <div className="mb-6">
              <label htmlFor="sekolah" className={labelClass}>
                Asal Sekolah
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Opsional</p>
              <input
                id="sekolah"
                type="text"
                value={form.sekolah}
                onChange={(e) => update("sekolah", e.target.value)}
                placeholder="Contoh: SDN 1 Nusantara"
                className={inputClass}
              />
            </div>

            {/* Nomor WhatsApp */}
            <div className="mb-6">
              <label htmlFor="guru_wa" className={labelClass}>
                Nomor WhatsApp
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Opsional — hanya digunakan jika perlu menghubungi Anda
              </p>
              <input
                id="guru_wa"
                type="tel"
                value={form.guru_wa}
                onChange={(e) => update("guru_wa", e.target.value)}
                placeholder="Contoh: 081234567890"
                className={inputClass}
              />
            </div>
          </div>

          {/* Global Error */}
          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 mb-6 text-sm flex items-start gap-2">
              <Icon name="xmark" className="text-lg shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button - HIJAU */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-success hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {submitting ? (
              <>
                <Icon name="hourglass" className="animate-pulse" />
                Mengirim...
              </>
            ) : (
              <>
                <Icon name="paper-plane" />
                Kirim Media Pembelajaran
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
