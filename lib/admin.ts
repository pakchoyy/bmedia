import { redirect } from "next/navigation";
import type { Media } from "@/types/media";
import type { AdminStats } from "@/types/admin";
import { sql } from "./db";
import { getSession } from "./session";

export interface AdminSession {
  adminId: string;
  email: string;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const session = await getSession();
    if (!session.adminId || !session.email) return null;
    return { adminId: session.adminId, email: session.email };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getCurrentAdmin();
  if (!session) redirect("/admin/login");
  return session;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const rows = await sql`SELECT status, plays FROM media`;
    const list = rows as { status: string; plays: number }[];
    return {
      totalMedia: list.length,
      pending: list.filter((m) => m.status === "pending").length,
      approved: list.filter((m) => m.status === "approved").length,
      rejected: list.filter((m) => m.status === "rejected").length,
      totalPlays: list.reduce((acc, m) => acc + (m.plays || 0), 0),
    };
  } catch {
    return { totalMedia: 0, pending: 0, approved: 0, rejected: 0, totalPlays: 0 };
  }
}

export async function getAllMediaForAdmin(): Promise<Media[]> {
  try {
    const rows = await sql`SELECT * FROM media ORDER BY submitted_at DESC`;
    return rows as Media[];
  } catch {
    return [];
  }
}

export async function getMediaForAdmin(id: string): Promise<Media | null> {
  try {
    const rows = await sql`SELECT * FROM media WHERE id = ${id} LIMIT 1`;
    return (rows[0] as Media) ?? null;
  } catch {
    return null;
  }
}
