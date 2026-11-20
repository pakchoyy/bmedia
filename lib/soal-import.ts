// Membaca soal pilihan ganda dari teks bebas (hasil Word / tempel teks) tanpa template kaku.
//
// Format yang dikenali:
//   1. Pertanyaan ...           (atau 1) / nomor otomatis Word)
//   a. Pilihan                  (a) / A. / (a) / huruf otomatis Word)
//   Kunci: A  |  Jawaban: B     (per soal)
//   *c. Pilihan  atau  c. Pilihan *   (tanda bintang = jawaban benar)
//   pilihan bercetak tebal      (dari .docx)
//   Kunci Jawaban:\n 1. A 2. C ...    (daftar kunci di akhir dokumen)

import type { Soal } from "./soal";

export interface ImportLine {
  text: string;
  /** Seluruh isi baris bercetak tebal (dari .docx) */
  bold?: boolean;
  /** Nomor/huruf dari penomoran otomatis Word, mis. "1." atau "a." */
  marker?: string;
}

export interface ImportResult {
  soal: Soal[];
  /** Nomor soal (urutan hasil) yang belum punya kunci, di-set ke A */
  noKey: number[];
  /** Pesan untuk bagian yang dilewati */
  skipped: string[];
}

const RE_QUESTION = /^(\d{1,3})\s*[.)]\s*(.*)$/;
const RE_OPTION = /^(\*?)\s*\(?([a-hA-H])\s*[.)]\s+(.*)$/;
const RE_INLINE_KEY = /^(?:kunci(?:\s+jawaban)?|jawaban|jawab|jwb|kunci jwb)\s*[:=]?\s*\(?([a-eA-E])\b/i;
const RE_KEY_HEADER = /^kunci(?:\s+jawaban)?\s*:?\s*$/i;
const RE_KEY_PAIR = /(\d{1,3})\s*[.)\-:=]?\s*\(?([a-eA-E])\b\)?/g;

interface Draft {
  num: number | null;
  q: string[];
  opts: { text: string; star: boolean; bold: boolean }[];
  key: number | null;
}

function cleanStar(text: string): { text: string; star: boolean } {
  let t = text.trim();
  let star = false;
  if (t.startsWith("*")) { star = true; t = t.slice(1).trim(); }
  if (t.endsWith("*")) { star = true; t = t.slice(0, -1).trim(); }
  if (/\((?:benar|jawaban)\)$/i.test(t)) { star = true; t = t.replace(/\((?:benar|jawaban)\)$/i, "").trim(); }
  return { text: t, star };
}

/** Pecah "a. X  b. Y  c. Z  d. W" dalam satu baris menjadi beberapa pilihan. */
function splitInlineOptions(text: string): string[] | null {
  const re = /(?:^|\s)\*?\(?([a-hA-H])[.)]\s+/g;
  const hits: { idx: number; len: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) hits.push({ idx: m.index + (m[0].startsWith(" ") || m[0].startsWith("\t") ? 1 : 0), len: m[0].trimStart().length });
  if (hits.length < 2 || hits[0].idx !== 0) return null;
  const letters = hits.map((h) => text.slice(h.idx, h.idx + h.len).replace(/[^a-eA-E]/g, "").toLowerCase());
  // Harus berurutan a, b, c, ...
  if (!letters.every((l, i) => l === "abcdefgh"[i])) return null;
  return hits.map((h, i) => text.slice(h.idx, i + 1 < hits.length ? hits[i + 1].idx : undefined).trim());
}

export function parseSoalLines(input: ImportLine[]): ImportResult {
  const drafts: Draft[] = [];
  const keyByNum = new Map<number, number>();
  let cur: Draft | null = null;
  let inKeyBlock = false;

  const lines: ImportLine[] = [];
  for (const l of input) {
    const raw = (l.marker ? `${l.marker} ` : "") + l.text;
    const text = raw.replace(/ /g, " ").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const parts = splitInlineOptions(text);
    if (parts) parts.forEach((p) => lines.push({ text: p, bold: l.bold }));
    else lines.push({ text, bold: l.bold });
  }

  const pushCur = () => { if (cur) drafts.push(cur); cur = null; };

  for (const line of lines) {
    const t = line.text;

    if (RE_KEY_HEADER.test(t)) { pushCur(); inKeyBlock = true; continue; }
    if (inKeyBlock) {
      let m: RegExpExecArray | null;
      RE_KEY_PAIR.lastIndex = 0;
      let found = false;
      while ((m = RE_KEY_PAIR.exec(t))) { keyByNum.set(Number(m[1]), "abcde".indexOf(m[2].toLowerCase())); found = true; }
      if (found) continue;
      inKeyBlock = false;
    }

    const ik = t.match(RE_INLINE_KEY);
    if (ik && cur) { (cur as Draft).key = "abcde".indexOf(ik[1].toLowerCase()); continue; }

    const om = t.match(RE_OPTION);
    if (om && cur) {
      const { text, star } = cleanStar(om[3]);
      (cur as Draft).opts.push({ text, star: star || om[1] === "*", bold: !!line.bold });
      continue;
    }

    const qm = t.match(RE_QUESTION);
    if (qm) {
      pushCur();
      cur = { num: Number(qm[1]), q: [qm[2]], opts: [], key: null };
      continue;
    }

    // Lanjutan teks pertanyaan (sebelum pilihan muncul)
    if (cur && (cur as Draft).opts.length === 0) { (cur as Draft).q.push(t); continue; }
    // Lanjutan teks pilihan terakhir
    if (cur && (cur as Draft).opts.length > 0 && (cur as Draft).opts.length < 4) {
      const last = (cur as Draft).opts[(cur as Draft).opts.length - 1];
      last.text = `${last.text} ${t}`;
    }
  }
  pushCur();

  const soal: Soal[] = [];
  const noKey: number[] = [];
  const skipped: string[] = [];

  drafts.forEach((d, i) => {
    const label = `Soal ${d.num ?? i + 1}`;
    const q = d.q.join(" ").trim();
    if (!q) { skipped.push(`${label}: pertanyaan kosong`); return; }
    if (d.opts.length !== 4 && d.opts.length !== 5) {
      skipped.push(`${label}: punya ${d.opts.length} pilihan (harus 4 atau 5: a–d atau a–e)`);
      return;
    }
    let a = d.key ?? (d.num != null && keyByNum.has(d.num) ? keyByNum.get(d.num)! : -1);
    if (a < 0) { const s = d.opts.findIndex((o) => o.star); if (s >= 0) a = s; }
    if (a < 0) {
      const bolds = d.opts.map((o, k) => (o.bold ? k : -1)).filter((k) => k >= 0);
      if (bolds.length === 1) a = bolds[0];
    }
    if (a < 0 || a >= d.opts.length) { a = 0; noKey.push(soal.length + 1); }
    soal.push({
      q: q.slice(0, 300),
      o: d.opts.map((o) => o.text.slice(0, 300)),
      a,
    });
  });

  return { soal, noKey, skipped };
}

/** Teks tempelan (dari Word/WA/Notepad) -> baris */
export function parsePlainText(text: string): ImportResult {
  return parseSoalLines(text.split(/\r?\n/).map((t) => ({ text: t })));
}

/**
 * HTML hasil mammoth (.docx) -> baris, mempertahankan cetak tebal dan
 * penomoran otomatis Word (daftar <ol> bersarang: tingkat 1 = nomor soal, tingkat 2 = huruf pilihan).
 * Hanya dipanggil di browser (memakai DOMParser).
 */
export function htmlToLines(html: string): ImportLine[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: ImportLine[] = [];
  let qCounter = 0;

  const isBold = (el: Element) => {
    // Abaikan penanda "a." / "1." di depan agar "a. **Bandung**" tetap dianggap tebal
    const text = (el.textContent || "").trim().replace(/^\*?\s*\(?(?:[a-eA-E]|\d{1,3})\s*[.)]\s*/, "");
    if (!text) return false;
    const boldText = Array.from(el.querySelectorAll("strong, b")).map((b) => b.textContent || "").join("").trim();
    return boldText.length > 0 && boldText.replace(/\s/g, "").length >= text.replace(/\s/g, "").length * 0.8;
  };

  const ownText = (li: Element) => {
    const clone = li.cloneNode(true) as Element;
    clone.querySelectorAll("ol, ul").forEach((n) => n.remove());
    return clone;
  };

  const walkList = (list: Element, depth: number) => {
    let optIdx = 0;
    const items = Array.from(list.children).filter((c) => c.tagName === "LI");
    // Daftar datar (soal & pilihan dalam satu daftar bernomor): pola 1 soal + 4 pilihan
    const flatGroups = depth === 0 && items.length >= 5 && items.length % 5 === 0 &&
      items.every((li) => !li.querySelector("ol, ul"));
    if (flatGroups) {
      items.forEach((li, k) => {
        const text = (li.textContent || "").trim();
        if (k % 5 === 0) { qCounter++; out.push({ text, marker: `${qCounter}.` }); }
        else out.push({ text, bold: isBold(li), marker: `${"abcd"[(k % 5) - 1]}.` });
      });
      return;
    }
    items.forEach((li) => {
      const own = ownText(li);
      const text = (own.textContent || "").trim();
      let marker: string;
      if (depth === 0) {
        // Jika teks sudah diawali huruf pilihan/nomor manual, jangan tambah penanda
        if (RE_OPTION.test(text) || RE_QUESTION.test(text)) marker = "";
        else { qCounter++; marker = `${qCounter}.`; }
      } else {
        marker = RE_OPTION.test(text) ? "" : `${"abcde"[optIdx] ?? "e"}.`;
        optIdx++;
      }
      out.push({ text, bold: isBold(own), marker: marker || undefined });
      Array.from(li.children).forEach((c) => { if (c.tagName === "OL" || c.tagName === "UL") walkList(c, depth + 1); });
    });
  };

  Array.from(doc.body.children).forEach((el) => {
    if (el.tagName === "OL" || el.tagName === "UL") {
      // Daftar huruf (a–d) Word yang berdiri sendiri setelah sebuah soal
      const prev = out[out.length - 1];
      const looksLikeOptions = prev && el.children.length >= 3 && el.children.length <= 5 &&
        Array.from(el.children).every((li) => !li.querySelector("ol, ul") && (li.textContent || "").trim().length < 200) &&
        !RE_OPTION.test((el.children[0].textContent || "").trim());
      walkList(el, looksLikeOptions && (prev.marker?.match(/^\d/) || RE_QUESTION.test(prev.text)) ? 1 : 0);
    } else if (el.tagName === "TABLE") {
      el.querySelectorAll("tr").forEach((tr) => {
        const t = Array.from(tr.children).map((c) => (c.textContent || "").trim()).filter(Boolean).join(" ");
        if (t) out.push({ text: t });
      });
    } else {
      // Satu paragraf bisa berisi beberapa baris (Shift+Enter → <br>)
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      parts.forEach((part) => {
        const tmp = doc.createElement("div");
        tmp.innerHTML = part;
        const text = (tmp.textContent || "").trim();
        if (text) out.push({ text, bold: isBold(tmp) });
      });
    }
  });
  return out;
}
