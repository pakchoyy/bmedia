export interface GameInfo {
  slug: string;
  title: string;
  src: string; // file game statis di /public
  tagline: string;
  preview: string;
  modes: string[];
}

export const GAMES: GameInfo[] = [
  {
    slug: "kupu-kupu",
    title: "Tangkap Kupu",
    src: "/games/kupu-kupu/index.html",
    tagline: "Tangkap kupu-kupu di taman. Tiap beberapa tangkapan, jawab soal untuk poin ekstra!",
    preview: "/games/kupu-kupu/preview.webp",
    modes: ["Main Bebas", "Edukasi", "Duel 2 Pemain"],
  },
  {
    slug: "balap-kupu",
    title: "Balap Kupu",
    src: "/games/balap-kupu/index.html",
    tagline: "Layar dibagi per pemain. Jawab soal paling cepat, terbangkan kupu-kupumu ke bunga lebih dulu!",
    preview: "/games/balap-kupu/preview.webp",
    modes: ["2–4 Pemain", "Satu Layar", "Cocok untuk IFP"],
  },
];

export function getGame(slug: string): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}
