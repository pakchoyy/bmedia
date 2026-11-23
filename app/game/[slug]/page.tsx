import { notFound } from "next/navigation";
import { gameLabel, getGame } from "@/lib/games";
import GameFrame from "@/components/GameFrame";
import { isValidCode, normalizeCode } from "@/lib/soal";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  return { title: game ? gameLabel(game) : "Game" };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function GamePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { set?: string; room?: string; pid?: string; tok?: string; tutor?: string };
}) {
  const game = getGame(params.slug);
  if (!game) notFound();

  // Teruskan hanya parameter yang valid ke game (kode set soal, dan data Mabar Online)
  const q = new URLSearchParams();
  const code = normalizeCode(searchParams.set ?? "");
  if (isValidCode(code)) q.set("set", code);
  const room = String(searchParams.room ?? "");
  const pid = String(searchParams.pid ?? "");
  const tok = String(searchParams.tok ?? "");
  if (/^\d{5}$/.test(room) && UUID.test(pid) && /^[0-9a-f]{32}$/i.test(tok)) {
    q.set("room", room);
    q.set("pid", pid);
    q.set("tok", tok);
  }
  if (searchParams.tutor === "1") q.set("tutor", "1");
  // Versi build: memaksa browser memuat file game terbaru setelah setiap deploy
  q.set("v", (process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7));
  const qs = q.toString();
  return <GameFrame title={game.title} src={qs ? `${game.src}?${qs}` : game.src} portraitOk={game.portraitOk} slug={game.slug} />;
}
