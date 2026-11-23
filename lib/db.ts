import { neon } from "@neondatabase/serverless";

// Query database tidak boleh di-cache oleh Next.js (Data Cache bisa menyimpan
// respons HTTP Neon sehingga halaman menampilkan data basi).
export const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: "no-store" } });
