"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setReady(true);
      }
    });
    // getSession menunggu client selesai membaca ?code= / #access_token dari link email.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else
        setLinkError(
          "Link reset tidak valid, sudah kedaluwarsa, atau dibuka di browser lain. Minta link baru dari halaman login."
        );
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== confirm) return setError("Konfirmasi password tidak sama.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/admin");
    router.refresh();
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">
      <h1 className="text-xl font-extrabold text-primary text-center mb-1">Atur Password Baru</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Admin Media Belajar</p>

      {linkError ? (
        <div role="alert" className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm">
          {linkError}
        </div>
      ) : !ready ? (
        <p className="text-sm text-gray-500 text-center" role="status">Memeriksa link...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block font-semibold mb-2 text-primary text-sm">Password baru</label>
            <input id="new-password" type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block font-semibold mb-2 text-primary text-sm">Ulangi password</label>
            <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
          </div>
          {error && (
            <div role="alert" className="bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-light text-white py-3 rounded-lg font-bold hover:bg-primary transition-colors disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      )}

      <a href="/admin/login" className="block text-center text-sm text-gray-500 mt-6 hover:text-primary-light transition-colors">
        &larr; Kembali ke login
      </a>
    </div>
  );
}
