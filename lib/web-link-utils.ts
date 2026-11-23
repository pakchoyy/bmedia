// Utilitas tautan yang aman dipakai di browser (tanpa akses database).
export const WEB_COLORS = ["bg-nb-yellow", "bg-nb-mint", "bg-nb-lilac", "bg-nb-pink", "bg-nb-orange", "bg-nb-blue/40"];

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
