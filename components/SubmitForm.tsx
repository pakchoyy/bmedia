"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeUrl } from "@/lib/utils";
import type { Jenjang, MediaCategory } from "@/types/media";
import Icon from "./Icon";
import ThumbnailUpload from "./ThumbnailUpload";

const MAPEL_OPTIONS = [
  "Matematika",
  "Bahasa Indonesia",
  "IPAS",
  "Bahasa Inggris",
  "Pendidikan Pancasila",
  "PJOK",
  "Seni",
  "Lainnya",
];

const emptyForm = {
  title: "",
  mapel: "",
  mapelCustom: "",
  jenjang: "",
  kelas: "",
  category: "",
  link_url: "",
  thumbnail_url: null as string | null,
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
      if (field === "jenjang") {
        newForm.kelas = "";
      }
      return newForm;
    });
    if (fieldErrors[field]) {
      setFieldErrors((e) => ({ ...e, [field]: "" }));
    }
  };

  const setThumbnail = (url: string | null) =>
    setForm((f) => ({ ...f, thumbnail_url: url }));

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
    if (!form.mapel) errors.mapel = "Mata pelajaran wajib dipilih.";
    if (form.mapel === "Lainnya" && !form.mapelCustom.trim()) errors.mapelCustom = "Isi mata pelajaran manual.";
    if (!form.jenjang) errors.jenjang = "Jenjang wajib dipilih.";
    if (!form.kelas) errors.kelas = "Kelas wajib dipilih.";
    if (!form.category) errors.category = "Tipe media wajib dipilih.";
    if (!form.link_url.trim()) errors.link_url = "Link media wajib diisi.";
    else if (!normalizeUrl(form.link_url)) errors.link_url = "Link media tidak valid.";
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
      const finalMapel = form.mapel === "Lainnya" ? form.mapelCustom.trim() : form.mapel;
      const normalizedLink = normalizeUrl(form.link_url);
      if (!normalizedLink) {
        setError("Link media tidak valid.");
        setSubmitting(false);
        return;
      }
      const { error: insertError } = await supabase.from("media").insert({
        title: form.title.trim(),
        mapel: finalMapel,
        jenjang: form.jenjang as Jenjang,
        kelas: form.kelas.trim(),
        category: form.category as MediaCategory,
        tool: "Lainnya",
        link_url: normalizedLink,
        thumbnail_url: form.thumbnail_url,
        description: form.description.trim(),
        guru_name: form.guru_name.trim(),
        sekolah: form.sekolah.trim() || "-",
        guru_wa: form.guru_wa.trim() || "-",
        status: "pending",
        plays: 0,
      });
      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Gagal mengirim karya: " + insertError.message);
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
  const labelClass = "block font-semibold mb-2 text-ink dark:text-slate-200 text-sm";
  const errorClass = "text-danger text-sm mt-1";
  const rowWhite = "bg-white dark:bg-slate-900";
  const rowGreen = "bg-primary/5 dark:bg-primary/10";

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
      <form onSubmit={handleSubmit} noValidate className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
        {/* Section: Tentang Media */}
        <div className={`${rowWhite} px-8 py-5 max-md:px-5`}>
          <h3 className="text-lg font-bold text-primary dark:text-primary-light flex items-center gap-2">
            <Icon name="book-open" className="text-primary-light" />
            Tentang Media
          </h3>
        </div>
        <div className={`${rowGreen} px-8 py-6 max-md:px-5 space-y-5`}>
          <div>
            <label htmlFor="title" className={labelClass}>Judul Media <span className="text-danger">*</span></label>
            <input id="title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Contoh: Permainan Pecahan" className={inputClass} />
            {fieldErrors.title && <p className={errorClass}>{fieldErrors.title}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mapel" className={labelClass}>Mata Pelajaran <span className="text-danger">*</span></label>
              <select id="mapel" value={form.mapel} onChange={(e) => update("mapel", e.target.value)} className={inputClass}>
                <option value="">Pilih Mata Pelajaran...</option>
                {MAPEL_OPTIONS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              {fieldErrors.mapel && <p className={errorClass}>{fieldErrors.mapel}</p>}
            </div>
            <div>
              {form.mapel === "Lainnya" ? (
                <>
                  <label htmlFor="mapelCustom" className={labelClass}>Isi Mata Pelajaran <span className="text-danger">*</span></label>
                  <input id="mapelCustom" type="text" value={form.mapelCustom} onChange={(e) => update("mapelCustom", e.target.value)} placeholder="Tulis nama mata pelajaran" className={inputClass} />
                  {fieldErrors.mapelCustom && <p className={errorClass}>{fieldErrors.mapelCustom}</p>}
                </>
              ) : (
                <>
                  <label htmlFor="jenjang" className={labelClass}>Jenjang <span className="text-danger">*</span></label>
                  <select id="jenjang" value={form.jenjang} onChange={(e) => update("jenjang", e.target.value)} className={inputClass}>
                    <option value="">Pilih Jenjang...</option>
                    {JENJANG_OPTIONS.map((j) => (<option key={j} value={j}>{j}</option>))}
                  </select>
                  {fieldErrors.jenjang && <p className={errorClass}>{fieldErrors.jenjang}</p>}
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kelas" className={labelClass}>Kelas <span className="text-danger">*</span></label>
              <select id="kelas" value={form.kelas} onChange={(e) => update("kelas", e.target.value)} className={inputClass} disabled={!form.jenjang}>
                <option value="">{form.jenjang ? "Pilih Kelas..." : "Pilih Jenjang terlebih dahulu"}</option>
                {filteredKelasOptions.map((k) => (<option key={k.label} value={k.label}>{k.label}</option>))}
              </select>
              {fieldErrors.kelas && <p className={errorClass}>{fieldErrors.kelas}</p>}
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>Tipe Media <span className="text-danger">*</span></label>
              <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                <option value="">Pilih Tipe Media...</option>
                {CATEGORIES.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
              </select>
              {fieldErrors.category && <p className={errorClass}>{fieldErrors.category}</p>}
            </div>
          </div>
        </div>

        <div className={`${rowWhite} px-8 py-5 max-md:px-5`}>
          <label htmlFor="link_url" className={labelClass}>Link Media <span className="text-danger">*</span></label>
          <input id="link_url" type="text" value={form.link_url} onChange={(e) => update("link_url", e.target.value)} placeholder="https://... atau link apapun" className={inputClass} />
          {fieldErrors.link_url && <p className={errorClass}>{fieldErrors.link_url}</p>}
        </div>

        <div className={`${rowGreen} px-8 py-5 max-md:px-5`}>
          <ThumbnailUpload value={form.thumbnail_url} onChange={setThumbnail} />
          <p className="text-xs text-gray-400 mt-1">Format JPG, JPEG, PNG, atau WebP &middot; maksimal 1,5 MB</p>
        </div>

        <div className={`${rowGreen} px-8 py-5 max-md:px-5`}>
          <label htmlFor="description" className={labelClass}>Deskripsi Singkat <span className="text-danger">*</span></label>
          <textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Jelaskan singkat tentang media ini..." className={`${inputClass} resize-y min-h-[100px]`} />
          {fieldErrors.description && <p className={errorClass}>{fieldErrors.description}</p>}
        </div>

        {/* Section: Tentang Pembuat */}
        <div className={`${rowWhite} px-8 py-5 max-md:px-5`}>
          <h3 className="text-lg font-bold text-primary dark:text-primary-light flex items-center gap-2">
            <Icon name="user-tie" className="text-primary-light" />
            Tentang Pembuat
          </h3>
        </div>
        <div className={`${rowGreen} px-8 py-6 max-md:px-5 space-y-5`}>
          <div>
            <label htmlFor="guru_name" className={labelClass}>Nama Guru <span className="text-danger">*</span></label>
            <input id="guru_name" type="text" value={form.guru_name} onChange={(e) => update("guru_name", e.target.value)} placeholder="Contoh: Budi Santoso, S.Pd" className={inputClass} />
            {fieldErrors.guru_name && <p className={errorClass}>{fieldErrors.guru_name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sekolah" className={labelClass}>Asal Sekolah <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input id="sekolah" type="text" value={form.sekolah} onChange={(e) => update("sekolah", e.target.value)} placeholder="Contoh: SDN 1 Nusantara" className={inputClass} />
            </div>
            <div>
              <label htmlFor="guru_wa" className={labelClass}>WhatsApp <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input id="guru_wa" type="tel" value={form.guru_wa} onChange={(e) => update("guru_wa", e.target.value)} placeholder="081234567890" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 my-4 bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
            <Icon name="xmark" className="text-lg shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className={`${rowWhite} px-8 py-6 max-md:px-5`}>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-success hover:bg-green-700 text-white py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {submitting ? (
              <><Icon name="hourglass" className="animate-pulse" /> Mengirim...</>
            ) : (
              <><Icon name="paper-plane" /> Kirim Media Pembelajaran</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
