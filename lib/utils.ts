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
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeTool(tool: string): string {
  return tool.trim().toLowerCase();
}
