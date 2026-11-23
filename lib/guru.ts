import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface GuruSessionData {
  guruId?: string;
  name?: string;
  email?: string;
}

export interface Guru {
  guruId: string;
  name: string;
  email: string;
}

// Cookie terpisah dari admin agar dua peran tidak tercampur
const options = {
  password: process.env.SESSION_SECRET!,
  cookieName: "bmedia_guru",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  },
};

export async function getGuruSession() {
  return getIronSession<GuruSessionData>(cookies(), options);
}

export async function getCurrentGuru(): Promise<Guru | null> {
  try {
    const s = await getGuruSession();
    if (!s.guruId || !s.email) return null;
    return { guruId: s.guruId, name: s.name ?? "", email: s.email };
  } catch {
    return null;
  }
}

export async function requireGuru(): Promise<Guru> {
  const g = await getCurrentGuru();
  if (!g) redirect("/guru/masuk");
  return g;
}

/** Tujuan setelah masuk/daftar: hanya halaman /guru internal (cegah open redirect). */
export function safeNext(n?: string | null): string {
  return n && /^\/guru(\/[a-z0-9\-/]*)?(\?game=[a-z0-9-]{1,40})?$/i.test(n) ? n : "/guru";
}
