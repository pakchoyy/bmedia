// Validasi hasil permainan murid (dipakai API publik, jadi semua nilai dibatasi).

export interface HasilInput {
  name: string;
  mode: "free" | "edu" | "race";
  score: number;
  caught: number;
  quizRight: number;
  quizWrong: number;
  durationS: number;
  qStats: Record<string, [number, number]>;
}

const int = (v: unknown, min: number, max: number): number | null => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
};

export function cleanName(raw: unknown): string {
  return String(raw ?? "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

export function parseHasil(body: unknown): { ok: true; data: HasilInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = cleanName(b.name);
  if (!name) return { ok: false, error: "Nama wajib diisi." };
  const mode = b.mode === "free" || b.mode === "edu" || b.mode === "race" ? b.mode : null;
  if (!mode) return { ok: false, error: "Mode tidak valid." };
  const score = int(b.score, 0, 20000);
  const caught = int(b.caught, 0, 500);
  const quizRight = int(b.quizRight, 0, 300);
  const quizWrong = int(b.quizWrong, 0, 300);
  const durationS = int(b.durationS, 0, 600);
  if ([score, caught, quizRight, quizWrong, durationS].some((v) => v === null)) {
    return { ok: false, error: "Data hasil tidak valid." };
  }
  const qStats: Record<string, [number, number]> = {};
  const raw = (b.qStats ?? {}) as Record<string, unknown>;
  for (const k of Object.keys(raw).slice(0, 200)) {
    const idx = Number(k);
    const v = raw[k];
    if (!Number.isInteger(idx) || idx < 0 || idx >= 200 || !Array.isArray(v)) continue;
    const r = int(v[0], 0, 100);
    const w = int(v[1], 0, 100);
    if (r !== null && w !== null) qStats[String(idx)] = [r, w];
  }
  return {
    ok: true,
    data: { name, mode, score: score!, caught: caught!, quizRight: quizRight!, quizWrong: quizWrong!, durationS: durationS!, qStats },
  };
}
