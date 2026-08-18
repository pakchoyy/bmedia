export type Jenjang = "TK" | "SD" | "SMP" | "SMA" | "SMK" | "Umum";

export type MediaStatus = "pending" | "approved" | "rejected";

export type MediaCategory =
  | "Laboratorium Maya"
  | "Multimedia Interaktif"
  | "Game Edukasi"
  | "Quiz Interaktif"
  | "Modul Digital"
  | "Video Pembelajaran Interaktif"
  | "Lainnya";

export interface Media {
  id: string;
  title: string;
  mapel: string;
  jenjang: Jenjang;
  kelas: string;
  category: MediaCategory;
  tool: string;
  link_url: string;
  thumbnail_url: string | null;
  thumbnail_position?: number | null;
  thumbnail_pos_y?: number | null;
  thumbnail_zoom?: number | null;
  description: string;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
  plays: number;
  status: MediaStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  updated_at?: string | null;
}

export interface MediaInsert {
  title: string;
  mapel: string;
  jenjang: Jenjang;
  kelas: string;
  category: MediaCategory;
  tool: string;
  link_url: string;
  thumbnail_url?: string | null;
  thumbnail_position?: number | null;
  thumbnail_pos_y?: number | null;
  thumbnail_zoom?: number | null;
  description: string;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
  status: "pending";
  plays: 0;
}
