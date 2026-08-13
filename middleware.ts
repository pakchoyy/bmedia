import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

export async function middleware(request: NextRequest) {
  // Jangan crash saat env belum dikonfigurasi (mis. dev lokal).
  if (!CONFIGURED) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === "/admin/login";

  // Belum login → arahkan ke halaman login (kecuali memang di login).
  if (!user && !isLoginPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Catatan: pengecekan role admin tidak dilakukan di middleware.
  // User yang sudah login namun bukan admin akan ditolak oleh requireAdmin()
  // di server component (lib/admin.ts). Ini menghindari redirect loop.
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
