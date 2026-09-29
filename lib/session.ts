import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSessionData {
  adminId: string;
  email: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "bmedia_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  },
};

export async function getSession() {
  return getIronSession<AdminSessionData>(await cookies(), sessionOptions);
}
