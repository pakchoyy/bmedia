export interface GameInfo {
  slug: string;
  title: string;
  src: string; // file game statis di /public
}

export const GAMES: GameInfo[] = [
  { slug: "kupu-kupu", title: "Butterfly Catcher", src: "/games/kupu-kupu/index.html" },
];

export function getGame(slug: string): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}
