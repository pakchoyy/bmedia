import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSideClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieNames = cookies()
    .getAll()
    .map((c) => c.name);

  const supabase = createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      loggedIn: false,
      cookies: cookieNames,
      message: "Tidak ada sesi login (session cookie tidak ditemukan/valid).",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    loggedIn: true,
    email: user.email,
    cookies: cookieNames,
    profileFound: Boolean(profile),
    role: profile?.role ?? null,
    isAdmin: profile?.role === "admin",
  });
}