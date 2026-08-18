"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Media } from "@/types/media";
import {
  approveSubmission,
  deleteMedia,
  rejectSubmission,
  updateMedia,
  type MediaEditInput,
} from "@/app/admin/actions";
import { CATEGORIES, JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";
import { formatDate, formatPlays, normalizeUrl } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import RejectDialog from "./RejectDialog";
import ConfirmDialog from "./ConfirmDialog";
import MediaThumb from "../MediaThumb";
import ThumbnailUpload from "../ThumbnailUpload";
import Icon from "../Icon";
import Toast from "../Toast";

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-pagebg rounded-lg px-4 py-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className={`font-semibold text-ink ${mono ? "break-all" : ""}`}>
        {value || "-"}
      </div>
    </div>
  );
}

export default function SubmissionDetail({ media }: { media: Media }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);

  const reviewLink = normalizeUrl(media.link_url);

  const [form, setForm] = useState<MediaEditInput>({
    title: media.title,
    description: media.description,
    mapel: media.mapel,
    jenjang: media.jenjang,
    kelas: media.kelas,
    category: media.category,
    tool: media.tool,
    link_url: media.link_url,
    thumbnail_url: media.thumbnail_url ?? "",
    thumbnail_position: media.thumbnail_position ?? 50,
    thumbnail_pos_y: media.thumbnail_pos_y ?? 50,
    thumbnail_zoom: media.thumbnail_zoom ?? 1,
    guru_name: media.guru_name,
    sekolah: media.sekolah,
    guru_wa: media.guru_wa,
  });

  const notify = (msg: string, isError = false) => {
    setToastError(isError);
    setToast(msg);
  };

  const update = (field: keyof MediaEditInput, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const setThumbnail = (url: string | null) =>
    setForm((f) => ({
      ...f,
      thumbnail_url: url ?? "",
      thumbnail_position: 50,
      thumbnail_pos_y: 50,
      thumbnail_zoom: 1,
    }));

  const handleApprove = async () => {
    setBusy(true);
    const res = await approveSubmission(media.id);
    setBusy(false);
    if (res.ok) {
      notify("Karya berhasil disetujui dan tampil di website.");
      router.refresh();
    } else notify(res.error, true);
  };

  const handleReject = async (reason: string) => {
    setBusy(true);
    const res = await rejectSubmission(media.id, reason);
    setBusy(false);
    setRejectOpen(false);
    if (res.ok) {
      notify("Karya berhasil ditolak.");
      router.refresh();
    } else notify(res.error, true);
  };

  const handleDelete = async () => {
    setBusy(true);
    const res = await deleteMedia(media.id);
    setBusy(false);
    setDeleteOpen(false);
    if (res.ok) {
      notify("Karya berhasil dihapus.");
      router.push("/admin/submissions");
      router.refresh();
    } else notify(res.error, true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await updateMedia(media.id, form);
    setBusy(false);
    if (res.ok) {
      notify("Perubahan berhasil disimpan.");
      setEditing(false);
      router.refresh();
    } else notify(res.error, true);
  };

  const field =
    "w-full px-4 py-3 border border-gray-300 rounded-lg font-sans text-base focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 outline-none transition";
  const labelCls = "block font-semibold mb-2 text-primary text-sm";

  return (
    <div>
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-4 hover:underline"
      >
        <Icon name="arrow-left" /> Kembali ke Submissions
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative w-full h-52 md:h-64">
          <MediaThumb media={media} className="w-full h-full" />
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={media.status} />
                <span className="text-sm text-gray-500">
                  Dikirim {formatDate(media.submitted_at)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
                {media.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {media.status === "pending" && (
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  <Icon name="check" /> Approve
                </button>
              )}
              {(media.status === "pending" || media.status === "approved") && (
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  <Icon name="xmark" /> Reject
                </button>
              )}
              <button
                onClick={() => setEditing((v) => !v)}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-light text-white text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60"
              >
                <Icon name="pen" /> {editing ? "Tutup Edit" : "Edit"}
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-danger text-danger text-sm font-semibold hover:bg-danger hover:text-white transition-colors disabled:opacity-60"
              >
                <Icon name="trash" /> Hapus
              </button>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {media.description}
          </p>

          {media.rejection_reason && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 mb-6">
              <div className="text-sm font-semibold text-danger mb-1">
                Alasan Penolakan
              </div>
              <p className="text-sm text-gray-700">{media.rejection_reason}</p>
            </div>
          )}

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <InfoItem label="Nama Guru" value={media.guru_name} />
            <InfoItem label="Sekolah" value={media.sekolah} />
            <InfoItem label="Nomor WA" value={media.guru_wa} mono />
            <InfoItem label="Mata Pelajaran" value={media.mapel} />
            <InfoItem label="Jenjang" value={media.jenjang} />
            <InfoItem label="Kelas" value={media.kelas} />
            <InfoItem label="Kategori" value={media.category} />
            <InfoItem label="Tool" value={media.tool} />
            <InfoItem label="Plays / Klik" value={formatPlays(media.plays)} />
            <InfoItem label="Link Media" value={media.link_url} mono />
            {media.thumbnail_url && (
              <InfoItem label="Thumbnail" value={media.thumbnail_url} mono />
            )}
          </div>

          {reviewLink ? (
            <a
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e06c0d] transition-colors"
            >
              <Icon name="arrow-up-right-from-square" />
              Buka Link Media untuk Review
              <span className="text-xs opacity-80">(tab baru)</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 bg-danger/10 text-danger px-6 py-3 rounded-lg font-semibold">
              <Icon name="info" />
              Link media tidak valid atau belum diisi.
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-ink mb-5">Edit Metadata</h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className={labelCls}>
                Judul
              </label>
              <input
                id="edit-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={field}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-mapel" className={labelCls}>
                  Mata Pelajaran
                </label>
                <input
                  id="edit-mapel"
                  value={form.mapel}
                  onChange={(e) => update("mapel", e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="edit-guru" className={labelCls}>
                  Nama Guru
                </label>
                <input
                  id="edit-guru"
                  value={form.guru_name}
                  onChange={(e) => update("guru_name", e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="edit-sekolah" className={labelCls}>
                  Sekolah
                </label>
                <input
                  id="edit-sekolah"
                  value={form.sekolah}
                  onChange={(e) => update("sekolah", e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="edit-wa" className={labelCls}>
                  Nomor WA
                </label>
                <input
                  id="edit-wa"
                  value={form.guru_wa}
                  onChange={(e) => update("guru_wa", e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="edit-jenjang" className={labelCls}>
                  Jenjang
                </label>
                <select
                  id="edit-jenjang"
                  value={form.jenjang}
                  onChange={(e) => update("jenjang", e.target.value)}
                  className={field}
                >
                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-kelas" className={labelCls}>
                  Kelas
                </label>
                <select
                  id="edit-kelas"
                  value={form.kelas}
                  onChange={(e) => update("kelas", e.target.value)}
                  className={field}
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k.label} value={k.label}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-category" className={labelCls}>
                  Kategori
                </label>
                <select
                  id="edit-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={field}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-tool" className={labelCls}>
                  Tool
                </label>
                <input
                  id="edit-tool"
                  value={form.tool}
                  onChange={(e) => update("tool", e.target.value)}
                  className={field}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-link" className={labelCls}>
                  Link Media
                </label>
                <input
                  id="edit-link"
                  value={form.link_url}
                  onChange={(e) => update("link_url", e.target.value)}
                  className={field}
                />
              </div>
              <div className="md:col-span-2">
                <ThumbnailUpload
                  value={form.thumbnail_url || null}
                  onChange={setThumbnail}
                  crop={{
                    x: form.thumbnail_position ?? 50,
                    y: form.thumbnail_pos_y ?? 50,
                    zoom: form.thumbnail_zoom ?? 1,
                  }}
                  onCropChange={(crop) =>
                    setForm((f) => ({
                      ...f,
                      thumbnail_position: crop.x,
                      thumbnail_pos_y: crop.y,
                      thumbnail_zoom: crop.zoom,
                    }))
                  }
                  label="Thumbnail"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-desc" className={labelCls}>
                Deskripsi
              </label>
              <textarea
                id="edit-desc"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={`${field} resize-y min-h-[120px]`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-2.5 rounded-lg bg-primary-light text-white text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60"
              >
                {busy ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <RejectDialog
        open={rejectOpen}
        title={media.title}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        busy={busy}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus Karya"
        message={`Apakah Anda yakin ingin menghapus karya "${media.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        busy={busy}
      />

      <Toast
        message={toast}
        visible={Boolean(toast)}
        variant={toastError ? "danger" : "success"}
      />
    </div>
  );
}
