"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin";
import { createServerSideClient } from "@/lib/supabase-server";
import { isValidUrl } from "@/lib/utils";
import type { Jenjang, MediaCategory } from "@/types/media";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function guard(): Promise<ActionResult | null> {
  const session = await getCurrentAdmin();
  if (!session) {
    return { ok: false, error: "Tidak memiliki akses admin. Silakan login ulang." };
  }
  return null;
}

export async function approveSubmission(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createServerSideClient();
  const { error } = await supabase
    .from("media")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", id);

  if (error) {
    console.error("approveSubmission error:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}

export async function rejectSubmission(
  id: string,
  reason: string
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!reason.trim()) {
    return { ok: false, error: "Alasan penolakan wajib diisi." };
  }

  const supabase = createServerSideClient();
  const { error } = await supabase
    .from("media")
    .update({ status: "rejected", rejection_reason: reason.trim() })
    .eq("id", id);

  if (error) {
    console.error("rejectSubmission error:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  return { ok: true };
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createServerSideClient();
  const { error } = await supabase.from("media").delete().eq("id", id);

  if (error) {
    console.error("deleteMedia error:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}

export interface MediaEditInput {
  title: string;
  description: string;
  mapel: string;
  jenjang: Jenjang;
  kelas: string;
  category: MediaCategory;
  tool: string;
  link_url: string;
  thumbnail_url: string;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
}

export async function updateMedia(
  id: string,
  input: MediaEditInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!isValidUrl(input.link_url)) {
    return { ok: false, error: "Link media tidak valid." };
  }
  if (input.thumbnail_url && !isValidUrl(input.thumbnail_url)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  const supabase = createServerSideClient();
  const { error } = await supabase
    .from("media")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      mapel: input.mapel.trim(),
      jenjang: input.jenjang,
      kelas: input.kelas.trim(),
      category: input.category,
      tool: input.tool.trim(),
      link_url: input.link_url.trim(),
      thumbnail_url: input.thumbnail_url.trim() || null,
      guru_name: input.guru_name.trim(),
      sekolah: input.sekolah.trim(),
      guru_wa: input.guru_wa.trim(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateMedia error:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/submissions/" + id);
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}
