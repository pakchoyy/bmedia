// Dipakai bersama di browser & server: format soal, validasi, impor CSV.

export interface Soal {
  q: string;
  o: string[]; // 4 atau 5 pilihan (A–D atau A–E)
  a: number; // indeks jawaban benar 0-3
}

export interface QuestionSet {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  questions: Soal[];
  code: string;
  game: string;
  plays: number;
  updated_at: string;
}

export const MAX_SOAL = 200;
export const MAX_TEKS = 300;

/** Bersihkan & validasi daftar soal. Mengembalikan pesan error pertama jika tidak valid. */
export function validateSoal(input: unknown): { ok: true; soal: Soal[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "Format soal tidak valid." };
  if (input.length > MAX_SOAL) return { ok: false, error: `Maksimal ${MAX_SOAL} soal per set.` };
  const out: Soal[] = [];
  for (let i = 0; i < input.length; i++) {
    const it = input[i] as Partial<Soal>;
    const n = i + 1;
    const q = String(it?.q ?? "").trim();
    const o = Array.isArray(it?.o) ? it.o.map((x) => String(x ?? "").trim()) : [];
    const a = Number(it?.a);
    if (!q) return { ok: false, error: `Soal no. ${n}: pertanyaan masih kosong.` };
    if ((o.length !== 4 && o.length !== 5) || o.some((x) => !x)) return { ok: false, error: `Soal no. ${n}: pilihan jawaban harus 4 atau 5 dan semuanya terisi.` };
    if (!Number.isInteger(a) || a < 0 || a >= o.length) return { ok: false, error: `Soal no. ${n}: pilih jawaban yang benar.` };
    if (q.length > MAX_TEKS || o.some((x) => x.length > MAX_TEKS)) return { ok: false, error: `Soal no. ${n}: teks terlalu panjang (maks ${MAX_TEKS} karakter).` };
    out.push({ q, o, a });
  }
  return { ok: true, soal: out };
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const sep = text.split("\n")[0].includes(";") && !text.split("\n")[0].includes(",") ? ";" : ",";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (c === '"' && quoted && n === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === sep && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && n === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

/**
 * Impor CSV: kolom pertanyaan, A, B, C, D, [E], jawaban (A–D atau A–E).
 * Baris judul dilewati otomatis. Pemisah koma atau titik koma (Excel Indonesia).
 */
export function parseCsvSoal(text: string): { soal: Soal[]; skipped: number } {
  const rows = parseCsvRows(text.replace(/^﻿/, ""));
  const soal: Soal[] = [];
  let skipped = 0;
  rows.forEach((r, idx) => {
    const t = (i: number) => String(r[i] ?? "").trim();
    // Format 7 kolom: pertanyaan,A,B,C,D,E,jawaban (E boleh kosong = 4 pilihan)
    // Format 6 kolom: pertanyaan,A,B,C,D,jawaban
    const seven = r.length >= 7 && /^[A-Ea-e]$/.test(t(6));
    const ans = "ABCDE".indexOf((seven ? t(6) : t(5)).toUpperCase());
    const opts = [t(1), t(2), t(3), t(4)];
    if (seven && t(5)) opts.push(t(5));
    if (r.length >= 6 && t(0) && opts.every(Boolean) && ans >= 0 && ans < opts.length) {
      soal.push({ q: t(0), o: opts, a: ans });
    } else if (idx > 0) {
      skipped++;
    }
  });
  return { soal, skipped };
}

export const CSV_TEMPLATE =
  "pertanyaan,A,B,C,D,E,jawaban\n" +
  '"Hewan yang mengalami metamorfosis sempurna adalah ...",Kupu-kupu,Kucing,Ayam,Kambing,,A\n' +
  '"Hasil dari 8 x 7 adalah ... (contoh 5 pilihan)",54,56,64,48,58,B\n';

// Kode kelas: tanpa huruf/angka yang mirip (0/O, 1/I/L)
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

export function normalizeCode(code: string): string {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && code.split("").every((c) => CODE_ALPHABET.includes(c));
}

export function randomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
