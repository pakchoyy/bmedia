import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import GameFrame from "@/components/GameFrame";
import { isValidCode, normalizeCode } from "@/lib/soal";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  return { title: game ? `${game.title}` : "Game" };
}

export default function GamePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { set?: string };
}) {
  const game = getGame(params.slug);
  if (!game) notFound();
  // Teruskan kode set soal guru ke game
  const code = normalizeCode(searchParams.set ?? "");
  const src = isValidCode(code) ? `${game.src}?set=${code}` : game.src;
  return <GameFrame title={game.title} src={src} />;
}
