import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGuru } from "@/lib/guru";
import { getRoomForTeacher } from "@/lib/ruang";
import { sql } from "@/lib/db";
import RuangLive from "@/components/guru/RuangLive";

export const metadata: Metadata = { title: "Mabar Online" };
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RuangPage({ params }: { params: { id: string } }) {
  const guru = await requireGuru();
  if (!UUID.test(params.id)) notFound();
  const room = await getRoomForTeacher(params.id, guru.guruId);
  if (!room) notFound();
  const sets = await sql`SELECT id, title, opts FROM question_sets WHERE id = ${room.set_id} LIMIT 1`;
  const set = sets[0] as { id: string; title: string };
  return <RuangLive roomId={room.id} code={room.code} setId={set.id} title={set.title} game={room.game} opts={(set as { opts?: Record<string, number> }).opts} />;
}
