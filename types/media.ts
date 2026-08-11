export type Jenjang = "SD" | "SMP" | "SMA" | "SMK" | "Umum";

export type MediaStatus = "pending" | "approved" | "rejected";

export type MediaCategory =
  | "Laboratorium Maya"
  | "Multimedia Interaktif"
  | "Game Edukasi"
  | "Quiz Interaktif"
  | "Modul Digital";

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
  description: string;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
  plays: number;
  status: MediaStatus;
  submitted_at: string;
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
  description: string;
  guru_name: string;
  sekolah: string;
  guru_wa: string;
  status: "pending";
  plays: 0;
}
