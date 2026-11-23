import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSessionData {
  adminId: string;
  email: string;
}

// Login admin diingat 60 hari per perangkat
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 60;

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  ttl: ADMIN_SESSION_SECONDS,
  cookieName: "bmedia_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: ADMIN_SESSION_SECONDS,
  },
};

export async function getSession() {
  return getIronSession<AdminSessionData>(await cookies(), sessionOptions);
}
