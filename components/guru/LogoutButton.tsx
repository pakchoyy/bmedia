"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/guru/keluar", { method: "POST" });
        router.push("/guru/masuk");
        router.refresh();
      }}
      className="text-sm font-semibold text-gray-500 hover:text-danger"
    >
      Keluar
    </button>
  );
}
