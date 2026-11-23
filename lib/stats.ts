import { sql } from "./db";

export interface DayPoint { d: string; n: number }
export interface AppStats {
  teachers: { total: number; new7: number; new30: number; active7: number; withSet: number };
  sets: { total: number; new7: number; avgQuestions: number };
  sessions: { total: number; last7: number; byMode: { mode: string; n: number }[]; students: number };
  rooms: { total: number; finished: number; players: number };
  daily: { sessions: DayPoint[]; teachers: DayPoint[] };
  topSets: { title: string; teacher: string; sesi: number; murid: number }[];
}

const n = (v: unknown) => Number(v ?? 0) || 0;

export async function getAppStats(): Promise<AppStats> {
  const [t, s, se, r, ds, dt, top] = await Promise.all([
    sql`SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new7,
      count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS new30,
      (SELECT count(DISTINCT q.teacher_id)::int FROM question_sets q
         WHERE q.updated_at > now() - interval '7 days'
            OR EXISTS (SELECT 1 FROM play_results p WHERE p.set_id = q.id AND p.created_at > now() - interval '7 days')
            OR EXISTS (SELECT 1 FROM rooms r WHERE r.set_id = q.id AND r.created_at > now() - interval '7 days')) AS active7,
      (SELECT count(DISTINCT teacher_id)::int FROM question_sets) AS with_set
      FROM teachers`,
    sql`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new7,
      coalesce(round(avg(jsonb_array_length(questions)))::int, 0) AS avgq FROM question_sets`,
    sql`SELECT mode, count(*)::int AS n, count(DISTINCT lower(player_name))::int AS students,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS last7 FROM play_results GROUP BY mode ORDER BY n DESC`,
    sql`SELECT (SELECT count(*)::int FROM rooms) AS total,
      (SELECT count(*)::int FROM rooms WHERE status = 'finished' AND EXISTS (SELECT 1 FROM room_players p WHERE p.room_id = rooms.id)) AS finished,
      (SELECT count(*)::int FROM room_players) AS players`,
    sql`SELECT to_char(g::date, 'DD Mon') AS d, count(p.id)::int AS n
      FROM generate_series(current_date - 13, current_date, interval '1 day') g
      LEFT JOIN play_results p ON p.created_at::date = g::date GROUP BY g ORDER BY g`,
    sql`SELECT to_char(g::date, 'DD Mon') AS d, count(t.id)::int AS n
      FROM generate_series(current_date - 13, current_date, interval '1 day') g
      LEFT JOIN teachers t ON t.created_at::date = g::date GROUP BY g ORDER BY g`,
    sql`SELECT q.title, t.name AS teacher, count(p.id)::int AS sesi, count(DISTINCT lower(p.player_name))::int AS murid
      FROM question_sets q JOIN teachers t ON t.id = q.teacher_id
      LEFT JOIN play_results p ON p.set_id = q.id
      GROUP BY q.id, t.name ORDER BY sesi DESC, q.created_at DESC LIMIT 8`,
  ]);
  const a = t[0] as Record<string, unknown>, b = s[0] as Record<string, unknown>, c = r[0] as Record<string, unknown>;
  const modes = se as { mode: string; n: number; students: number; last7: number }[];
  return {
    teachers: { total: n(a.total), new7: n(a.new7), new30: n(a.new30), active7: n(a.active7), withSet: n(a.with_set) },
    sets: { total: n(b.total), new7: n(b.new7), avgQuestions: n(b.avgq) },
    sessions: {
      total: modes.reduce((x, m) => x + m.n, 0),
      last7: modes.reduce((x, m) => x + m.last7, 0),
      byMode: modes.map((m) => ({ mode: m.mode, n: m.n })),
      students: modes.reduce((x, m) => x + m.students, 0),
    },
    rooms: { total: n(c.total), finished: n(c.finished), players: n(c.players) },
    daily: { sessions: ds as DayPoint[], teachers: dt as DayPoint[] },
    topSets: top as AppStats["topSets"],
  };
}
