"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Media, MediaStatus } from "@/types/media";
import { approveSubmission, rejectSubmission } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import RejectDialog from "./RejectDialog";
import MediaThumb from "../MediaThumb";
import Icon from "../Icon";
import Toast from "../Toast";

type Filter = "semua" | MediaStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "semua", label: "Semua" },
];

export default function SubmissionTable({
  media,
  initialStatus,
}: {
  media: Media[];
  initialStatus?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>(
    (initialStatus as Filter) && (["pending", "approved", "rejected", "semua"] as Filter[]).includes(
      initialStatus as Filter
    )
      ? (initialStatus as Filter)
      : "pending"
  );
  const [query, setQuery] = useState("");
  const [mapelFilter, setMapelFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("");
  const [rejectTarget, setRejectTarget] = useState<Media | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);

  const mapelOptions = useMemo(() => Array.from(new Set(media.map((m) => m.mapel))).sort(), [media]);
  const kategoriOptions = useMemo(() => Array.from(new Set(media.map((m) => m.category))).sort(), [media]);
  const jenjangOptions = useMemo(() => Array.from(new Set(media.map((m) => m.jenjang))).sort(), [media]);

  const filtered = useMemo(() => {
    let list = [...media];
    if (filter !== "semua") list = list.filter((m) => m.status === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.guru_name.toLowerCase().includes(q) ||
          m.sekolah.toLowerCase().includes(q)
      );
    }
    if (mapelFilter) list = list.filter((m) => m.mapel === mapelFilter);
    if (kategoriFilter) list = list.filter((m) => m.category === kategoriFilter);
    if (jenjangFilter) list = list.filter((m) => m.jenjang === jenjangFilter);
    return list;
  }, [media, filter, query, mapelFilter, kategoriFilter, jenjangFilter]);

  const hasExtraFilter = !!mapelFilter || !!kategoriFilter || !!jenjangFilter;

  const notify = (msg: string, isError = false) => {
    setToastError(isError);
    setToast(msg);
  };

  const handleApprove = async (m: Media) => {
    setBusy(true);
    const res = await approveSubmission(m.id);
    setBusy(false);
    if (res.ok) {
      notify("Karya berhasil disetujui dan tampil di website.");
      router.refresh();
    } else {
      notify(res.error, true);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setBusy(true);
    const res = await rejectSubmission(rejectTarget.id, reason);
    setBusy(false);
    setRejectTarget(null);
    if (res.ok) {
      notify("Karya berhasil ditolak.");
      router.refresh();
    } else {
      notify(res.error, true);
    }
  };

  return (
    <div>
      {/* Status filter + Search */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-primary-light text-white"
                    : "bg-white text-ink border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 sm:ml-auto flex-1 sm:max-w-xs">
            <Icon name="magnifying-glass" className="text-gray-400 shrink-0 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, guru, sekolah..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Extra filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={mapelFilter}
            onChange={(e) => setMapelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 outline-none"
          >
            <option value="">Semua Mapel</option>
            {mapelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 outline-none"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 outline-none"
          >
            <option value="">Semua Jenjang</option>
            {jenjangOptions.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          {hasExtraFilter && (
            <button
              onClick={() => { setMapelFilter(""); setKategoriFilter(""); setJenjangFilter(""); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
            >
              Reset Filter
            </button>
          )}
          <span className="text-xs text-gray-500 ml-auto">{filtered.length} media</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-semibold">Media</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Guru</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Mapel</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Jenjang</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Kategori</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Tanggal</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-primary-bg shrink-0">
                        <MediaThumb media={m} className="w-12 h-9" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/submissions/${m.id}`}
                          className="font-semibold text-ink hover:text-primary-light line-clamp-1"
                        >
                          {m.title}
                        </Link>
                        <div className="text-xs text-gray-500 md:hidden">
                          {m.guru_name} &middot; {m.sekolah}
                        </div>
                        <div className="text-xs text-gray-400 lg:hidden">
                          {m.mapel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {m.guru_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {m.mapel}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {m.jenjang}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">
                    {m.category}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">
                    {formatDate(m.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/submissions/${m.id}`}
                        className="p-2 rounded-lg text-primary hover:bg-primary-light/10 transition-colors"
                        title="Lihat detail"
                        aria-label={`Lihat detail ${m.title}`}
                      >
                        <Icon name="book" />
                      </Link>
                      {m.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(m)}
                            disabled={busy}
                            className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                            title="Approve"
                            aria-label={`Setujui ${m.title}`}
                          >
                            <Icon name="check" />
                          </button>
                          <button
                            onClick={() => setRejectTarget(m)}
                            disabled={busy}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                            title="Reject"
                            aria-label={`Tolak ${m.title}`}
                          >
                            <Icon name="xmark" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Tidak ada submission yang cocok.
          </p>
        )}
      </div>

      <RejectDialog
        open={Boolean(rejectTarget)}
        title={rejectTarget?.title ?? ""}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
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
