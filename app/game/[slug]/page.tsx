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
  searchParams: { set?: string; room?: string; pid?: string; tok?: string };
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
  const qs = q.toString();
  return <GameFrame title={game.title} src={qs ? `${game.src}?${qs}` : game.src} />;
}
