"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import Icon from "../Icon";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: signInData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : authError.message
      );
      setLoading(false);
      return;
    }

    const user = signInData.user;
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        setError("Gagal memeriksa role admin: " + profileError.message);
        setLoading(false);
        return;
      }

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setError(
          "Akun ini belum terdaftar sebagai admin. Jalankan: update profiles set role = 'admin' where email = '" +
            email +
            "';  lalu verifikasi: select email, role from profiles;"
        );
        setLoading(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-light/10 text-primary-light flex items-center justify-center mb-3">
            <Icon name="laptop-code" className="text-2xl" />
          </div>
          <h1 className="text-xl font-extrabold text-primary">Bantu Guru Yuk</h1>
          <p className="text-sm text-gray-500">Admin Panel — Masuk</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2 text-primary text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bgy.id"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-semibold mb-2 text-primary text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition"
            />
          </div>

          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm">
              <Icon name="xmark" className="mr-1.5 inline" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-light text-white py-3 rounded-lg font-bold hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <a
          href="/"
          className="block text-center text-sm text-gray-500 mt-6 hover:text-primary-light transition-colors"
        >
          &larr; Kembali ke website
        </a>
      </div>
    </div>
  );
}
