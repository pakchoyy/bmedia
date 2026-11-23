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
  /** Boleh dimainkan tegak di HP (tanpa paksa landscape) */
  portraitOk?: boolean;
  /** Game tidak memakai set soal guru (tidak muncul di editor soal) */
  noSet?: boolean;
}

/** Game yang bisa memakai set soal guru */
export const SET_GAMES_FILTER = (g: { noSet?: boolean }) => !g.noSet;

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
  {
    slug: "gowes",
    title: "Gowes ke Sekolah",
    src: "/games/gowes/index.html",
    tagline: "Balap sepeda ke sekolah! Jawab soal matematika dengan benar untuk mengayuh. 1 lawan robot atau 2–4 pemain satu layar.",
    preview: "/games/gowes/preview.jpg",
    modes: ["Matematika Otomatis", "Soal Guru", "1 vs Robot", "2–4 Pemain (IFP)"],
  },
  {
    slug: "balon",
    title: "Balon Pecah",
    src: "/games/balon/index.html",
    tagline: "Balon jawaban terbang ke atas. Pecahkan yang benar sebelum lepas! Soal matematika otomatis atau soal guru, 1–4 pemain di IFP.",
    preview: "/games/balon/preview.jpg",
    modes: ["Soal Guru", "Matematika Otomatis", "1–4 Pemain (IFP)"],
  },
  {
    slug: "tebak-emoji",
    title: "Tebak Emoji",
    src: "/games/tebak-emoji/index.html",
    tagline: "🏠 + 🤒 = ? Tebak kata dari gabungan emoji. Main sendiri atau 2 tim bergantian di layar kelas.",
    preview: "/games/tebak-emoji/preview.jpg",
    modes: ["2 Tim Bergantian", "Kuis Kelas", "50+ Teka-teki"],
    portraitOk: true,
    noSet: true,
  },
  {
    slug: "susun-kata",
    title: "Susun Kata",
    src: "/games/susun-kata/index.html",
    tagline: "Huruf-hurufnya teracak! Susun jadi kata yang benar dari petunjuk. Bisa pakai soal guru: jawaban pendek jadi kata yang disusun.",
    preview: "/games/susun-kata/preview.jpg",
    modes: ["4 Tema Kata", "Soal Guru", "Mode Santai"],
    portraitOk: true,
  },
  {
    slug: "hujan-kata",
    title: "Hujan Kata",
    src: "/games/hujan-kata/index.html",
    tagline: "Kata dan soal hitungan jatuh dari awan. Ketik jawabannya sebelum menyentuh sawah! Latihan mengetik dan berhitung cepat.",
    preview: "/games/hujan-kata/preview.jpg",
    modes: ["Latihan Mengetik", "Hitung Cepat", "3 Tingkat"],
    portraitOk: true,
    noSet: true,
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
