import { sql } from "./db";

export interface HasilRow {
  id: string;
  player_name: string;
  mode: string;
  score: number;
  caught: number;
  quiz_right: number;
  quiz_wrong: number;
  duration_s: number;
  q_stats: Record<string, [number, number]>;
  created_at: string;
}

export interface Murid {
  name: string;
  attempts: number;
  best: number;
  right: number;
  wrong: number;
  last: string;
}

export interface SoalSulit {
  index: number;
  right: number;
  wrong: number;
  wrongRate: number;
}

export async function getHasil(setId: string, limit = 1000): Promise<HasilRow[]> {
  const rows = await sql`
    SELECT id, player_name, mode, score, caught, quiz_right, quiz_wrong, duration_s, q_stats, created_at
    FROM play_results WHERE set_id = ${setId}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as HasilRow[];
}

export function ringkas(rows: HasilRow[]) {
  const by = new Map<string, Murid>();
  const q = new Map<number, [number, number]>();
  let sumScore = 0, right = 0, wrong = 0;
  for (const r of rows) {
    sumScore += r.score;
    right += r.quiz_right;
    wrong += r.quiz_wrong;
    const key = r.player_name.toLowerCase();
    const m = by.get(key) ?? { name: r.player_name, attempts: 0, best: 0, right: 0, wrong: 0, last: r.created_at };
    m.attempts++;
    m.best = Math.max(m.best, r.score);
    m.right += r.quiz_right;
    m.wrong += r.quiz_wrong;
    if (r.created_at > m.last) m.last = r.created_at;
    by.set(key, m);
    for (const [k, v] of Object.entries(r.q_stats ?? {})) {
      const cur = q.get(Number(k)) ?? [0, 0];
      q.set(Number(k), [cur[0] + v[0], cur[1] + v[1]]);
    }
  }
  const murid = Array.from(by.values()).sort((a, b) => b.best - a.best);
  const sulit: SoalSulit[] = Array.from(q.entries())
    .map(([index, [r, w]]) => ({ index, right: r, wrong: w, wrongRate: r + w ? w / (r + w) : 0 }))
    .filter((s) => s.right + s.wrong >= 2)
    .sort((a, b) => b.wrongRate - a.wrongRate || b.wrong - a.wrong);
  return {
    total: rows.length,
    murid,
    sulit,
    avgScore: rows.length ? Math.round(sumScore / rows.length) : 0,
    accuracy: right + wrong ? Math.round((right / (right + wrong)) * 100) : null,
  };
}
