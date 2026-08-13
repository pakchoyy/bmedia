"use client";

import Icon from "../Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
  busy = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mx-auto mb-4">
          <Icon name="trash" className="text-xl" />
        </div>
        <h3 className="text-lg font-bold text-ink text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-600 text-center mb-5">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {busy ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
