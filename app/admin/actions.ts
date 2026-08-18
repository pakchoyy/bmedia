"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin";
import { createServerSideClient } from "@/lib/supabase-server";
import { normalizeUrl, isValidUrl } from "@/lib/utils";
import { THUMBNAIL_BUCKET, isStoredThumbnail } from "@/lib/storage";
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

async function removeStoredThumbnail(
  supabase: ReturnType<typeof createServerSideClient>,
  thumbnailUrl: string | null | undefined
): Promise<void> {
  if (!isStoredThumbnail(thumbnailUrl)) return;
  const path = (thumbnailUrl as string).split(
    `/object/public/${THUMBNAIL_BUCKET}/`
  )[1];
  if (!path) return;
  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .remove([path]);
  if (error) {
    console.error("remove thumbnail error:", error.message);
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createServerSideClient();
  const { data: existing } = await supabase
    .from("media")
    .select("thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("media").delete().eq("id", id);

  if (error) {
    console.error("deleteMedia error:", error.message);
    return { ok: false, error: error.message };
  }

  if (existing?.thumbnail_url) {
    await removeStoredThumbnail(supabase, existing.thumbnail_url);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/media");
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
  thumbnail_position?: number | null;
  thumbnail_pos_y?: number | null;
  thumbnail_zoom?: number | null;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
}

export async function createMedia(
  input: MediaEditInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const title = input.title.trim();
  const description = input.description.trim();
  const mapel = input.mapel.trim();
  const kelas = input.kelas.trim();
  const tool = input.tool.trim();
  const guruName = input.guru_name.trim();
  const sekolah = input.sekolah.trim();
  const guruWa = input.guru_wa.trim();

  if (!title) return { ok: false, error: "Judul media wajib diisi." };
  if (!mapel) return { ok: false, error: "Mata pelajaran wajib diisi." };
  if (!jenjangOptions.includes(input.jenjang)) {
    return { ok: false, error: "Jenjang tidak valid." };
  }
  if (!kelas) return { ok: false, error: "Kelas wajib diisi." };
  if (!categoryOptions.includes(input.category)) {
    return { ok: false, error: "Tipe media tidak valid." };
  }
  if (!description) return { ok: false, error: "Deskripsi wajib diisi." };
  if (!guruName) return { ok: false, error: "Nama guru wajib diisi." };

  const normalizedLink = normalizeUrl(input.link_url);
  if (!normalizedLink) {
    return { ok: false, error: "Link media tidak valid." };
  }
  const thumbnail =
    input.thumbnail_url && input.thumbnail_url.trim()
      ? input.thumbnail_url.trim()
      : null;
  if (thumbnail && !isValidUrl(thumbnail) && !isStoredThumbnail(thumbnail)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  const supabase = createServerSideClient();

  const insertPayload: Record<string, unknown> = {
    title,
    description,
    mapel,
    jenjang: input.jenjang,
    kelas,
    category: input.category,
    tool: tool || "Lainnya",
    link_url: normalizedLink,
    thumbnail_url: thumbnail,
    thumbnail_position: input.thumbnail_position ?? 50,
    guru_name: guruName,
    sekolah: sekolah || "-",
    guru_wa: guruWa || "-",
    status: "approved",
    plays: 0,
  };

  const withCropFields = {
    ...insertPayload,
    thumbnail_pos_y: input.thumbnail_pos_y ?? 50,
    thumbnail_zoom: input.thumbnail_zoom ?? 1,
  };

  let { error } = await supabase.from("media").insert(withCropFields);

  if (error && /column.*does not exist/i.test(error.message)) {
    ({ error } = await supabase.from("media").insert(insertPayload));
  }

  if (error) {
    console.error("createMedia error:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}

export async function updateMedia(
  id: string,
  input: MediaEditInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const normalizedLink = normalizeUrl(input.link_url);
  if (!normalizedLink) {
    return { ok: false, error: "Link media tidak valid." };
  }
  const thumbnail =
    input.thumbnail_url && input.thumbnail_url.trim()
      ? input.thumbnail_url.trim()
      : null;
  if (thumbnail && !isValidUrl(thumbnail) && !isStoredThumbnail(thumbnail)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  const supabase = createServerSideClient();
  const { data: existing } = await supabase
    .from("media")
    .select("thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  const updatePayload: Record<string, unknown> = {
    title: input.title.trim(),
    description: input.description.trim(),
    mapel: input.mapel.trim(),
    jenjang: input.jenjang,
    kelas: input.kelas.trim(),
    category: input.category,
    tool: input.tool.trim(),
    link_url: normalizedLink,
    thumbnail_url: thumbnail,
    thumbnail_position: input.thumbnail_position ?? 50,
    guru_name: input.guru_name.trim(),
    sekolah: input.sekolah.trim(),
    guru_wa: input.guru_wa.trim(),
  };

  const withCropFields = {
    ...updatePayload,
    thumbnail_pos_y: input.thumbnail_pos_y ?? 50,
    thumbnail_zoom: input.thumbnail_zoom ?? 1,
  };

  let { error } = await supabase
    .from("media")
    .update(withCropFields)
    .eq("id", id);

  if (error && /column.*does not exist/i.test(error.message)) {
    ({ error } = await supabase
      .from("media")
      .update(updatePayload)
      .eq("id", id));
  }

  if (error) {
    console.error("updateMedia error:", error.message);
    return { ok: false, error: error.message };
  }

  if (
    existing?.thumbnail_url &&
    existing.thumbnail_url !== thumbnail &&
    isStoredThumbnail(existing.thumbnail_url)
  ) {
    await removeStoredThumbnail(supabase, existing.thumbnail_url);
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/submissions/" + id);
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}

const jenjangOptions: Jenjang[] = ["TK", "SD", "SMP", "SMA", "SMK", "Umum"];
const categoryOptions: MediaCategory[] = [
  "Laboratorium Maya",
  "Multimedia Interaktif",
  "Game Edukasi",
  "Quiz Interaktif",
  "Modul Digital",
  "Video Pembelajaran Interaktif",
  "Lainnya",
];
