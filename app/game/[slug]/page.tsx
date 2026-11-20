import { notFound } from "next/navigation";
import { getGame, GAMES } from "@/lib/games";
import GameFrame from "@/components/GameFrame";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  return { title: game ? `${game.title} | BGY` : "Game" };
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  if (!game) notFound();
  return <GameFrame title={game.title} src={game.src} />;
}
