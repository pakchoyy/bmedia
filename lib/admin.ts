import { redirect } from "next/navigation";
import type { Media } from "@/types/media";
import type { AdminStats, Profile } from "@/types/admin";
import { isSupabaseConfigured } from "./supabase";
import { createServerSideClient } from "./supabase-server";

export interface AdminSession {
  profile: Profile;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerSideClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;

  return { profile: profile as Profile };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getCurrentAdmin();
  if (!session) redirect("/admin/login");
  return session;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createServerSideClient();
  const { data, error } = await supabase.from("media").select("status, plays");

  if (error) {
    console.error("getAdminStats error:", error.message);
    return { totalMedia: 0, pending: 0, approved: 0, rejected: 0, totalPlays: 0 };
  }

  const list = data ?? [];
  return {
    totalMedia: list.length,
    pending: list.filter((m) => m.status === "pending").length,
    approved: list.filter((m) => m.status === "approved").length,
    rejected: list.filter((m) => m.status === "rejected").length,
    totalPlays: list.reduce((acc, m) => acc + (m.plays || 0), 0),
  };
}

export async function getAllMediaForAdmin(): Promise<Media[]> {
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("getAllMediaForAdmin error:", error.message);
    return [];
  }
  return (data ?? []) as Media[];
}

export async function getMediaForAdmin(id: string): Promise<Media | null> {
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getMediaForAdmin error:", error.message);
    return null;
  }
  return (data as Media) ?? null;
}
