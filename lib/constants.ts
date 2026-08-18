import type { MediaCategory, Jenjang } from "@/types/media";

export const CATEGORIES: {
  name: MediaCategory;
  icon: string;
  color: string;
}[] = [
  { name: "Laboratorium Maya", icon: "flask", color: "#0ea5a0" },
  { name: "Multimedia Interaktif", icon: "photo-video", color: "#f59e0b" },
  { name: "Game Edukasi", icon: "gamepad", color: "#10b981" },
  { name: "Quiz Interaktif", icon: "clipboard-question", color: "#8b5cf6" },
  { name: "Modul Digital", icon: "book-open", color: "#3b82f6" },
];

export const JENJANG_OPTIONS: Jenjang[] = ["TK", "SD", "SMP", "SMA", "SMK", "Umum"];

export const KELAS_OPTIONS: { label: string; group: string }[] = [
  { label: "TK A", group: "TK/PAUD" },
  { label: "TK B", group: "TK/PAUD" },
  { label: "PAUD", group: "TK/PAUD" },
  { label: "Fase A (Kelas 1-2)", group: "SD/MI" },
  { label: "Fase B (Kelas 3-4)", group: "SD/MI" },
  { label: "Fase C (Kelas 5-6)", group: "SD/MI" },
  { label: "Fase D (Kelas 7-9)", group: "SMP/MTs" },
  { label: "Fase E (Kelas 10)", group: "SMA/SMK/MA" },
  { label: "Fase F (Kelas 11-12)", group: "SMA/SMK/MA" },
  { label: "Umum / Semua Kelas", group: "" },
];

export const CATEGORY_PLACEHOLDER_COLORS: Record<MediaCategory, string> = {
  "Laboratorium Maya": "#0ea5a0",
  "Multimedia Interaktif": "#f59e0b",
  "Game Edukasi": "#10b981",
  "Quiz Interaktif": "#8b5cf6",
  "Modul Digital": "#3b82f6",
};

export const CONTACT_EMAIL = "admin@bgy.id";
export const CONTACT_WA = "089530713597";
export const CONTACT_TIKTOK = "https://www.tiktok.com/@pak.choyy";
export const SITE_URL = "bantuguruyuk.web.id";
