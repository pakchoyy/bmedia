import type { Media } from "@/types/media";
import { isSupabaseConfigured } from "./supabase";
import { createServerSideClient } from "./supabase-server";

export async function getApprovedMedia(): Promise<Media[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });
  if (error) {
    console.error("getApprovedMedia error:", error.message);
    return [];
  }
  return (data ?? []) as Media[];
}

export async function getMediaById(id: string): Promise<Media | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();
  if (error) {
    console.error("getMediaById error:", error.message);
    return null;
  }
  return data as Media;
}

export async function getTrendingMedia(limit = 5): Promise<Media[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("status", "approved")
    .order("plays", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getTrendingMedia error:", error.message);
    return [];
  }
  return (data ?? []) as Media[];
}

export interface SiteStats {
  totalMedia: number;
  totalTeachers: number;
  totalPlays: number;
}

export async function getSiteStats(): Promise<SiteStats> {
  if (!isSupabaseConfigured()) {
    return { totalMedia: 0, totalTeachers: 0, totalPlays: 0 };
  }
  const supabase = createServerSideClient();
  const { data, error } = await supabase
    .from("media")
    .select("guru_name, plays")
    .eq("status", "approved");
  if (error) {
    console.error("getSiteStats error:", error.message);
    return { totalMedia: 0, totalTeachers: 0, totalPlays: 0 };
  }
  const teachers = new Set((data ?? []).map((m) => m.guru_name));
  const totalPlays = (data ?? []).reduce((acc, m) => acc + (m.plays || 0), 0);
  return {
    totalMedia: (data ?? []).length,
    totalTeachers: teachers.size,
    totalPlays,
  };
}
