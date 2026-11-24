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
  /** Perangkat yang dibutuhkan: game ketik perlu keyboard (laptop/komputer) */
  perlu?: "keyboard";
  /** Bawaan badge & halaman info (bisa diubah admin di Tampilan & Cover) */
  mapel: string;
  fase: string;
  caraMain: string[];
  /** Cara main yang didukung: sendiri, layar kelas (IFP), Mabar online */
  cara: Cara[];
}

export type Cara = "sendiri" | "ifp" | "online";
export const CARA_LABEL: Record<Cara, { icon: string; label: string }> = {
  sendiri: { icon: "🙋", label: "Main sendiri" },
  ifp: { icon: "🖥️", label: "Layar kelas 1–4" },
  online: { icon: "🌐", label: "Mabar online" },
};

/** Game yang bisa memakai set soal guru */
export const SET_GAMES_FILTER = (g: { noSet?: boolean }) => !g.noSet;

export const GAMES: GameInfo[] = [
  {
    slug: "kupu-kupu",
    title: "Tangkap Kupu",
    src: "/games/kupu-kupu/index.html",
    tagline: "Tangkap kupu-kupu di taman. Tiap beberapa tangkapan, jawab soal untuk poin ekstra!",
    preview: "/games/kupu-kupu/cover.jpg",
    modes: ["Main Bebas", "Edukasi", "Duel 2 Pemain", "Layar Bersama 2–4", "Mabar Online"],
    mapel: "Semua mapel",
    fase: "SD (Fase A–C)",
    caraMain: ["Gerakkan anak dengan joystick atau tombol panah.", "Tangkap kupu-kupu dengan jaring; tiap beberapa tangkapan muncul soal.", "Jawab benar untuk poin ekstra. Pilih mode Duel atau Layar Bersama untuk main berdua sampai berempat."],
    cara: ["sendiri", "ifp", "online"],
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
    mapel: "Semua mapel",
    fase: "SD (Fase A–C)",
    caraMain: ["Pilih 2–4 pemain dan target kupu.", "Setiap pemain menjawab soal di kolomnya sendiri.", "Jawaban benar menangkap satu kupu; yang pertama memenuhi toples menang."],
    cara: ["ifp"],
  },
  {
    slug: "gowes",
    title: "Gowes ke Sekolah",
    src: "/games/gowes/index.html",
    tagline: "Balap sepeda ke sekolah! Jawab soal matematika dengan benar untuk mengayuh. 1 lawan robot atau 2–4 pemain satu layar.",
    preview: "/games/gowes/cover.jpg",
    modes: ["Matematika Otomatis", "Soal Guru", "1 vs Robot", "2–4 Pemain (IFP)"],
    mapel: "Matematika",
    fase: "SD–SMP",
    caraMain: ["Pilih jumlah pemain (1 lawan robot atau 2–4 orang).", "Pilih jenis soal (20 jenis, dari tambah sampai FPB/KPK) dan tingkat kesulitan.", "Jawab benar untuk mengayuh; yang pertama sampai sekolah menang."],
    cara: ["sendiri", "ifp", "online"],
  },
  {
    slug: "balon",
    title: "Balon Pecah",
    src: "/games/balon/index.html",
    tagline: "Balon jawaban terbang ke atas. Pecahkan yang benar sebelum lepas! Soal matematika otomatis atau soal guru, 1–4 pemain di IFP.",
    preview: "/games/balon/cover.jpg",
    modes: ["Soal Guru", "Matematika Otomatis", "1–4 Pemain (IFP)"],
    mapel: "Matematika",
    fase: "SD–SMP",
    caraMain: ["Pilih jumlah pemain dan jenis soal.", "Balon berisi jawaban terbang ke atas; ketuk balon yang benar.", "Pecahkan target balon paling dulu untuk menang."],
    cara: ["sendiri", "ifp", "online"],
  },
  {
    slug: "tebak-emoji",
    title: "Tebak Emoji",
    src: "/games/tebak-emoji/index.html",
    tagline: "🏠 + 🤒 = ? Tebak kata dari gabungan emoji. Main sendiri atau 2 tim bergantian di layar kelas.",
    preview: "/games/tebak-emoji/cover.jpg",
    modes: ["2 Tim Bergantian", "Kuis Kelas", "50+ Teka-teki"],
    portraitOk: true,
    noSet: true,
    mapel: "Bahasa Indonesia",
    fase: "SD",
    caraMain: ["Lihat gabungan emoji di layar.", "Pilih kata yang paling cocok dari 4 pilihan.", "Main sendiri atau 2 tim bergantian; tim dengan skor tertinggi menang."],
    cara: ["sendiri", "ifp"],
  },
  {
    slug: "susun-kata",
    title: "Susun Kata",
    src: "/games/susun-kata/index.html",
    tagline: "Ini apa? Lihat gambarnya, lalu seret huruf jadi kata. Benda di kelas, rumah, hewan, buah, dan lainnya.",
    preview: "/games/susun-kata/cover.jpg",
    modes: ["7 Kategori Gambar", "Seret Huruf", "Soal Guru"],
    portraitOk: true,
    mapel: "Bahasa Indonesia",
    fase: "SD Kelas 1–3",
    caraMain: ["Lihat gambarnya: ini apa?", "Seret huruf ke kotak, atau ketuk hurufnya.", "Buntu? Tekan Bantuan."],
    cara: ["sendiri"],
  },
  {
    slug: "selamatkan-desa",
    title: "Misi Selamatkan Desa",
    src: "/games/selamatkan-desa/index.html",
    tagline: "Hujan membawa sampah ke sungai desa. Seret sampah ke tempat Organik atau Anorganik. Ada mode Belajar, Battle, dan Kerja Sama.",
    preview: "/games/selamatkan-desa/cover.jpg",
    modes: ["Seret & Pilah", "Battle 2–4 Pemain", "Kerja Sama · Belajar"],
    noSet: true,
    mapel: "IPAS · Lingkungan",
    fase: "SD Fase B (Kelas 3–4)",
    caraMain: ["Sentuh sampah yang hanyut di sungai.", "Seret ke tempat sampah Organik atau Anorganik.", "Bingung? Buka Belajar atau tekan tombol Bantuan."],
    cara: ["sendiri", "ifp"],
  },
  {
    slug: "misi-sekolah-hijau",
    title: "Misi Sekolah Hijau",
    src: "https://misisekolahhijau.vercel.app/",
    tagline: "Bantu Bimo dan Siti menjaga sekolah tetap bersih dan hijau. Pilah sampah dan rawat tanaman.",
    preview: "/games/misi-sekolah-hijau/cover.jpg",
    modes: ["Peduli Lingkungan", "Cerita Bergambar", "Musik"],
    noSet: true,
    mapel: "IPAS · Lingkungan",
    fase: "SD",
    caraMain: ["Tekan Mulai Bermain.", "Ikuti misi Bimo dan Siti di sekolah.", "Selesaikan semua misi agar sekolah hijau."],
    cara: ["sendiri", "ifp"],
  },
  {
    slug: "pahlawan-ketik",
    title: "Pahlawan Ketik",
    src: "/games/pahlawan-ketik/index.html",
    tagline: "Monster 3D menyerang sekolah! Ketik kata atau angka untuk menembaknya. 10 gelombang, kalimat, dan bos.",
    preview: "/games/pahlawan-ketik/cover.jpg",
    modes: ["Kata & Angka", "Kalimat + Bos", "💻 Pakai keyboard"],
    perlu: "keyboard",
    portraitOk: true,
    noSet: true,
    mapel: "Mengetik & Bahasa",
    fase: "SD–SMP",
    caraMain: ["Ketik huruf pertama untuk mengunci monster.", "Ketik sampai habis. Monster meledak.", "Jaga perisai sekolah sampai gelombang 10."],
    cara: ["sendiri"],
  },
  {
    slug: "hujan-kata",
    parent: "pahlawan-ketik",
    title: "Hujan Kata",
    src: "/games/hujan-kata/index.html",
    tagline: "Kata dan soal hitungan jatuh dari awan. Ketik jawabannya sebelum menyentuh sawah! Latihan mengetik dan berhitung cepat.",
    preview: "/games/hujan-kata/cover.jpg",
    modes: ["Latihan Mengetik", "Hitung Cepat", "3 Tingkat", "💻 Pakai keyboard"],
    portraitOk: true,
    perlu: "keyboard",
    noSet: true,
    mapel: "Mengetik & Hitung",
    fase: "SD–SMP",
    caraMain: ["Kata atau soal hitungan jatuh dari awan.", "Ketik kata atau hasilnya sebelum menyentuh sawah.", "Jaga nyawa tetap ada; hujan makin cepat."],
    cara: ["sendiri"],
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

/** Game yang bisa dipakai untuk Mabar Online (ruang 5 angka) */
export const ONLINE_GAMES = GAMES.filter((g) => g.cara.includes("online") && !g.parent);
