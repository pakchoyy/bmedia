"use client";

import { useState } from "react";
import { CODE_LENGTH, normalizeCode } from "@/lib/soal";

export default function JoinCodeForm({ initialError = "" }: { initialError?: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const c = normalizeCode(code);
        if (c.length !== CODE_LENGTH) {
          setError(`Kode terdiri dari ${CODE_LENGTH} huruf/angka.`);
          return;
        }
        // Muat halaman penuh agar elemen layout situs (bar navigasi) tidak ikut ke game
        window.location.assign(`/main/${c}`);
      }}
      className="space-y-3"
    >
      <input
        value={code}
        onChange={(e) => { setCode(normalizeCode(e.target.value)); setError(""); }}
        placeholder="KODE"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        aria-label="Kode kelas"
        className="w-full text-center font-mono text-3xl font-extrabold tracking-[0.3em] uppercase px-4 py-4 nb-sm dark:bg-slate-950 rounded-xl outline-none focus:ring-4 focus:ring-nb-yellow/60"
      />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button className="w-full nb-sm nb-press bg-nb-orange text-nb-ink font-extrabold py-3.5 rounded-xl text-lg">
        Masuk ▶
      </button>
    </form>
  );
}
