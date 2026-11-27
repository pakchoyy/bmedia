/* Main-yuk · Cari Soal Yuk — cari kertas soal di sekolah 3D (Three.js r160).
   Soal dari set guru (?set=KODE) atau Mabar ruang (?room=..&pid=..&tok=..). Murid lain terlihat (Mabar).
   Mode jawab (dari guru, kolom quiz_every ruang): 1 = jawab di game (pilihan ganda), 0 = catat di kertas. */
import * as THREE from '/games/_shared/three.module.min.js';
import { makeRider, defaultChar, nameSprite } from '/games/_shared/gowes3d.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const ROOM = window.Ruang && Ruang.active ? { code: Q.get('room'), pid: Q.get('pid'), tok: Q.get('tok') } : null;
const SAY = (t) => { try { if (window.Suara && !Sfx.muted()) Suara.say(t); } catch (e) {} };
const COLORS = ['#ff5d8f', '#4aa8ff', '#ffd23f', '#2ec4b6', '#ff7a1a', '#b79cff', '#8cf0b8', '#ff9f43'];

/* ---------------- soal ---------------- */
// Demo: Latihan Matematika Kelas 2 (penjumlahan, pengurangan, membandingkan, mengurutkan)
const DEMO = [
  { q: '23 + 14 = ...', o: ['47', '36', '39', '37'], a: 3 },
  { q: '32 + 25 = ...', o: ['59', '67', '57', '56'], a: 2 },
  { q: '41 + 16 = ...', o: ['67', '57', '59', '56'], a: 1 },
  { q: '24 + 13 = ...', o: ['47', '39', '36', '37'], a: 3 },
  { q: '52 + 17 = ...', o: ['69', '79', '68', '71'], a: 0 },
  { q: '35 − 12 = ...', o: ['24', '23', '34', '13'], a: 1 },
  { q: '48 − 23 = ...', o: ['25', '36', '26', '15'], a: 0 },
  { q: '57 − 14 = ...', o: ['44', '54', '43', '33'], a: 2 },
  { q: '69 − 25 = ...', o: ['34', '45', '44', '55'], a: 2 },
  { q: '76 − 32 = ...', o: ['55', '34', '45', '44'], a: 3 },
  { q: 'Isi tanda yang tepat: 35 ... 53', o: ['>', '=', '<'], a: 2 },
  { q: 'Isi tanda yang tepat: 42 ... 39', o: ['=', '<', '>'], a: 2 },
  { q: 'Isi tanda yang tepat: 67 ... 67', o: ['=', '>', '<'], a: 0 },
  { q: 'Isi tanda yang tepat: 28 ... 32', o: ['>', '<', '='], a: 1 },
  { q: 'Isi tanda yang tepat: 81 ... 78', o: ['<', '=', '>'], a: 2 },
  { q: 'Urutkan dari yang terkecil: 24, 18, 32, 15, 27, 21', o: ['15, 21, 18, 24, 27, 32', '15, 18, 21, 24, 27, 32', '15, 18, 21, 27, 24, 32', '32, 27, 24, 21, 18, 15'], a: 1 },
  { q: 'Urutkan dari yang terkecil: 45, 38, 52, 41, 36, 49', o: ['36, 38, 41, 49, 45, 52', '36, 41, 38, 45, 49, 52', '36, 38, 41, 45, 49, 52', '52, 49, 45, 41, 38, 36'], a: 2 },
  { q: 'Urutkan dari yang terkecil: 63, 57, 71, 68, 54, 60', o: ['54, 60, 57, 63, 68, 71', '54, 57, 60, 63, 68, 71', '71, 68, 63, 60, 57, 54', '54, 57, 60, 68, 63, 71'], a: 1 },
  { q: 'Urutkan dari yang terkecil: 29, 35, 22, 41, 18, 32', o: ['18, 29, 22, 32, 35, 41', '41, 35, 32, 29, 22, 18', '18, 22, 29, 35, 32, 41', '18, 22, 29, 32, 35, 41'], a: 3 },
  { q: 'Urutkan dari yang terkecil: 85, 72, 91, 68, 79, 74', o: ['68, 74, 72, 79, 85, 91', '68, 72, 74, 79, 85, 91', '91, 85, 79, 74, 72, 68', '68, 72, 74, 85, 79, 91'], a: 1 },
];
let questions = null, setCode = (Q.get('set') || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), setTitle = '';
let answerMode = 1; // 1 jawab di game, 0 catat di kertas
let playMinutes = 10;
let perPaper = setCode || ROOM ? 1 : 2;  // jumlah soal per kertas (diatur guru); demo: 2
function loadSet(code) {
  return fetch('/api/set/' + code).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((d) => {
    const qs = (Array.isArray(d.questions) ? d.questions : []).filter((q) => q && typeof q.q === 'string' && Array.isArray(q.o) && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length);
    if (!qs.length) throw new Error('kosong');
    questions = qs.slice(0, 60); setTitle = d.title || '';
    const o = d.opts || {}; if (!ROOM) { if (o.mode === 0 || o.mode === 1) answerMode = o.mode; if (o.per) perPaper = Math.max(1, Math.min(5, o.per)); if (o.menit) playMinutes = o.menit; }
    lockOpts();
  });
}

/* ---------------- dunia sekolah ---------------- */
const cv = $('cv');
let lite = false; try { lite = localStorage.getItem('bgy_gfx') === 'ringan' || (navigator.hardwareConcurrency || 8) <= 4; } catch (e) {}
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !lite });
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = !lite; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fdcff); scene.fog = new THREE.Fog(0x9fdcff, 40, 130);
const cam = new THREE.PerspectiveCamera(58, 1, 0.2, 260);
scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x6a9a50, 1.2));
const sun = new THREE.DirectionalLight(0xfff1d6, 1.6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 }); scene.add(sun, sun.target);

const mats = new Map();
function M(c, o = {}) { const k = c + JSON.stringify(o); if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8 }, o))); return mats.get(k); }
function box(w, h, d, m, x, y, z, rot = 0) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'number' ? M(m) : m); b.position.set(x, y, z); b.rotation.y = rot; b.castShadow = true; b.receiveShadow = true; scene.add(b); return b; }
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 4; return t; }
const colliders = []; // kotak sejajar sumbu {x0,x1,z0,z1}
function solid(x, z, w, d) { colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); }
const circles = []; // pohon {x,z,r}
const SPOTS = []; // tempat kertas {pos, normal(yaw)}
const B = { x0: -74, x1: 74, z0: -58, z1: 58 };

function classWallTex(label, color) {
  return canvasTex(512, 128, (x) => {
    x.fillStyle = '#fff3d6'; x.fillRect(0, 0, 512, 128); x.fillStyle = color; x.fillRect(0, 104, 512, 24);
    for (let i = 0; i < 4; i++) { const wx = 26 + i * 124; x.fillStyle = '#6a4a32'; x.fillRect(wx - 3, 26, 76, 58); x.fillStyle = '#9fd8ff'; x.fillRect(wx, 29, 70, 52); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(wx + 6, 33, 14, 20); x.fillStyle = '#6a4a32'; x.fillRect(wx + 33, 29, 3, 52); }
    x.fillStyle = '#1b1a3a'; x.font = '700 22px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText(label, 256, 20);
  });
}
function building(x, z, w, d, rot, label, color, roofC) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const wall = new THREE.MeshStandardMaterial({ map: classWallTex(label, color) }), plain = M(0xfff3d6);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, 5, d), [plain, plain, plain, plain, wall, plain]); b.position.y = 2.5; b.castShadow = b.receiveShadow = true; g.add(b);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(d * 0.72, d * 0.72, w + 1, 3), M(roofC, { roughness: 0.6 })); roof.rotation.set(Math.PI / 6, 0, Math.PI / 2); roof.scale.set(1, 1, 0.6); roof.position.y = 6.1; roof.castShadow = true; g.add(roof);
  const tr = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, 2.2), M(0xd9d2c3)); tr.position.set(0, 0.12, d / 2 + 1.1); tr.receiveShadow = true; g.add(tr);
  // collider (dunia)
  const cw = Math.abs(Math.cos(rot)) > 0.5 ? w : d, cd = Math.abs(Math.cos(rot)) > 0.5 ? d : w; solid(x, z, cw + 0.4, cd + 0.4);
  // tempat kertas di dinding depan (beberapa titik) & samping
  const fwd = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot)), side = new THREE.Vector3(Math.cos(rot), 0, -Math.sin(rot));
  for (const t of [-0.36, 0, 0.36]) { const p = new THREE.Vector3(x, 1.6, z).addScaledVector(fwd, d / 2 + 0.06).addScaledVector(side, t * w); SPOTS.push({ p, yaw: rot, kind: 'dinding' }); }
  [-1, 1].forEach((s) => { const p = new THREE.Vector3(x, 1.6, z).addScaledVector(side, s * (w / 2 + 0.06)); SPOTS.push({ p, yaw: rot + s * Math.PI / 2, kind: 'dinding samping' }); });
}
function buildWorld() {
  const grass = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#74c25a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.fillStyle = Math.random() < .5 ? '#66b34c' : '#86d06a'; x.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, [40, 40]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // lapangan upacara (paving) + garis
  const pav = canvasTex(64, 64, (x) => { x.fillStyle = '#d8d0bf'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#bfb6a2'; x.lineWidth = 2; x.strokeRect(0, 0, 64, 64); x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 64); x.stroke(); }, [16, 10]);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), new THREE.MeshStandardMaterial({ map: pav, roughness: 0.9 })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.03, 2); yard.receiveShadow = true; scene.add(yard);
  // tiang bendera
  box(0.18, 9, 0.18, 0xdddddd, 0, 4.5, -4); box(2.2, 0.4, 2.2, 0xbfbfbf, 0, 0.2, -4); solid(0, -4, 1.4, 1.4);
  const flag = new THREE.Group(); flag.position.set(0, 8.3, -4); scene.add(flag);
  [[0xe8202a, 0.3], [0xffffff, -0.3]].forEach(([c, y]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(1.1, y, 0); flag.add(m); });
  scene.userData.flag = flag;
  // gedung: kelas (utara), kelas (barat & timur), kantin, perpustakaan
  building(0, -24, 30, 7, 0, 'KELAS 1 · 2 · 3', '#e8505b', 0xd8432f);
  building(-35, 0, 22, 7, Math.PI / 2, 'KELAS 4 · 5 · 6', '#2f7de0', 0x2f7de0);
  building(35, 0, 22, 7, -Math.PI / 2, 'PERPUSTAKAAN', '#22a06b', 0x22a06b);
  building(-22, 26, 14, 6, Math.PI, 'KANTIN', '#ff8a1f', 0xff8a1f);
  building(22, 26, 14, 6, Math.PI, 'UKS & GURU', '#8c7ae6', 0x8c7ae6);
  building(-55, -40, 18, 7, 0, 'LAB KOMPUTER', '#0ea5e9', 0x0ea5e9);
  building(55, -40, 18, 7, 0, 'MUSHOLA', '#16a34a', 0x16a34a);
  building(-55, 45, 16, 6, Math.PI, 'GUDANG', '#a16207', 0xa16207);
  building(55, 45, 16, 6, Math.PI, 'RUANG SENI', '#db2777', 0xdb2777);
  // lapangan olahraga (garis) & kebun sekolah
  const field = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), new THREE.MeshStandardMaterial({ map: canvasTex(256, 160, (x) => { x.fillStyle = '#58b947'; x.fillRect(0, 0, 256, 160); x.strokeStyle = '#fff'; x.lineWidth = 4; x.strokeRect(8, 8, 240, 144); x.beginPath(); x.moveTo(128, 8); x.lineTo(128, 152); x.stroke(); x.beginPath(); x.arc(128, 80, 26, 0, 7); x.stroke(); }) }));
  field.rotation.x = -Math.PI / 2; field.position.set(0, 0.03, 44); field.receiveShadow = true; scene.add(field);
  [-1, 1].forEach((sg) => { box(0.2, 2.4, 0.2, 0xffffff, sg * 17, 1.2, 40); box(0.2, 2.4, 0.2, 0xffffff, sg * 17, 1.2, 48); box(0.2, 0.2, 8.2, 0xffffff, sg * 17, 2.4, 44); });
  for (let k = 0; k < 6; k++) { const bx = -66 + (k % 3) * 6, bz = -6 + Math.floor(k / 3) * 7; box(4, 0.4, 5, 0x7a4a2b, bx, 0.2, bz); for (let r = 0; r < 4; r++) { const pl = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 6), M(0x2f9e44, { flatShading: true })); pl.position.set(bx - 1.4 + r * 0.95, 0.85, bz); scene.add(pl); } SPOTS.push({ p: new THREE.Vector3(bx, 0.45, bz + 2.6), yaw: 0, kind: 'kebun', flat: true }); }
  // tong sampah & pot bunga (tempat kertas tersembunyi)
  [[-48, 10], [48, 10], [-10, -36], [10, -36], [-40, 34], [40, 34], [0, 30], [62, 0], [-62, 20]].forEach(([x, z], i) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.9, 10), M(i % 2 ? 0xc0532f : 0x2f7de0)); pot.position.set(x, 0.45, z); pot.castShadow = true; scene.add(pot); solid(x, z, 1.2, 1.2);
    SPOTS.push({ p: new THREE.Vector3(x, 0.55, z + 0.62), yaw: 0, kind: i % 2 ? 'pot bunga' : 'tong sampah' });
  });
  // pagar keliling
  const fenceM = M(0xf1e2b8);
  [[0, B.z0 - 1, 152, 0.4], [0, B.z1 + 1, 152, 0.4], [B.x0 - 1, 0, 0.4, 120], [B.x1 + 1, 0, 0.4, 120]].forEach(([x, z, w, d]) => { box(w, 1.4, d, fenceM, x, 0.7, z); solid(x, z, w, d); });
  // pagar dalam: tempat kertas di pagar
  for (const x of [-60, -30, 0, 30, 60]) SPOTS.push({ p: new THREE.Vector3(x, 0.9, B.z1 + 0.75), yaw: Math.PI, kind: 'pagar' });
  // mading (papan pengumuman) di tepi lapangan
  const madingT = canvasTex(256, 128, (x) => { x.fillStyle = '#c68e5a'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#7a4a2b'; x.fillRect(0, 0, 256, 10); x.fillStyle = '#fff'; x.font = '700 22px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('MADING', 128, 30); ['#ffd23f', '#9fd8ff', '#ffb3c6'].forEach((c, i) => { x.fillStyle = c; x.fillRect(20 + i * 78, 44, 60, 60); }); });
  [[-16, 16, 0], [16, 16, 0]].forEach(([x, z, r]) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g);
    const leg = M(0x7a4a2b); [-1.5, 1.5].forEach((dx) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 0.2), leg); l.position.set(dx, 1.3, 0); g.add(l); });
    const bd = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.2), [leg, leg, leg, leg, new THREE.MeshStandardMaterial({ map: madingT }), leg]); bd.position.y = 2.2; bd.castShadow = true; g.add(bd);
    solid(x, z, 3.8, 0.6); SPOTS.push({ p: new THREE.Vector3(x + 1.1, 2.2, z + 0.12), yaw: 0, kind: 'mading' }); SPOTS.push({ p: new THREE.Vector3(x - 1.1, 1.9, z - 0.12), yaw: Math.PI, kind: 'belakang mading' });
  });
  // bangku taman
  [[-28, -12], [28, -12], [-8, 22], [8, 22], [-26, 14], [26, 14]].forEach(([x, z]) => {
    box(2.6, 0.18, 0.8, 0xb07a46, x, 0.6, z); [-1, 1].forEach((s) => box(0.16, 0.6, 0.7, 0x7a4a2b, x + s * 1.1, 0.3, z)); solid(x, z, 2.6, 0.8);
    SPOTS.push({ p: new THREE.Vector3(x, 0.72, z), yaw: 0, kind: 'bangku', flat: true });
  });
  // pohon (rindang & kelapa)
  const trees = [[-60, -20], [60, -20], [-66, 30], [66, 30], [-30, -48], [30, -48], [-30, 52], [30, 52], [-50, 0], [50, 0], [-22, -8], [22, -8], [-24, 8], [24, 8], [-40, -28], [40, -28], [-40, 26], [40, 26], [-12, -16], [12, -16], [-6, 28], [6, 28], [-30, 20], [30, 20], [0, 18]];
  const trunkM = M(0x8a5a3b), leafM = M(0x2f9e44, { flatShading: true });
  trees.forEach(([x, z], i) => {
    const s = 0.9 + (i % 3) * 0.15;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * s, 0.5 * s, 3.4 * s, 8), trunkM); t.position.set(x, 1.7 * s, z); t.castShadow = true; scene.add(t);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4 * s, 1), leafM); l.position.set(x, 4.4 * s, z); l.castShadow = true; scene.add(l);
    circles.push({ x, z, r: 0.75 * s });
    const yaw = (i * 1.7) % (Math.PI * 2);
    SPOTS.push({ p: new THREE.Vector3(x + Math.sin(yaw) * 0.52 * s, 1.5, z + Math.cos(yaw) * 0.52 * s), yaw, kind: 'pohon' });
  });
  // semak
  const bushG = new THREE.IcosahedronGeometry(0.8, 1), bushM = M(0x3cbf55, { flatShading: true });
  for (let i = 0; i < 40; i++) { const x = B.x0 + 2 + Math.random() * (B.x1 - B.x0 - 4), z = Math.random() < .5 ? B.z0 + 1.5 : B.z1 - 1.5; const b = new THREE.Mesh(bushG, bushM); b.position.set(x, 0.4, z); b.scale.set(1, 0.7, 1); scene.add(b); }
  // awan
  for (let i = 0; i < 10; i++) { const c = new THREE.Group(); for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random(), 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.position.set(k * 2.2, Math.random() * 0.6, 0); c.add(s); } c.position.set(-80 + Math.random() * 160, 28 + Math.random() * 10, -70 + Math.random() * 60); scene.add(c); }
}

/* ---------------- kertas soal ---------------- */
let papers = [];
function seeded(seed) { let s = 0; for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0; s = s || 1234567; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function paperTex(n, done) {
  return canvasTex(128, 160, (x) => {
    x.fillStyle = done ? '#c8f7dc' : '#fffdf4'; x.fillRect(0, 0, 128, 160);
    x.strokeStyle = '#9fc3e8'; x.lineWidth = 2; for (let y = 40; y < 160; y += 18) { x.beginPath(); x.moveTo(8, y); x.lineTo(120, y); x.stroke(); }
    x.strokeStyle = '#1b1a3a'; x.lineWidth = 6; x.strokeRect(3, 3, 122, 154);
    x.fillStyle = '#ff5d8f'; x.beginPath(); x.arc(64, 14, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = done ? '#1e8e4a' : '#c0392b'; x.font = '700 58px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(done ? '✓' : String(n), 64, 92);
  });
}
function placePapers(seed) {
  papers.forEach((p) => scene.remove(p.g)); papers = [];
  const rnd = seeded(seed), spots = SPOTS.slice();
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  const groups = []; for (let k = 0; k < questions.length; k += perPaper) groups.push(questions.slice(k, k + perPaper));
  groups.forEach((qs, i) => {
    const q = qs[0];
    const sp = spots[i % spots.length];
    const g = new THREE.Group(); g.position.copy(sp.p); scene.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), new THREE.MeshStandardMaterial({ map: paperTex(i + 1, false), side: THREE.DoubleSide, emissive: 0xffe08a, emissiveIntensity: 0 }));
    if (sp.flat) { m.rotation.x = -Math.PI / 2; m.rotation.z = rnd() * 6; m.position.y = 0.02; } else g.rotation.y = sp.yaw;
    m.castShadow = true; g.add(m);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 24), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    if (sp.flat) glow.rotation.x = -Math.PI / 2; g.add(glow);
    papers.push({ i, q, qs, qi: 0, g, m, glow, kind: sp.kind, found: false, flat: !!sp.flat, ph: rnd() * 6, tries: 0 });
  });
}
function markPaper(p) { p.found = true; p.m.material.map = paperTex(p.i + 1, true); p.m.material.emissiveIntensity = 0.1; p.m.material.needsUpdate = true; }

/* ---------------- pemain & murid lain ---------------- */
function charOf() { return CHARS[charIdx] || defaultChar(0); }
function makeKid(color, ch, name) {
  const r = makeRider(new THREE.Color(color), ch);
  r.group.remove(r.group.children[0]); // tanpa sepeda
  r.body.children.forEach((c) => { if (Math.abs(c.rotation.x + 0.4) < 0.01) c.rotation.x = -0.05; });
  r.legs.forEach((l) => { l.rotation.x = 0; l.userData.knee.rotation.x = 0; });
  r.arms.forEach((a) => { a.rotation.x = 0.1; a.userData.elbow.rotation.x = 0.15; });
  const holder = new THREE.Group(); r.group.position.y = -0.55; r.group.scale.setScalar(0.95); holder.add(r.group);
  if (name) { const lb = nameSprite(name, color); lb.position.set(0, 3.3, 0); lb.scale.set(2.2, 0.55, 1); holder.add(lb); r.label = lb; }
  scene.add(holder);
  return { r, g: holder, walk: 0, yaw: 0 };
}
function animKid(k, moving, dt, t) {
  k.walk += dt * (moving ? 9 : 0);
  const sw = moving ? Math.sin(k.walk) * 0.7 : 0;
  k.r.legs[0].rotation.x = sw; k.r.legs[1].rotation.x = -sw;
  k.r.legs.forEach((l) => { l.userData.knee.rotation.x = moving ? Math.max(0, -Math.sin(k.walk + (l === k.r.legs[0] ? 0 : Math.PI))) * 0.6 : 0; });
  k.r.arms[0].rotation.x = 0.1 - sw * 0.6; k.r.arms[1].rotation.x = 0.1 + sw * 0.6;
  k.r.body.position.y = 1.12 + (moving ? Math.abs(Math.sin(k.walk)) * 0.06 : Math.sin(t / 600) * 0.015);
}
let me = null, others = new Map();
const P = { x: 0, z: 10, yaw: Math.PI, camYaw: Math.PI };

/* ---------------- input ---------------- */
const keys = {};
addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); keys[k] = true; if ((k === ' ' || k === 'e' || k === 'enter') && playing && $('paper').classList.contains('hidden')) { e.preventDefault(); act(); } if (k === 'escape') closePaper(); });
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
const joy = { x: 0, y: 0, id: null };
(function () {
  const el = $('joy'), knob = el.querySelector('i');
  const set = (e) => { const r = el.getBoundingClientRect(); let dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 38}px,${dy * 38}px)`; };
  el.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; el.setPointerCapture(e.pointerId); set(e); });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) set(e); });
  const end = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
})();
// seret di layar untuk memutar kamera
let drag = null;
cv.addEventListener('pointerdown', (e) => { drag = { id: e.pointerId, x: e.clientX }; });
addEventListener('pointermove', (e) => { if (drag && e.pointerId === drag.id) { P.camYaw -= (e.clientX - drag.x) * 0.006; drag.x = e.clientX; camManual = 1.5; } });
addEventListener('pointerup', (e) => { if (drag && e.pointerId === drag.id) drag = null; });
let camManual = 0;

/* ---------------- interaksi kertas ---------------- */
let near = null, openP = null, playing = false, startAt = 0, timeLeft = 0, score = 0, right = 0, wrong = 0, found = 0;
function targetPaper() { let best = null, bd = 1e9; for (const p of papers) { if (p.found) continue; const d = Math.hypot(p.g.position.x - P.x, p.g.position.z - P.z); if (d < bd) { bd = d; best = p; } } return best ? { p: best, d: bd } : null; }
function updateCompass() {
  const t = targetPaper(), el = $('compass'); if (!t) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const ang = Math.atan2(t.p.g.position.x - P.x, t.p.g.position.z - P.z); // arah dunia
  const rel = ang - (P.camYaw + Math.PI); // relatif arah pandang kamera
  el.querySelector('.ndl').style.transform = 'rotate(' + (-rel) + 'rad)';
  const d = t.d, lbl = d < 6 ? '🔥 Panas!' : d < 15 ? '♨️ Hangat' : d < 30 ? '🌤️ Sejuk' : '❄️ Dingin';
  el.querySelector('.tx').textContent = lbl; el.style.setProperty('--h', d < 6 ? '#ff5d5d' : d < 15 ? '#ff9f43' : d < 30 ? '#ffd23f' : '#4aa8ff');
}
function nearestPaper() { let best = null, bd = 2.0; for (const p of papers) { if (p.found) continue; const d = Math.hypot(p.g.position.x - P.x, p.g.position.z - P.z); if (d < bd) { bd = d; best = p; } } return best; }
function act() { if (!playing || !near) return; openPaper(near); }
function openPaper(p) {
  openP = p; Sfx.pop();
  p.q = p.qs[p.qi];
  $('pNo').textContent = 'Kertas ' + (p.i + 1) + ' · ditemukan di ' + p.kind + (p.qs.length > 1 && answerMode === 1 ? ' · soal ' + (p.qi + 1) + '/' + p.qs.length : '');
  if (answerMode === 0) {
    const qd = $('pQ'); qd.textContent = ''; qd.classList.add('list');
    p.qs.forEach((x, k) => {
      const it = document.createElement('div'); it.className = 'qi';
      const h = document.createElement('div'); h.className = 'qt'; h.textContent = (p.qs.length > 1 ? (k + 1) + '. ' : '') + x.q; it.appendChild(h);
      const ol = document.createElement('div'); ol.className = 'qo';
      x.o.forEach((o, j) => { const c = document.createElement('span'); c.innerHTML = '<b>' + 'ABCDE'[j] + '</b>'; c.append(o); ol.appendChild(c); });
      it.appendChild(ol); qd.appendChild(it);
    });
  } else { $('pQ').classList.remove('list'); $('pQ').textContent = p.q.q; }
  const box = $('pOpts'); box.innerHTML = '';
  $('pNoteBtns').classList.toggle('hidden', answerMode !== 0);
  box.classList.toggle('hidden', answerMode === 0);
  if (answerMode === 1) p.q.o.forEach((o, k) => {
    const b = document.createElement('button'); b.className = 'nb-sm press'; b.innerHTML = '<b>' + 'ABCDE'[k] + '</b>'; b.append(o);
    b.onclick = () => answer(p, k, b); box.appendChild(b);
  });
  $('paper').classList.remove('hidden');
  SAY(answerMode === 0 ? 'Catat soal ini di bukumu.' : p.q.q);
}
function closePaper() { $('paper').classList.add('hidden'); openP = null; }
function answer(p, k, btn) {
  if (p.found) return;
  if (k === p.q.a) {
    btn.classList.add('good'); right++; const gain = Math.max(40, 100 - p.tries * 30); score += gain; p.tries = 0; p.qi++;
    Sfx.good(); toast('✅ Benar! +' + gain, 'good');
    if (p.qi >= p.qs.length) { found++; markPaper(p); setTimeout(closePaper, 650); checkDone(); }
    else setTimeout(() => openPaper(p), 650);
    hud();
  } else {
    btn.classList.add('bad'); btn.disabled = true; wrong++; p.tries++; Sfx.bad(); toast('❌ Belum tepat. Coba pilihan lain.', 'bad'); hud();
  }
}
$('pNoted').addEventListener('click', () => { if (!openP || openP.found) return; found++; score += 100; markPaper(openP); Sfx.good(); toast('✍️ Kertas ' + (openP.i + 1) + ' dicatat!', 'good'); closePaper(); hud(); checkDone(); });
$('pClose').addEventListener('click', closePaper);
function checkDone() { if (found >= papers.length) { toast('🎉 Semua kertas ditemukan!', 'good'); SAY('Hebat! Semua kertas ditemukan.'); if (!ROOM) setTimeout(() => endGame(true), 1200); } }

/* ---------------- HUD ---------------- */
function toast(t, k) { const o = document.querySelector('.toast'); if (o) o.remove(); const d = document.createElement('div'); d.className = 'toast ' + (k || ''); d.textContent = t; document.body.appendChild(d); clearTimeout(toast.t); toast.t = setTimeout(() => d.remove(), 2200); }
function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function hud() { $('hFound').textContent = '📄 ' + found + '/' + papers.length; $('hScore').textContent = '⭐ ' + score;  }
function setInstr(t) { const el = $('instr'); if (el.textContent !== t) el.textContent = t; }

/* ---------------- Mabar: kirim posisi, terima murid lain ---------------- */
let posT = 0, myName = '';
function syncPos() {
  if (!ROOM || !playing) return;
  fetch('/api/ruang/' + ROOM.code + '/pos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid: ROOM.pid, tok: ROOM.tok, x: +P.x.toFixed(2), z: +P.z.toFixed(2), r: +P.yaw.toFixed(2), f: found }) })
    .then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d || !Array.isArray(d.players)) return;
      const seen = new Set();
      const all = d.players.map((x) => x.name).concat(myName).sort((a, b) => a.localeCompare(b));
      if (me && !me.colored) { me.colored = true; const k = all.indexOf(myName); if (k > 0) { scene.remove(me.g); me = makeKid(COLORS[k % COLORS.length], defaultChar(k), null); } }
      d.players.forEach((pl) => { const i = all.indexOf(pl.name);
        seen.add(pl.id);
        let o = others.get(pl.id);
        if (!o) { const k = makeKid(COLORS[i % COLORS.length], defaultChar(i), pl.name + ' · ' + (pl.f || 0)); o = { k, tx: pl.x, tz: pl.z, tr: pl.r, f: pl.f }; o.k.g.position.set(pl.x, 0, pl.z); others.set(pl.id, o); }
        o.tx = pl.x; o.tz = pl.z; o.tr = pl.r;
        if (o.f !== pl.f) { o.f = pl.f; o.k.g.remove(o.k.r.label); const lb = nameSprite(pl.name + ' · ' + pl.f, '#ffffff'); lb.position.set(0, 3.3, 0); lb.scale.set(2.2, 0.55, 1); o.k.g.add(lb); o.k.r.label = lb; }
      });
      others.forEach((o, id) => { if (!seen.has(id)) { scene.remove(o.k.g); others.delete(id); } });
    }).catch(() => {});
}

/* ---------------- alur ---------------- */
function resize() { const w = innerWidth, h = innerHeight; renderer.setPixelRatio(Math.min(lite ? 1 : 1.5, devicePixelRatio || 1)); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = cam.aspect < 1 ? 70 : 58; cam.updateProjectionMatrix(); }
addEventListener('resize', resize);
function begin(durationMs, name) {
  myName = name || ($('name').value.trim() || 'Aku');
  if (!me) me = makeKid(COLORS[0], charOf(), null);
  P.x = (Math.random() - 0.5) * 10; P.z = 10 + Math.random() * 4; P.yaw = Math.PI; P.camYaw = Math.PI;
  placePapers(ROOM ? 'room' + ROOM.code : 'set' + (setCode || 'demo'));
  found = 0; score = 0; right = 0; wrong = 0; papers.forEach((p) => { p.found = false; });
  timeLeft = durationMs / 1000; startAt = performance.now();
  ['menu', 'result'].forEach((id) => $(id).classList.add('hidden'));
  ['hud', 'instr', 'act', 'keys'].forEach((id) => $(id).classList.remove('hidden'));
  $('joy').classList.remove('hidden'); $('hTime').classList.add('hidden');
  playing = true; hud(); Sfx.go(); Sfx.music(true);
  const msg = answerMode === 0 ? 'Cari ' + papers.length + ' kertas soal. Catat soalnya di bukumu!' : 'Cari ' + papers.length + ' kertas soal di sekolah, lalu jawab!';
  setInstr(msg); SAY(msg);
  if (ROOM) { clearInterval(posT); posT = setInterval(syncPos, 800); }
}
function endGame(all) {
  if (!playing) return; playing = false; clearInterval(posT); Sfx.music(false); closePaper();
  ['instr', 'act', 'compass'].forEach((id) => $(id).classList.add('hidden'));
  if (ROOM) return; // papan akhir ditangani Ruang
  $('rTitle').textContent = all ? 'Semua ketemu! 🎉' : 'Waktu habis! ⏱';
  $('rSub').textContent = answerMode === 0 ? 'Serahkan catatanmu ke guru untuk dikoreksi.' : 'Hebat sudah menjelajahi sekolah!';
  $('rFound').textContent = found + '/' + papers.length; $('rRight').textContent = answerMode === 0 ? '-' : right; $('rScore').textContent = score;
  $('result').classList.remove('hidden'); if (all) { Sfx.win(); Fx.win(); }
  if (window.Koin && score) Koin.add(score / 20, 'Cari Soal Yuk');
}
$('again').addEventListener('click', () => begin(playMinutes * 60 * 1000));
$('bExit').addEventListener('click', () => Dialog.ask('Selesai bermain sekarang?', () => endGame(false)));
$('bMute').addEventListener('click', function () { try { localStorage.setItem('bgy_muted', Sfx.muted() ? '0' : '1'); } catch (e) {} this.textContent = Sfx.muted() ? '🔇' : '🔊'; Sfx.music(!Sfx.muted() && playing); });
$('bMute').textContent = Sfx.muted() ? '🔇' : '🔊';
$('act').addEventListener('click', act);
$('start').addEventListener('click', () => {
  if (ROOM) return;
  const nm = $('name').value.trim(); if (!nm) { $('name').focus(); $('name').placeholder = 'Tulis namamu dulu ya'; return; }
  try { localStorage.setItem('bgy_name', nm); } catch (e) {}
  if (!questions) questions = DEMO.slice();
  try { localStorage.setItem('bgy_char_0', JSON.stringify(CHARS[charIdx])); } catch (e) {}
  begin(playMinutes * 60 * 1000, nm);
});
try { $('name').value = localStorage.getItem('bgy_name') || ''; } catch (e) {}
// pilihan cara menjawab & soal per kertas (main tanpa ruang); ?mode=catat&per=2 juga bisa
if (Q.get('mode') === 'catat') answerMode = 0;
if (+Q.get('per') >= 1) perPaper = Math.min(5, +Q.get('per'));
function lockOpts() { ['rowMode', 'rowPer'].forEach((id) => { const el = $(id); if (el) el.classList.add('hidden'); }); }
// pilih karakter (dipakai juga di game lain)
const CHARS = [{ gender: 'l', skin: '#f6d3b3', head: 'pendek', seragam: 'sd' }, { gender: 'p', skin: '#e9b98f', head: 'jilbab', seragam: 'sd' }, { gender: 'p', skin: '#f6d3b3', head: 'kuncir', seragam: 'sd' }, { gender: 'l', skin: '#c98d63', head: 'peci', seragam: 'sd' }, { gender: 'p', skin: '#c98d63', head: 'panjang', seragam: 'sd' }, { gender: 'l', skin: '#8d5a3b', head: 'topi', seragam: 'sd' }];
let charIdx = 0; try { charIdx = +localStorage.getItem('cs_char') || 0; } catch (e) {}
(function () {
  const box = $('chars'), names = ['Rambut pendek', 'Jilbab', 'Kuncir', 'Peci', 'Rambut panjang', 'Topi'], ic = ['👦', '🧕', '👧', '🧒🏽', '👩🏽', '👦🏿'];
  CHARS.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'nb-sm press ch'; b.innerHTML = '<span>' + ic[i] + '</span><small>' + names[i] + '</small>'; b.onclick = () => { charIdx = i; try { localStorage.setItem('cs_char', i); } catch (e) {} mark(); Sfx.click(); }; box.appendChild(b); });
  const mark = () => [...box.children].forEach((b, i) => b.classList.toggle('on', i === charIdx)); mark();
})();
function seg(id, get, set) { const el = $(id); const mark = () => [...el.children].forEach((b) => b.classList.toggle('on', +b.dataset.n === get())); el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; set(+b.dataset.n); mark(); Sfx.click(); }); mark(); }
lockOpts(); // cara jawab & soal per kertas hanya diatur guru
seg('segMode', () => answerMode, (n) => { answerMode = n; });
seg('segPer', () => perPaper, (n) => { perPaper = n; });

/* ---------------- loop ---------------- */
const tmp = new THREE.Vector3(), camT = new THREE.Vector3();
let last = 0;
function collide(x, z) {
  const r = 0.45;
  if (x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) return true;
  if (colliders.some((c) => x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1)) return true;
  return circles.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + r);
}
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
  let moving = false;
  if (playing && $('paper').classList.contains('hidden')) {
    // tanpa batas waktu (kecuali Mabar yang diatur guru)
    let fx = 0, fz = 0;
    const kf = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0), ks = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    const f = kf - joy.y, s = ks + joy.x;
    if (Math.abs(f) > 0.05 || Math.abs(s) > 0.05) {
      // arah relatif kamera
      const fwdX = -Math.sin(P.camYaw), fwdZ = -Math.cos(P.camYaw), rX = Math.cos(P.camYaw), rZ = -Math.sin(P.camYaw);
      fx = fwdX * f + rX * s; fz = fwdZ * f + rZ * s; const l = Math.hypot(fx, fz); fx /= l; fz /= l;
      const sp = 6 * Math.min(1, Math.hypot(f, s)) * dt;
      const nx = P.x + fx * sp, nz = P.z + fz * sp;
      if (!collide(nx, P.z)) P.x = nx; if (!collide(P.x, nz)) P.z = nz;
      const targetYaw = Math.atan2(fx, fz); let d = targetYaw - P.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; P.yaw += d * Math.min(1, dt * 10);
      moving = true;
    }
    // kamera pelan-pelan kembali ke belakang pemain bila tidak diputar manual
    camManual = Math.max(0, camManual - dt);
    if (moving && camManual <= 0) { let d = (P.yaw + Math.PI) - P.camYaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; P.camYaw += d * Math.min(1, dt * 1.6); }
    near = nearestPaper(); updateCompass();
    const a = $('act'); a.classList.toggle('dim', !near); a.textContent = near ? '📄 Buka kertas ' + (near.i + 1) : 'Cari kertas…';
    setInstr(near ? 'Ketemu kertas! Tekan Buka.' : (found >= papers.length ? 'Semua kertas sudah ditemukan! 🎉' : 'Sisa ' + (papers.length - found) + ' kertas. Telusuri sekolah dengan teliti…'));
  }
  if (me) { me.g.position.set(P.x, 0, P.z); me.g.rotation.y = P.yaw + Math.PI; animKid(me, moving, dt, t); }
  others.forEach((o) => { const g = o.k.g, mv = Math.hypot(o.tx - g.position.x, o.tz - g.position.z) > 0.05; g.position.x += (o.tx - g.position.x) * Math.min(1, dt * 6); g.position.z += (o.tz - g.position.z) * Math.min(1, dt * 6); let d = (o.tr + Math.PI) - g.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; g.rotation.y += d * Math.min(1, dt * 8); animKid(o.k, mv, dt, t); });
  papers.forEach((p) => { if (!p.flat) p.m.rotation.z = Math.sin(t / 500 + p.ph) * 0.06; const d = Math.hypot(p.g.position.x - P.x, p.g.position.z - P.z); p.glow.material.opacity = p.found ? 0 : Math.max(0, 1 - d / 3) * (0.5 + 0.5 * Math.sin(t / 200)); });
  if (scene.userData.flag) scene.userData.flag.children.forEach((c, i) => { c.rotation.y = Math.sin(t / 260 + i) * 0.3; });
  // kamera orang ketiga
  const dist = cam.aspect < 1 ? 9.5 : 8.5, h = cam.aspect < 1 ? 7.5 : 6.6;
  camT.set(P.x + Math.sin(P.camYaw) * dist, h, P.z + Math.cos(P.camYaw) * dist);
  cam.position.lerp(camT, Math.min(1, dt * 6)); cam.lookAt(P.x, 1.6, P.z);
  sun.position.set(P.x + 14, 30, P.z + 10); sun.target.position.set(P.x, 0, P.z);
  renderer.render(scene, cam);
}
buildWorld(); resize(); requestAnimationFrame(frame);
cam.position.set(0, 18, 34); cam.lookAt(0, 0, 0);

/* ---------------- awal: set guru / ruang ---------------- */
if (ROOM) {
  lockOpts(); $('name').classList.add('hidden'); document.querySelector('.how').classList.add('hidden');
  $('start').textContent = '▶ SIAP, MASUK RUANG';
  let ready = false;
  fetch('/api/ruang/' + ROOM.code + '/status?pid=' + encodeURIComponent(ROOM.pid) + '&tok=' + encodeURIComponent(ROOM.tok)).then((r) => r.json()).then((d) => { const qe = Number(d.quizEvery) || 0; answerMode = qe % 10 === 0 ? 0 : 1; perPaper = Math.max(1, Math.min(5, Math.floor(qe / 10) || 1)); }).catch(() => {});
  if (setCode) loadSet(setCode).then(() => { ready = true; }).catch(() => { questions = DEMO.slice(); ready = true; }); else { questions = DEMO.slice(); ready = true; }
  $('start').onclick = (e) => { e.stopImmediatePropagation(); $('menu').classList.add('hidden'); Sfx.click(); startRuang(); };
  const startRuang = () => Ruang.init({
    noTimer: true,
    ready: () => ready,
    onStart: (ms, name) => begin(ms, name),
    getStats: () => ({ score, caught: found, quizRight: right, quizWrong: wrong }),
    onEnd: () => endGame(false),
  });
} else if (setCode) {
  const info = $('setinfo'); info.classList.remove('hidden'); info.textContent = '⏳ Memuat soal dari guru...';
  loadSet(setCode).then(() => { info.textContent = '📚 Soal guru: ' + setTitle + ' · ' + Math.ceil(questions.length / perPaper) + ' kertas' + (answerMode === 0 ? ' · tulis di kertas' : ''); info.className = 'setinfo ok'; })
    .catch(() => { info.textContent = '⚠️ Kode soal tidak ditemukan. Memakai soal contoh.'; info.className = 'setinfo err'; });
}
window.__cs = { state: () => ({ playing, found, n: papers.length, score, pos: [P.x, P.z], papers: papers.map((p) => ({ x: p.g.position.x, z: p.g.position.z, f: p.found, a: p.q.a })) }), tp: (x, z) => { P.x = x; P.z = z; }, open: () => near && openPaper(near), answer: (k) => { const b = $('pOpts').children[k]; b && b.click(); } };
