import { sql } from "./db";

export const ROOM_CODE_LENGTH = 5;
export const MAX_PLAYERS = 60;
export const START_DELAY_S = 4; // jeda dari tombol Mulai sampai permainan dimulai (hitung mundur)

export function normalizeRoomCode(code: string): string {
  return String(code || "").replace(/\D/g, "").slice(0, ROOM_CODE_LENGTH);
}
export function isRoomCode(code: string): boolean {
  return /^\d{5}$/.test(code);
}
export function randomRoomCode(): string {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return String(10000 + (b[0] % 90000));
}

export interface Room {
  id: string;
  code: string;
  set_id: string;
  teacher_id: string;
  status: "lobby" | "playing" | "finished";
  duration_s: number;
  quiz_every: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}


export async function getRoomByCode(code: string): Promise<Room | null> {
  const rows = await sql`SELECT * FROM rooms WHERE code = ${code} AND created_at > now() - interval '12 hours' LIMIT 1`;
  return (rows[0] as Room) ?? null;
}

export async function getRoomForTeacher(id: string, teacherId: string): Promise<Room | null> {
  const rows = await sql`SELECT * FROM rooms WHERE id = ${id} AND teacher_id = ${teacherId} LIMIT 1`;
  return (rows[0] as Room) ?? null;
}

/**
 * Tandai ruang selesai bila waktunya lewat (+ jeda penyelesaian skor akhir),
 * lalu salin hasil ke play_results SEKALI SAJA (UPDATE ... RETURNING bersifat atomik).
 */
export async function settleRoom(roomId: string, force = false): Promise<boolean> {
  const rows = force
    ? await sql`UPDATE rooms SET status = 'finished' WHERE id = ${roomId} AND status = 'playing' RETURNING id, set_id, starts_at`
    : await sql`UPDATE rooms SET status = 'finished'
                WHERE id = ${roomId} AND status = 'playing' AND now() > ends_at + interval '8 seconds'
                RETURNING id, set_id, starts_at`;
  const r = rows[0] as { id: string; set_id: string; starts_at: string } | undefined;
  if (!r) return false;
  await sql`
    INSERT INTO play_results (set_id, player_name, mode, score, caught, quiz_right, quiz_wrong, duration_s)
    SELECT ${r.set_id}, p.name, 'online', p.score, p.caught, p.quiz_right, p.quiz_wrong,
           (SELECT duration_s FROM rooms WHERE id = ${r.id})
    FROM room_players p WHERE p.room_id = ${r.id}
  `;
  return true;
}

export async function leaderboard(roomId: string, limit = 100) {
  const rows = await sql`
    SELECT id, name, score, caught, quiz_right, quiz_wrong, finished
    FROM room_players WHERE room_id = ${roomId}
    ORDER BY score DESC, joined_at ASC LIMIT ${limit}
  `;
  return rows as { id: string; name: string; score: number; caught: number; quiz_right: number; quiz_wrong: number; finished: boolean }[];
}

