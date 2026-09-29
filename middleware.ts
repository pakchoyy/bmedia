import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { AdminSessionData } from "@/lib/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "bmedia_admin",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicAdminPath = pathname === "/admin/login" || pathname === "/admin/reset";

  if (!isPublicAdminPath) {
    const res = NextResponse.next({ request });
    const session = await getIronSession<AdminSessionData>(request, res, sessionOptions);
    if (!session.adminId) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return res;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin/:path*"],
};
