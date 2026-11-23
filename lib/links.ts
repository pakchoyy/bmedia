// Web belajar pihak ketiga yang direkomendasikan Main-yuk.
// Main-yuk hanya menautkan; semua hak milik pengelola masing-masing.
export interface WebLuar {
  name: string;
  url: string;
  desc: string;
  mapel: string;
  color: string; // kelas Tailwind latar
}

export const WEB_LUAR: WebLuar[] = [
  { name: "Polypad", url: "https://polypad.amplify.com/", mapel: "Matematika", color: "bg-nb-yellow",
    desc: "Alat peraga maya: bangun ruang, pecahan, ubin aljabar, garis bilangan. Cocok untuk belajar kubus dan jaring-jaring." },
  { name: "PhET Simulasi", url: "https://phet.colorado.edu/in/", mapel: "IPA & Matematika", color: "bg-nb-mint",
    desc: "Ratusan simulasi interaktif fisika, kimia, biologi, dan matematika dari University of Colorado. Ada bahasa Indonesia." },
  { name: "GeoGebra", url: "https://www.geogebra.org/", mapel: "Matematika", color: "bg-nb-lilac",
    desc: "Geometri, grafik fungsi, dan bangun 3D yang bisa diputar. Banyak aktivitas siap pakai buatan guru dunia." },
  { name: "Desmos", url: "https://www.desmos.com/calculator?lang=id", mapel: "Matematika", color: "bg-nb-pink",
    desc: "Kalkulator grafik gratis yang mudah dipakai untuk menggambar fungsi dan melihat perubahannya." },
  { name: "Scratch", url: "https://scratch.mit.edu/", mapel: "Coding", color: "bg-nb-orange",
    desc: "Belajar coding dengan menyusun balok. Murid bisa membuat game dan animasi sendiri." },
  { name: "Chrome Music Lab", url: "https://musiclab.chromeexperiments.com/", mapel: "Seni Musik", color: "bg-nb-blue/40",
    desc: "Eksperimen musik di browser: ritme, melodi, dan gelombang suara. Tanpa daftar akun." },
];

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
