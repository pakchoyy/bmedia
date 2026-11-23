"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full px-4 py-3 nb-flat dark:bg-slate-900 rounded-lg text-base outline-none focus:ring-4 focus:ring-nb-yellow/60 transition";

export default function AuthForm({ mode, next = "/guru" }: { mode: "daftar" | "masuk"; next?: string }) {
  const daftar = mode === "daftar";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung. Periksa internet Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto nb bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👩‍🏫</div>
        <h1 className="font-display text-2xl font-bold text-nb-ink dark:text-white">
          {daftar ? "Daftar Akun Guru" : "Masuk Ruang Guru"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {daftar ? "Buat soal sendiri dan bagikan ke murid lewat kode." : "Kelola set soal dan kode kelas Anda."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {daftar && (
          <div>
            <label htmlFor="name" className="block font-semibold mb-1.5 text-sm">Nama</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Bu Sari" autoComplete="name" maxLength={80} className={inputCls} />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block font-semibold mb-1.5 text-sm">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="guru@sekolah.sch.id" autoComplete="email" className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1.5 text-sm">Password</label>
          <input id="password" type="password" required minLength={daftar ? 8 : undefined} value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={daftar ? "Minimal 8 karakter" : "••••••••"}
            autoComplete={daftar ? "new-password" : "current-password"} className={inputCls} />
        </div>

        {error && (
          <div role="alert" className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full nb-sm nb-press bg-nb-orange text-nb-ink py-3 rounded-lg font-bold disabled:opacity-60">
          {loading ? "Memproses..." : daftar ? "Daftar" : "Masuk"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {daftar ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link href={`${daftar ? "/guru/masuk" : "/guru/daftar"}${next !== "/guru" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-nb-orange hover:underline">
          {daftar ? "Masuk" : "Daftar akun"}
        </Link>
      </p>
    </div>
  );
}
