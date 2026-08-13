import type { AdminStats } from "@/types/admin";
import Icon from "../Icon";

const items: {
  key: keyof AdminStats;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "totalMedia", label: "Total Media", icon: "laptop-file", color: "text-primary" },
  { key: "pending", label: "Pending", icon: "hourglass", color: "text-accent" },
  { key: "approved", label: "Approved", icon: "check", color: "text-success" },
  { key: "rejected", label: "Rejected", icon: "xmark", color: "text-danger" },
  { key: "totalPlays", label: "Total Plays", icon: "users", color: "text-primary" },
];

export default function AdminStats({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.key}
          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
        >
          <Icon name={item.icon} className={`text-2xl mb-2 ${item.color}`} />
          <div className="text-3xl font-extrabold text-ink leading-none mb-1">
            {stats[item.key].toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
