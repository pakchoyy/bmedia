// Dipakai bersama di browser & server: format soal, validasi, impor CSV.

export interface Soal {
  q: string;
  o: [string, string, string, string];
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
    if (o.length !== 4 || o.some((x) => !x)) return { ok: false, error: `Soal no. ${n}: keempat pilihan jawaban wajib diisi.` };
    if (!Number.isInteger(a) || a < 0 || a > 3) return { ok: false, error: `Soal no. ${n}: pilih jawaban yang benar.` };
    if (q.length > MAX_TEKS || o.some((x) => x.length > MAX_TEKS)) return { ok: false, error: `Soal no. ${n}: teks terlalu panjang (maks ${MAX_TEKS} karakter).` };
    out.push({ q, o: o as Soal["o"], a });
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
 * Impor CSV: kolom pertanyaan, A, B, C, D, jawaban (A/B/C/D).
 * Baris judul dilewati otomatis. Pemisah koma atau titik koma (Excel Indonesia).
 */
export function parseCsvSoal(text: string): { soal: Soal[]; skipped: number } {
  const rows = parseCsvRows(text.replace(/^﻿/, ""));
  const soal: Soal[] = [];
  let skipped = 0;
  rows.forEach((r, idx) => {
    const ans = "ABCD".indexOf(String(r[5] ?? "").trim().toUpperCase());
    const cells = r.slice(0, 5).map((x) => String(x ?? "").trim());
    if (r.length >= 6 && cells.every(Boolean) && ans >= 0) {
      soal.push({ q: cells[0], o: [cells[1], cells[2], cells[3], cells[4]], a: ans });
    } else if (idx > 0) {
      skipped++;
    }
  });
  return { soal, skipped };
}

export const CSV_TEMPLATE =
  "pertanyaan,A,B,C,D,jawaban\n" +
  '"Hewan yang mengalami metamorfosis sempurna adalah ...",Kupu-kupu,Kucing,Ayam,Kambing,A\n' +
  '"Hasil dari 8 x 7 adalah ...",54,56,64,48,B\n';

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
