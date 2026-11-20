import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireGuru } from "@/lib/guru";
import type { QuestionSet } from "@/lib/soal";
import SetEditor from "@/components/guru/SetEditor";
import SharePanel from "@/components/guru/SharePanel";

export const metadata: Metadata = { title: "Edit Set Soal" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditSetPage({ params }: { params: { id: string } }) {
  const guru = await requireGuru();
  if (!UUID.test(params.id)) notFound();
  const rows = await sql`
    SELECT id, title, subject, grade, questions, code, game, plays, updated_at
    FROM question_sets WHERE id = ${params.id} AND teacher_id = ${guru.guruId} LIMIT 1
  `;
  const set = rows[0] as QuestionSet | undefined;
  if (!set) notFound();

  return (
    <div className="container mx-auto max-w-[1100px] px-4 py-6">
      <Link href="/guru" className="text-sm text-gray-500 hover:text-nb-orange">&larr; Set Soal Saya</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-3">
        <SetEditor set={set} />
        <SharePanel id={set.id} code={set.code} game={set.game} />
      </div>
    </div>
  );
}
