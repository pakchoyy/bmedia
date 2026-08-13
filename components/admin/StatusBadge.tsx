import type { MediaStatus } from "@/types/media";

const styles: Record<MediaStatus, string> = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

const labels: Record<MediaStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: MediaStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
