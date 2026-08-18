export function formatPlays(plays: number): string {
  if (plays >= 1000) {
    return (plays / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return plays.toLocaleString("id-ID");
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isValidUrl(url: string): boolean {
  return normalizeUrl(url) !== null;
}

/**
 * Normalisasi URL media:
 * - terima https://..., http://..., atau domain biasa (contoh.com)
 * - domain tanpa protokol dinormalisasi menjadi https://
 * - valid hanya URL http/https dengan hostname yang masuk akal
 * - tidak melakukan fetch/scan ke URL tujuan
 */
export function normalizeUrl(raw: string): string | null {
  let value = (raw ?? "").trim();
  if (!value) return null;

  // Hilangkan spasi dalam dan karakter mencurigakan agar tidak jadi HTML/script.
  if (!/^[^\s<>]+$/.test(value)) return null;

  if (!/^https?:\/\//i.test(value)) {
    value = "https://" + value;
  }

  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return null;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (
    !u.hostname ||
    (!u.hostname.includes(".") && u.hostname !== "localhost")
  ) {
    return null;
  }

  return u.toString();
}

export function normalizeTool(tool: string): string {
  return tool.trim().toLowerCase();
}
