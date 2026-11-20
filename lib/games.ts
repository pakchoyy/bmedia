export interface GameInfo {
  slug: string;
  title: string;
  /** Nama yang tampil di pilihan (editor guru, tombol coba). Default = title */
  label?: string;
  /** Jika diisi, ini adalah mode/varian dari game induk dan tidak tampil sebagai kartu sendiri */
  parent?: string;
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
    modes: ["Main Bebas", "Edukasi", "Duel 2 Pemain", "Layar Bersama 2–4", "Mabar Online"],
  },
  {
    slug: "kupu-bersama",
    title: "Tangkap Kupu",
    label: "Tangkap Kupu · Layar Bersama (IFP)",
    parent: "kupu-kupu",
    src: "/games/kupu-bersama/index.html",
    tagline: "Layar dibagi per pemain. Jawab soal dengan benar untuk menangkap kupu, siapa paling dulu memenuhi toplesnya menang!",
    preview: "/games/kupu-bersama/preview.webp",
    modes: ["2–4 Pemain", "Satu Layar", "Cocok untuk IFP"],
  },
];

/** Game yang tampil sebagai kartu (tanpa varian/mode) */
export const MAIN_GAMES = GAMES.filter((g) => !g.parent);

export function variantsOf(slug: string): GameInfo[] {
  return GAMES.filter((g) => g.parent === slug);
}

export function gameLabel(g: GameInfo): string {
  return g.label ?? g.title;
}

export function getGame(slug: string): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}
