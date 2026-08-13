"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";

interface RejectDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  busy?: boolean;
}

export default function RejectDialog({
  open,
  title,
  onClose,
  onConfirm,
  busy = false,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tolak karya"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink">Tolak Karya</h3>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Tutup"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Icon name="xmark" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          <span className="font-semibold text-ink">{title}</span> akan ditolak.
          Berikan alasan penolakan agar guru bisa memperbaiki karyanya.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan penolakan (wajib diisi)..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 min-h-[100px] resize-y"
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={busy || !reason.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {busy ? "Menolak..." : "Tolak Karya"}
          </button>
        </div>
      </div>
    </div>
  );
}
