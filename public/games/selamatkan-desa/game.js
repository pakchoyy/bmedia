/* Main-yuk · Misi Selamatkan Desa — seret & pilah sampah di sungai (Three.js r160, tanpa library lain).
   Mode: Belajar (kenali sampah + latihan), Battle (2–4 pemain rebutan di satu sungai, tiap pemain punya
   tempat sampah sendiri), Kerja Sama (1–4 pemain, dua tempat sampah bersama, skor gabungan). */
import * as THREE from '/games/_shared/three.module.min.js';
import { makeRider, defaultChar } from '/games/_shared/gowes3d.js';

const $ = (id) => document.getElementById(id);
const A = 'assets/';
const E = (c) => 'emoji/' + c; // gambar sementara (Twemoji, CC-BY 4.0) sampai aset buatan sendiri tersedia
const ITEMS = {
  pisang: { nama: 'Kulit pisang', cat: 'org', img: 'pisang', info: 'Berasal dari buah. Cepat membusuk.', hint: 'Kulit pisang berasal dari buah. Termasuk sampah apa?' },
  daun: { nama: 'Daun kering', cat: 'org', img: 'daun', info: 'Berasal dari pohon. Bisa jadi kompos.', hint: 'Daun berasal dari pohon, makhluk hidup. Termasuk sampah apa?' },
  jeruk: { nama: 'Kulit jeruk', cat: 'org', img: E('1f34a'), info: 'Berasal dari buah. Mudah membusuk.', hint: 'Jeruk itu buah. Kulitnya mudah membusuk. Masuk ke mana?' },
  sayur: { nama: 'Sisa sayuran', cat: 'org', img: E('1f96c'), info: 'Berasal dari tumbuhan. Bisa jadi pupuk.', hint: 'Sayuran berasal dari tumbuhan. Termasuk sampah apa?' },
  telur: { nama: 'Cangkang telur', cat: 'org', img: E('1f95a'), info: 'Berasal dari ayam. Bisa terurai di tanah.', hint: 'Telur berasal dari ayam, makhluk hidup. Masuk ke mana?' },
  nasi: { nama: 'Sisa makanan', cat: 'org', img: E('1f35a'), info: 'Sisa nasi dan makanan mudah membusuk.', hint: 'Sisa makanan akan membusuk. Termasuk sampah apa?' },
  mangga: { nama: 'Kulit mangga', cat: 'org', img: E('1f96d'), info: 'Berasal dari buah. Cepat membusuk.', hint: 'Mangga itu buah. Kulitnya mudah membusuk. Masuk ke mana?' },
  ranting: { nama: 'Ranting', cat: 'org', img: E('1fab5'), info: 'Berasal dari pohon. Lama-lama lapuk.', hint: 'Ranting berasal dari pohon. Termasuk sampah apa?' },
  botol: { nama: 'Botol plastik', cat: 'ano', img: 'botol', info: 'Plastik sangat lama terurai. Bisa didaur ulang.', hint: 'Plastik dibuat di pabrik dan tidak membusuk. Masuk ke mana?' },
  kaleng: { nama: 'Kaleng', cat: 'ano', img: 'kaleng', info: 'Terbuat dari logam. Bisa didaur ulang.', hint: 'Kaleng terbuat dari logam. Logam tidak membusuk. Masuk ke mana?' },
  kardus: { nama: 'Kardus', cat: 'ano', img: 'kardus', info: 'Bisa didaur ulang jadi kertas baru.', hint: 'Kardus dibuat di pabrik dan bisa didaur ulang. Masuk ke mana?' },
  kaca: { nama: 'Botol kaca', cat: 'ano', img: E('1f37e'), info: 'Kaca tidak membusuk. Bisa dilebur dan dipakai lagi.', hint: 'Kaca tidak membusuk. Termasuk sampah apa?' },
  gelas: { nama: 'Gelas plastik', cat: 'ano', img: E('1f964'), info: 'Plastik sangat lama terurai. Bisa didaur ulang.', hint: 'Gelas ini dari plastik. Plastik masuk ke mana?' },
  kertas: { nama: 'Kertas', cat: 'ano', img: E('1f4f0'), info: 'Kertas bekas bisa didaur ulang jadi kertas baru.', hint: 'Kertas bekas bisa didaur ulang. Masuk ke mana?' },
};
const CATN = { org: 'Organik', ano: 'Anorganik' };
const LEVEL = {
  1: { keys: ['pisang', 'daun', 'jeruk', 'botol', 'kaleng', 'gelas'], cross: 26, max: 6, gap: 3.2 },
  2: { keys: ['pisang', 'daun', 'jeruk', 'sayur', 'telur', 'botol', 'kaleng', 'gelas', 'kardus', 'kertas'], cross: 20, max: 7, gap: 2.4 },
  3: { keys: Object.keys(ITEMS), cross: 15, max: 8, gap: 1.8 },
};
const COLORS = ['#ff5d8f', '#4aa8ff', '#ffd23f', '#2ec4b6'];
const LW = 3.2; // lebar sungai = 4 × LW

/* ---------------- menu & pengaturan ---------------- */
let mode = 'battle', practice = false, nBattle = 2, nCoop = 1, level = 1, target = 15, timeLimit = 0, gfx = 'bagus';
try {
  nBattle = +localStorage.getItem('sd_nb') || 2; nCoop = +localStorage.getItem('sd_nc') || 1; level = +localStorage.getItem('sd_level') || 1;
  target = +localStorage.getItem('sd_target') || 15; timeLimit = +localStorage.getItem('sd_time') || 0;
  gfx = localStorage.getItem('bgy_gfx') || ((navigator.hardwareConcurrency || 8) <= 4 ? 'ringan' : 'bagus');
} catch (e) {}
const lite = () => gfx === 'ringan';
const say = (t) => { if (window.Suara && !Sfx.muted()) Suara.read(t, { force: true }); };
function seg(id, fn, isOn) {
  const el = $(id);
  el._mark = () => [...el.children].forEach((b) => b.classList.toggle('on', isOn(b.dataset.n)));
  el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fn(b.dataset.n); el._mark(); Sfx.click(); });
  el._mark();
}
const np = () => (mode === 'battle' ? nBattle : nCoop);
seg('segLevel', (n) => { level = +n; }, (n) => +n === level);
seg('segTarget', (n) => { target = +n; }, (n) => +n === target);
seg('segTime', (n) => { timeLimit = +n; }, (n) => +n === timeLimit);
seg('segGfx', (n) => { gfx = n; try { localStorage.setItem('bgy_gfx', n); } catch (e) {} }, (n) => n === gfx);
function renderPlayersSeg() {
  const el = $('segPlayers'), opts = mode === 'battle' ? [2, 3, 4] : [1, 2, 3, 4];
  el.innerHTML = opts.map((n) => '<button class="nb-sm press" data-n="' + n + '">' + n + '</button>').join('');
  el.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (mode === 'battle') nBattle = +b.dataset.n; else nCoop = +b.dataset.n; mark(); renderNames(); Sfx.click(); };
  const mark = () => [...el.children].forEach((b) => b.classList.toggle('on', +b.dataset.n === np())); mark();
}
// karakter sementara mengikuti karakter Gowes (bgy_char_i) sampai aset karakter khusus siap
const charOf = (i) => { try { return JSON.parse(localStorage.getItem('bgy_char_' + i) || 'null') || defaultChar(i); } catch (e) { return defaultChar(i); } };
const nameOf = (i) => { try { return localStorage.getItem('sd_name_' + i) || ''; } catch (e) { return ''; } };
function renderNames() {
  const box = $('names'); box.innerHTML = '';
  for (let i = 0; i < np(); i++) {
    const d = document.createElement('div'); d.className = 'nm';
    d.innerHTML = '<span class="dot"></span><input maxlength="16" autocomplete="off">';
    d.querySelector('.dot').style.background = COLORS[i];
    const inp = d.querySelector('input'); inp.placeholder = 'Pemain ' + (i + 1); inp.value = nameOf(i);
    inp.addEventListener('change', () => { try { localStorage.setItem('sd_name_' + i, inp.value.trim()); } catch (e) {} });
    box.appendChild(d);
  }
}
function show(id) { ['menu', 'setup', 'learn', 'result', 'pause', 'brief'].forEach((s) => $(s).classList.toggle('hidden', s !== id)); }
document.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => {
  Sfx.click();
  if (b.dataset.m === 'learn') { renderLearn(); show('learn'); say('Kenali sampah organik dan anorganik. Ketuk gambar untuk mendengar penjelasannya.'); return; }
  mode = b.dataset.m; practice = false;
  $('suTitle').textContent = mode === 'battle' ? '⚔️ Battle' : '🤝 Kerja Sama';
  renderPlayersSeg(); renderNames(); show('setup');
}));
document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { Sfx.click(); if (window.speechSynthesis) speechSynthesis.cancel(); show('menu'); }));
function renderLearn() {
  ['org', 'ano'].forEach((c) => {
    const box = $(c === 'org' ? 'lcOrg' : 'lcAno'); if (box.childElementCount) return;
    Object.entries(ITEMS).filter(([, it]) => it.cat === c).forEach(([, it]) => {
      const b = document.createElement('button'); b.className = 'lc nb-sm press'; b.type = 'button';
      b.innerHTML = '<img alt=""><span><b></b><small></small></span>';
      b.querySelector('img').src = A + it.img + '.png'; b.querySelector('b').textContent = it.nama; b.querySelector('small').textContent = it.info;
      b.addEventListener('click', () => { Sfx.click(); if (window.Suara) Suara.say(it.nama + '. ' + it.info + ' Termasuk sampah ' + CATN[c] + '.'); });
      box.appendChild(b);
    });
  });
}
$('practice').addEventListener('click', () => { mode = 'coop'; practice = true; start(); });

/* ---------------- renderer & adegan ---------------- */
const cv = $('cv'), stage = $('stage');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const SKY_RAIN = new THREE.Color(0x8ea9bd), SKY_SUN = new THREE.Color(0x8fd3ff);
scene.background = SKY_RAIN.clone(); scene.fog = new THREE.Fog(0x8ea9bd, 45, 95);
const cam = new THREE.PerspectiveCamera(48, 1, 0.3, 200);
const hemi = new THREE.HemisphereLight(0xe6f3ff, 0x5a8a45, 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 1.4); sun.position.set(14, 26, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -30, near: 1, far: 80 }); scene.add(sun);

const mats = new Map();
function M(c, o = {}) { const k = c + JSON.stringify(o); if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8 }, o))); return mats.get(k); }
function box(w, h, d, m, x, y, z, parent = scene) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'number' ? M(m) : m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b; }
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 4; return t; }
const loader = new THREE.TextureLoader(), texCache = {};
function tex(n) { if (!texCache[n]) { const t = loader.load(A + n + '.png'); t.colorSpace = THREE.SRGBColorSpace; texCache[n] = t; } return texCache[n]; }
const aspects = {}; // lebar/tinggi tiap PNG
Object.values(ITEMS).map((it) => it.img).concat(['boy', 'girl', 'emoji/1f41f']).forEach((n) => { const im = new Image(); im.onload = () => { aspects[n] = im.width / im.height; }; im.src = A + n + '.png'; });
function sprite(n, h) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(n), transparent: true, alphaTest: 0.06 })); s.center.set(0.5, 0); s.userData = { n, h }; fitSprite(s); return s; }
function fitSprite(s) { const ar = aspects[s.userData.n] || 0.6; s.scale.set(s.userData.h * ar * (s.userData.flip || 1), s.userData.h, 1); }
function mergeGeos(list) { const p = [], n = []; list.forEach((g) => { const ng = g.index ? g.toNonIndexed() : g; p.push(...ng.attributes.position.array); n.push(...ng.attributes.normal.array); }); const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); return m; }

const world = { lanes: 0, group: null };
const waterT = canvasTex(128, 128, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#2f8fcf'); g.addColorStop(.5, '#46a9e6'); g.addColorStop(1, '#2f8fcf'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) { const yy = Math.random() * h, xx = Math.random() * w; x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + 8, yy + 4, xx + 18, yy); x.stroke(); }
}, [2, 10]);
function buildWorld(lanes) {
  if (world.group) scene.remove(world.group);
  const G = new THREE.Group(); scene.add(G); world.group = G; world.lanes = lanes;
  const RW = lanes * LW, half = RW / 2;
  // air
  const water = new THREE.Mesh(new THREE.PlaneGeometry(RW, 80), new THREE.MeshStandardMaterial({ map: waterT, roughness: 0.4, metalness: 0, color: 0xd2efff }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.15, -30); water.receiveShadow = true; G.add(water); world.water = water;
  waterT.repeat.set(2, 9);
  // tepi sungai: tanah, batu, rumput
  const grassT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6cbd4e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 800; i++) { x.fillStyle = Math.random() < .5 ? '#5eae41' : '#7fcd5c'; x.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, [20, 20]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: grassT, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = 0.02; ground.receiveShadow = true; G.add(ground);
  // potong rumput di area sungai: pakai dinding tepi (tanah coklat) menutupi
  [-1, 1].forEach((s) => {
    box(1.4, 0.5, 80, M(0xa27a52), s * (half + 0.7), 0.0, -30, G);
  });
  ground.position.x = 0; ground.geometry = holedGround(RW);
  // batu-batu di tepi
  const rocks = []; for (let z = 4; z > -58; z -= 1.3) [-1, 1].forEach((s) => { if (Math.random() < .55) rocks.push([s * (half + 0.3 + Math.random() * .7), z + Math.random(), 0.25 + Math.random() * .35]); });
  inst(G, new THREE.DodecahedronGeometry(1, 0), M(0x8d939c, { flatShading: true }), rocks, (o, p) => { o.position.set(p[0], 0.1, p[1]); o.scale.set(p[2] * 1.3, p[2], p[2]); o.rotation.set(p[1], p[0], 0); });
  // pohon kelapa, pisang, rindang
  const palms = [], round = [], bush = [];
  for (let z = 6; z > -62; z -= 3.2) [-1, 1].forEach((s) => {
    const x = s * (half + 3 + Math.random() * 7);
    if (s < 0) { bush.push([s * (half + 1.6 + Math.random() * 1.2), z + 1.5, 0.45 + Math.random() * .35]); return; } // tepi dekat kamera: hanya semak rendah
    if (Math.random() < .55) palms.push([x, z, 0.8 + Math.random() * .5, Math.random() * 6]); else round.push([x, z, 0.8 + Math.random() * .5]);
    bush.push([s * (half + 1.8 + Math.random() * 1.5), z + 1.5, 0.6 + Math.random() * .5]);
  });
  inst(G, new THREE.CylinderGeometry(0.18, 0.3, 5, 7), M(0x9b7448), palms, (o, p) => { o.position.set(p[0], 2.5 * p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, 0, 0.08 * Math.sign(p[0])); });
  const leaf = []; for (let i = 0; i < 8; i++) { const g = new THREE.BoxGeometry(0.6, 0.06, 2.8); g.translate(0, 0, 1.4); g.rotateX(0.5); g.rotateY(i / 8 * Math.PI * 2); leaf.push(g); }
  inst(G, mergeGeos(leaf), M(0x2fb84a, { flatShading: true }), palms, (o, p) => { o.position.set(p[0] + 0.35 * p[2] * Math.sign(p[0]), 5 * p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, p[3], 0); });
  inst(G, new THREE.CylinderGeometry(0.25, 0.4, 2, 7), M(0x7a5536), round, (o, p) => { o.position.set(p[0], p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, 0, 0); });
  inst(G, new THREE.IcosahedronGeometry(1.8, 1), M(0x2f9e44, { flatShading: true }), round, (o, p) => { o.position.set(p[0], 3 * p[2], p[1]); o.scale.setScalar(p[2]); });
  inst(G, new THREE.IcosahedronGeometry(0.7, 1), M(0x3cbf55, { flatShading: true }), bush, (o, p) => { o.position.set(p[0], 0.4 * p[2], p[1]); o.scale.set(p[2], p[2] * 0.75, p[2]); });
  // rumah desa di kejauhan + sekolah berbendera
  const roofs = [0xd8432f, 0x2f7de0, 0xff8a1f, 0xd8432f];
  [-14, -22, -30, -38, -46, -6, 2].forEach((z, i) => house(G, half + 12 + (i % 2) * 4, z, roofs[i % 4], i % 3 === 0 ? 'kayu' : 'bata'));
  school(G, half + 9, -26);
  // hujan
  const N = lite() ? 250 : 800, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 26, y = Math.random() * 25, z = -62 + Math.random() * 52; pos.set([x, y, z, x + .1, y - .9, z + .2], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  world.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xe6f4ff, transparent: true, opacity: 0.5 })); world.rain.frustumCulled = false; G.add(world.rain);
  // sungai melintang layar: hulu (jembatan) di kiri, arus ke kanan
  G.rotation.y = Math.PI / 2; G.position.x = 28;
}
function holedGround(RW) {
  // tanah berlubang selebar sungai: dua bidang kiri & kanan + depan
  const parts = [];
  const L = new THREE.PlaneGeometry(100, 200); L.translate(-(RW / 2 + 50), 0, 0); parts.push(L);
  const R = new THREE.PlaneGeometry(100, 200); R.translate(RW / 2 + 50, 0, 0); parts.push(R);
  const F = new THREE.PlaneGeometry(RW, 96); F.translate(0, -(96 / 2 + 7.2 - 0), 0); parts.push(F); // y lokal = -z dunia
  const B = new THREE.PlaneGeometry(RW, 40); B.translate(0, 72 + 20, 0); parts.push(B);
  const g = mergeGeos(parts);
  const uv = []; const p = g.attributes.position.array; for (let i = 0; i < p.length; i += 3) uv.push(p[i] / 10, p[i + 1] / 10);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return g;
}
const _o = new THREE.Object3D();
function inst(parent, geo, mat, list, f) { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((p, i) => { f(_o, p); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); }); m.castShadow = true; parent.add(m); return m; }
let _brick, _wood;
function house(G, x, z, roofC, type) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; G.add(g);
  _brick = _brick || canvasTex(128, 64, (c) => { c.fillStyle = '#b5553a'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#8e3f2a'; c.lineWidth = 2; for (let r = 0; r < 8; r++) { c.beginPath(); c.moveTo(0, r * 8); c.lineTo(128, r * 8); c.stroke(); for (let k = 0; k < 8; k++) { const xx = k * 16 + (r % 2) * 8; c.beginPath(); c.moveTo(xx, r * 8); c.lineTo(xx, r * 8 + 8); c.stroke(); } } c.fillStyle = '#5a3418'; c.fillRect(56, 30, 16, 34); c.fillStyle = '#9fd8ff'; c.fillRect(18, 22, 16, 14); c.fillRect(94, 22, 16, 14); });
  _wood = _wood || canvasTex(128, 64, (c) => { c.fillStyle = '#a8693c'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#7d4a26'; c.lineWidth = 2; for (let r = 0; r < 8; r++) { c.beginPath(); c.moveTo(0, r * 8 + 4); c.lineTo(128, r * 8 + 4); c.stroke(); } c.fillStyle = '#5a3418'; c.fillRect(56, 26, 18, 38); c.fillStyle = '#9fd8ff'; c.fillRect(16, 18, 18, 16); c.fillRect(94, 18, 18, 16); });
  const lift = type === 'kayu' ? 0.8 : 0;
  if (lift) [[-2.2, -1.6], [2.2, -1.6], [-2.2, 1.6], [2.2, 1.6]].forEach(([a, b]) => box(0.3, lift, 0.3, 0x6a4a32, a, lift / 2, b, g));
  box(5, 2.6, 3.8, new THREE.MeshStandardMaterial({ map: type === 'kayu' ? _wood : _brick }), 0, lift + 1.3, 0, g);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 5.8, 3), M(roofC, { roughness: 0.55 })); roof.rotation.set(Math.PI / 6, 0, Math.PI / 2); roof.scale.set(1, 1, 0.78); roof.position.y = lift + 3.55; roof.castShadow = true; g.add(roof);
}
function school(G, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 2; G.add(g);
  const t = canvasTex(256, 64, (c) => { c.fillStyle = '#f3e3c3'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#c0392b'; c.fillRect(0, 46, 256, 18); for (let i = 0; i < 4; i++) { c.fillStyle = '#6a4a32'; c.fillRect(20 + i * 62, 10, 30, 30); c.fillStyle = '#9fd8ff'; c.fillRect(23 + i * 62, 13, 24, 24); } });
  box(10, 3, 5, new THREE.MeshStandardMaterial({ map: t }), 0, 1.5, 0, g);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 11, 3), M(0xd8432f)); roof.rotation.set(Math.PI / 6, 0, Math.PI / 2); roof.scale.set(1, 1, 0.75); roof.position.y = 4.2; g.add(roof);
  box(0.12, 6, 0.12, 0xdddddd, 6.5, 3, 3, g);
  const fl = new THREE.Group(); fl.position.set(6.5, 5.6, 3); g.add(fl);
  const r = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.48), new THREE.MeshBasicMaterial({ color: 0xe8202a, side: THREE.DoubleSide })); r.position.set(0.75, 0.24, 0); fl.add(r);
  const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.48), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); w.position.set(0.75, -0.24, 0); fl.add(w);
  world.flag = fl;
}

/* ---------------- permainan ---------------- */
let players = [], items = [], running = false, finished = false, seq = [], seqI = 0, spawnT = 0, startAt = 0, timeLeft = 0, pausedAt = 0;
let team = null; // skor bersama (Kerja Sama)
const stageRect = () => stage.getBoundingClientRect();
let spanHalf = 12; // setengah lebar sungai yang terlihat (unit dunia)
const SLOTS = [-4.2, -1.4, 1.4, 4.2];
const ITEM_H = 2.25;
function newStats(o) { return Object.assign({ score: 0, org: 0, ano: 0, wrong: 0, combo: 0, best: 0 }, o); }

function buildBins() {
  const box = $('bins'); box.innerHTML = ''; box.classList.remove('hidden'); box.classList.toggle('coop', mode !== 'battle');
  const groups = mode === 'battle' ? players : [{ i: -1, name: practice ? 'Latihan' : 'Tim Desa', color: '#ffffff', chars: players.map((p) => p.char) }];
  groups.forEach((P) => {
    const g = document.createElement('div'); g.className = 'grp'; g.style.setProperty('--c', P.color);
    const chars = P.chars || [P.char];
    g.innerHTML = '<div class="gh"><span class="dot"></span><span class="nmx"></span><span class="sc">0</span></div>' +
      '<div class="pair">' + ['org', 'ano'].map((c) => '<div class="bin ' + c + '" data-p="' + P.i + '" data-cat="' + c + '"><i class="lid"></i><i class="body"></i><span>' + CATN[c] + '</span></div>').join('') + '</div>';
    g.querySelector('.nmx').textContent = P.name;
    g.querySelectorAll('.bin').forEach((b) => { const url = 'url(' + A + (b.dataset.cat === 'org' ? 'bin-organik' : 'bin-anorganik') + '.png)'; b.querySelector('.lid').style.backgroundImage = url; b.querySelector('.body').style.backgroundImage = url; });
    box.appendChild(g); P.el = g;
  });
  if (mode !== 'battle') team.el = box.firstChild;
}
function owner(i) { return mode === 'battle' ? players[i] : team; }
function hud() {
  const done = mode === 'battle' ? seqI - items.filter((x) => x.state !== 'gone').length : team.org + team.ano;
  $('hProg').textContent = '♻️ ' + Math.min(target, mode === 'battle' ? resolved : team.org + team.ano) + '/' + target;
  $('hScore').classList.toggle('hidden', mode === 'battle'); if (team) $('hScore').textContent = '⭐ ' + team.score;
  (mode === 'battle' ? players : [team]).forEach((P) => { if (P.el) P.el.querySelector('.sc').textContent = P.score; });
  if (timeLimit) { const s = Math.max(0, Math.ceil(timeLeft)); $('hTime').textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
}
let resolved = 0;
function progress() { return Math.min(1, mode === 'battle' ? resolved / target : (team.org + team.ano) / target); }

/* sampah muncul bertahap, hanya bila ada ruang */
function canSpawnAt(z, x0) { return !items.some((it) => it.state !== 'gone' && Math.abs(it.z - z) < 2.2 && it.x < x0 + 4.2); }
function spawn(xStart) {
  if (mode === 'battle' && seqI >= target) return;
  const L = LEVEL[level], vis = items.filter((it) => it.state === 'float' || it.state === 'held').length;
  if (vis >= L.max) return;
  const x0 = xStart != null ? xStart : -spanHalf - 1.2;
  const free = SLOTS.filter((z) => canSpawnAt(z, x0)); if (!free.length) return;
  const z = free[Math.floor(Math.random() * free.length)] + (Math.random() - 0.5) * 0.6;
  const key = seq[seqI++ % seq.length], it = ITEMS[key];
  const s = sprite(it.img, it.img.startsWith('emoji') ? ITEM_H * 0.9 : ITEM_H); s.position.set(x0, -0.1, z); scene.add(s);
  const sh = new THREE.Mesh(new THREE.RingGeometry(0.55, 1.05, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.set(x0, -0.12, z); scene.add(sh);
  items.push({ key, s, sh, x: x0, z, v: (2 * spanHalf + 3) / L.cross * (0.88 + Math.random() * 0.24), ph: Math.random() * 6, state: 'float' });
}
function removeItem(it) { it.state = 'gone'; scene.remove(it.s); scene.remove(it.sh); }

/* ---------------- seret & lepas (pointer events, multi-sentuh) ---------------- */
const drags = new Map(); // pointerId → {it, ghost, hot}
const tmpV = new THREE.Vector3();
function screenOf(it) { tmpV.set(it.x, 0.7, it.z).project(cam); const r = stageRect(); return { x: r.left + (tmpV.x + 1) / 2 * r.width, y: r.top + (1 - tmpV.y) / 2 * r.height }; }
function screenSize(it) { const a = tmpV.set(it.x, 0, it.z).project(cam).y, b = tmpV.set(it.x, ITEM_H, it.z).project(cam).y; return Math.abs(a - b) / 2 * stageRect().height; }
cv.addEventListener('pointerdown', (e) => {
  if (!running) return;
  e.preventDefault();
  let best = null, bd = 1e9;
  for (const it of items) {
    if (it.state !== 'float') continue;
    const p = screenOf(it), d = Math.hypot(p.x - e.clientX, p.y - e.clientY), r = Math.max(56, screenSize(it) * 0.8);
    if (d < r && d < bd) { bd = d; best = it; }
  }
  if (!best) return;
  if (window.Tutor) Tutor.done();
  best.state = 'held'; best.s.visible = false; best.sh.visible = false;
  const size = Math.max(84, Math.min(150, screenSize(best) * 1.3));
  const g = document.createElement('img'); g.className = 'ghost'; g.src = A + ITEMS[best.key].img + '.png'; g.style.width = size + 'px';
  g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; document.body.appendChild(g);
  drags.set(e.pointerId, { it: best, ghost: g, hot: null, size }); setInstr();
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  Sfx.pop();
});
function binAt(x, y) {
  let best = null, bd = 1e9;
  document.querySelectorAll('#bins .bin').forEach((b) => {
    const r = b.getBoundingClientRect(), pad = 34; // area magnet
    if (x > r.left - pad && x < r.right + pad && y > r.top - pad * 2 && y < r.bottom + pad) {
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)); if (d < bd) { bd = d; best = b; }
    }
  });
  return best;
}
function setHot(d, b) {
  if (d.hot === b) return;
  if (d.hot) { d.hot._n = (d.hot._n || 1) - 1; if (!d.hot._n) d.hot.classList.remove('hot'); }
  d.hot = b;
  if (b) { b._n = (b._n || 0) + 1; b.classList.add('hot'); }
}
addEventListener('pointermove', (e) => {
  const d = drags.get(e.pointerId); if (!d) return;
  e.preventDefault();
  const b = binAt(e.clientX, e.clientY); setHot(d, b);
  let x = e.clientX, y = e.clientY;
  if (b) { const r = b.getBoundingClientRect(); x += (r.left + r.width / 2 - x) * 0.25; y += (r.top + r.height * 0.35 - y) * 0.25; } // tarikan magnet
  d.ghost.style.left = x + 'px'; d.ghost.style.top = y + 'px';
}, { passive: false });
function endDrag(e) {
  const d = drags.get(e.pointerId); if (!d) return;
  drags.delete(e.pointerId); setInstr();
  const b = d.hot; setHot(d, null);
  if (b && running) drop(d, b); else flyBack(d);
}
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
function flyBack(d, after) {
  const it = d.it, p = screenOf(it);
  const an = d.ghost.animate([{ left: d.ghost.style.left, top: d.ghost.style.top }, { left: p.x + 'px', top: p.y + 'px' }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
  an.onfinish = () => { d.ghost.remove(); if (it.state === 'held') { it.state = 'float'; it.s.visible = true; it.sh.visible = true; } after && after(); };
}
function drop(d, bin) {
  const it = d.it, info = ITEMS[it.key], cat = bin.dataset.cat, P = owner(+bin.dataset.p);
  const r = bin.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.3;
  if (info.cat === cat) {
    // masuk: melengkung, mengecil, lalu hilang
    const x0 = parseFloat(d.ghost.style.left), y0 = parseFloat(d.ghost.style.top);
    d.ghost.animate([
      { left: x0 + 'px', top: y0 + 'px', transform: 'translate(-50%,-50%) scale(1.1) rotate(-6deg)' },
      { left: (x0 + cx) / 2 + 'px', top: Math.min(y0, cy) - 50 + 'px', transform: 'translate(-50%,-50%) scale(.85) rotate(90deg)', offset: 0.5 },
      { left: cx + 'px', top: cy + 'px', transform: 'translate(-50%,-50%) scale(.2) rotate(200deg)' },
    ], { duration: 380, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { d.ghost.remove(); bin.classList.remove('eat'); void bin.offsetWidth; bin.classList.add('eat'); };
    removeItem(it);
    P.combo++; P.best = Math.max(P.best, P.combo); P[cat]++;
    const gain = 10 + Math.min(10, (P.combo - 1) * 2); P.score += gain;
    if (mode === 'battle') { resolved++; } 
    Sfx.good(); if (Sfx.bell && P.combo > 1) Sfx.bell();
    if (window.Fx) Fx.good(cx, r.top + 10, '+' + gain);
    cheer(+bin.dataset.p);
    if (P.combo >= 3 && P.combo % 3 === 0) toast('🔥 Combo ' + P.combo + '!' + (mode === 'battle' ? ' ' + P.name : ''), 'good');
    else if (mode !== 'battle') { const pr = progress(); if (pr >= 0.5 && !team.half) { team.half = true; toast('Hebat! Sungai semakin bersih! 🌊', 'good'); say('Hebat! Sungai semakin bersih!'); } }
    hud(); checkEnd();
  } else {
    P.combo = 0; P.wrong++; sadden(+bin.dataset.p);
    bin.classList.remove('bad'); void bin.offsetWidth; bin.classList.add('bad');
    Sfx.bad();
    const txt = info.nama + ' termasuk ' + CATN[info.cat] + '. ' + info.info;
    toast('❌ ' + txt, 'bad'); if (mode !== 'battle' || players.length === 1) say(txt);
    flyBack(d); hud();
  }
}

/* ---------------- bantuan ---------------- */
let hintRing = null;
$('bHint').addEventListener('click', () => {
  if (!running) return;
  let it = [...drags.values()][0]?.it;
  if (!it) it = items.filter((x) => x.state === 'float').sort((a, b) => b.x - a.x)[0];
  if (!it) { toast('Tunggu sampah berikutnya hanyut, ya.', 'hint'); return; }
  const info = ITEMS[it.key];
  toast('💡 ' + info.hint, 'hint'); say(info.hint); Sfx.click();
  if (!hintRing) { hintRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 32), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, depthWrite: false })); hintRing.rotation.x = -Math.PI / 2; scene.add(hintRing); }
  hintRing.userData = { it, t: 8 }; hintRing.visible = true;
  if (mode !== 'battle') { // latihan & kerja sama: tunjukkan tempat sampah yang tepat
    document.querySelectorAll('#bins .bin.' + info.cat).forEach((b) => { b.classList.add('reveal'); setTimeout(() => b.classList.remove('reveal'), 2500); });
  }
});

/* ---------------- efek ---------------- */
function toast(t, k) { const o = stage.querySelector('.toast'); if (o) o.remove(); const d = document.createElement('div'); d.className = 'toast ' + (k || ''); d.innerHTML = '<span class="tx"></span><button class="x" aria-label="Tutup">✕</button>'; d.querySelector('.tx').textContent = t; d.querySelector('.x').onclick = () => d.remove(); stage.appendChild(d); clearTimeout(toast.t); toast.t = setTimeout(() => d.remove(), k === 'hint' ? 8000 : k === 'bad' ? 4500 : 2800); }
function banner(t) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = t; stage.appendChild(b); setTimeout(() => b.remove(), 1600); }
const CONF = 160, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.24), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF);
conf.visible = false; conf.frustumCulled = false; scene.add(conf);
const cData = []; for (let i = 0; i < CONF; i++) { cData.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: Math.random() * 6 }); conf.setColorAt(i, new THREE.Color([0xff5d8f, 0xffd23f, 0x2ec4b6, 0x4aa8ff, 0xff7a1a, 0xffffff][i % 6])); }
let confOn = false;
function confetti() { confOn = true; conf.visible = true; cData.forEach((d) => { d.p.set((Math.random() - .5) * 24, 6 + Math.random() * 6, (Math.random() - .5) * 10); d.v.set((Math.random() - .5) * 1.5, -1.5 - Math.random(), (Math.random() - .5) * 1.5); }); }
// ikan melompat saat sungai makin bersih
const fish = [];
function fishJump() {
  const s = sprite(E('1f41f'), 0.9); const x = (Math.random() - .5) * spanHalf * 1.6, z = (Math.random() - .5) * 8;
  s.position.set(x, -0.3, z); scene.add(s); fish.push({ s, x, z, t: 0, dir: Math.random() < .5 ? -1 : 1 });
}
const WATER_DIRTY = new THREE.Color(0xbfd6dc), WATER_CLEAN = new THREE.Color(0xd2efff);

/* ---------------- alur ---------------- */
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setPixelRatio(Math.min(lite() ? 1 : 1.5, devicePixelRatio || 1)); renderer.setSize(w, h, false);
  cam.aspect = w / h; cam.fov = 45;
  // sungai (lebar ±6.4 di sumbu z) harus terlihat penuh; lebar tampak sumbu x mengikuti rasio layar
  const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  const d = Math.max(13, 9.5 / tanV, 11 / (tanV * cam.aspect));
  cam.position.set(0, d * 0.66, d * 0.8); cam.lookAt(0, 0, -1.6); cam.updateProjectionMatrix();
  spanHalf = d * tanV * cam.aspect * 0.95;
  placeAvatars();
}
addEventListener('resize', resize); new ResizeObserver(resize).observe(stage);
/* ---------------- karakter (sementara pakai karakter Gowes, tanpa sepeda) ---------------- */
let avatars = [];
const ray = new THREE.Raycaster(), GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
function buildAvatars() {
  avatars.forEach((a) => scene.remove(a.holder)); avatars = [];
  players.forEach((P) => {
    const r = makeRider(new THREE.Color(P.color), P.char);
    r.group.remove(r.group.children[0]); // lepas sepedanya
    r.group.rotation.y = Math.PI; // menghadap kamera
    r.body.children.forEach((c) => { if (Math.abs(c.rotation.x + 0.4) < 0.01) c.rotation.x = -0.05; }); // badan tegak (tidak membungkuk seperti di sepeda)
    r.legs.forEach((l) => { l.rotation.x = 0; l.userData.knee.rotation.x = 0; });
    const holder = new THREE.Group(); holder.add(r.group); holder.rotation.x = -0.55; holder.scale.setScalar(1.05); // condong ke kamera agar wajah terlihat
    scene.add(holder); avatars.push({ P, r, holder, jump: 0, sad: 0, ph: Math.random() * 6, win: false });
  });
  placeAvatars();
}
function placeAvatars() {
  if (!avatars.length) return;
  const sr = stageRect(); tmpV.set(0, 0, 8.9).project(cam); const ny = tmpV.y;
  avatars.forEach((a, k) => {
    let cx;
    if (mode === 'battle' && a.P.el) { const r = a.P.el.getBoundingClientRect(); cx = r.left + r.width / 2; }
    else cx = sr.left + sr.width * (k + 1) / (avatars.length + 1);
    ray.setFromCamera(new THREE.Vector2((cx - sr.left) / sr.width * 2 - 1, ny), cam);
    if (ray.ray.intersectPlane(GROUND, hitP)) a.base = hitP.clone();
  });
}
function cheer(pi) { avatars.forEach((a) => { if (mode !== 'battle' || a.P.i === pi) { a.jump = 1; a.sad = 0; } }); }
function sadden(pi) { avatars.forEach((a) => { if (mode !== 'battle' || a.P.i === pi) a.sad = 1; }); }
function animAvatars(t, dt) {
  avatars.forEach((a) => {
    if (!a.base) return;
    const r = a.r; a.jump = Math.max(0, a.jump - dt * 2.2); a.sad = Math.max(0, a.sad - dt * 1.2);
    const j = a.win ? Math.abs(Math.sin(t / 230 + a.ph)) : Math.sin(a.jump * Math.PI);
    a.holder.position.set(a.base.x, -0.3 + j * 0.9 + Math.sin(t / 500 + a.ph) * 0.03, a.base.z);
    const up = a.win || a.jump > 0.05;
    r.arms.forEach((sh, k) => {
      if (up) { sh.rotation.x = Math.PI - 0.35 + Math.sin(t / 120 + k) * 0.25; sh.rotation.z = (k ? -1 : 1) * 0.35; sh.userData.elbow.rotation.x = 0.2; }
      else { sh.rotation.x = 0.12 + Math.sin(t / 600 + a.ph + k) * 0.06; sh.rotation.z = (k ? 1 : -1) * (0.12 + a.sad * 0.1); sh.userData.elbow.rotation.x = 0.15; }
    });
    r.head.rotation.z = a.sad * 0.35 * Math.sin(t / 90); r.head.rotation.x = a.sad * 0.25;
  });
}

/* ---------------- perintah (alert awal + baris di bawah header, bersuara) ---------------- */
function instrText() {
  if (drags.size) return 'Lepaskan di tempat sampah yang benar.';
  if (practice) return 'Seret sampah ke Organik atau Anorganik. Bingung? Tekan Bantuan.';
  return mode === 'battle' ? 'Rebut sampah! Seret ke tempat sampah warnamu.' : 'Seret sampah ke tempat Organik atau Anorganik.';
}
function setInstr() { const t = instrText(), el = $('instrT'); if (el.textContent !== t) { el.textContent = t; $('instr').classList.remove('flash'); void $('instr').offsetWidth; $('instr').classList.add('flash'); } }
$('instrSay').addEventListener('click', () => { if (window.Suara) Suara.say(instrText()); });
function brief(go) {
  const t = practice ? ['📖', 'Latihan', 'Seret sampah dari sungai ke tempat sampah yang benar. Kalau bingung, tekan Bantuan.']
    : mode === 'battle' ? ['⚔️', 'Misi Battle', 'Rebut sampah di sungai! Seret ke tempat sampah warnamu sendiri. Skor tertinggi menang.']
      : ['🤝', 'Misi Kerja Sama', 'Bersama-sama, seret sampah ke tempat Organik atau Anorganik sampai sungai bersih.'];
  $('bIcon').textContent = t[0]; $('bTitle').textContent = t[1]; $('bText').textContent = t[2];
  show('brief'); say(t[2]);
  $('bSay').onclick = () => { if (window.Suara) Suara.say(t[2]); };
  $('bOk').onclick = () => { Sfx.click(); show(null); $('instr').classList.remove('hidden'); setInstr(); say(instrText()); go(); };
}
// tombol ☰ Main-yuk di header game (bukan melayang di atas sungai)
if (window.parent !== window) {
  $('bMenu').classList.remove('hidden');
  { let n = 0; const tk = setInterval(() => { try { parent.postMessage({ mainyuk: 'menu-in-header' }, location.origin); } catch (e) {} if (++n > 20) clearInterval(tk); }, 700); }
  $('bHome').classList.remove('hidden');
  $('bHome').addEventListener('click', () => { try { parent.postMessage({ mainyuk: 'home' }, location.origin); } catch (e) {} });
  let menuPaused = false;
  $('bMenu').addEventListener('click', () => { if (running) { $('bPause').click(); menuPaused = true; } try { parent.postMessage({ mainyuk: 'open-menu' }, location.origin); } catch (e) {} });
  addEventListener('message', (e) => { if (e.source === parent && e.data && e.data.mainyuk === 'resume' && menuPaused) { menuPaused = false; $('resume').click(); } });
}

function clearItems() { items.forEach((it) => { scene.remove(it.s); scene.remove(it.sh); }); items = []; drags.forEach((d) => d.ghost.remove()); drags.clear(); document.querySelectorAll('.ghost').forEach((g) => g.remove()); fish.forEach((f) => scene.remove(f.s)); fish.length = 0; }
function start() {
  try { localStorage.setItem('sd_nb', nBattle); localStorage.setItem('sd_nc', nCoop); localStorage.setItem('sd_level', level); localStorage.setItem('sd_target', target); localStorage.setItem('sd_time', timeLimit); } catch (e) {}
  const n = practice ? 1 : np();
  const inputs = [...$('names').querySelectorAll('input')];
  players = []; for (let i = 0; i < n; i++) players.push(newStats({ i, name: (inputs[i] && inputs[i].value.trim().replace(/[<>]/g, '')) || ('Pemain ' + (i + 1)), color: COLORS[i], char: charOf(i) }));
  team = mode === 'battle' ? null : newStats({ i: -1, name: 'Tim' });
  const tgt = practice ? 10 : target;
  if (practice) { level = 1; }
  target = tgt;
  clearItems(); resolved = 0; finished = false; running = false;
  renderer.shadowMap.enabled = !lite();
  if (!world.group) buildWorld(4);
  const L = LEVEL[level]; seq = []; for (let i = 0; i < 400; i++) seq.push(L.keys[Math.floor(Math.random() * L.keys.length)]); seqI = 0;
  show(null); $('topbar').classList.remove('hidden');
  timeLeft = practice ? 0 : timeLimit; $('hTime').classList.toggle('hidden', !timeLeft);
  buildBins(); resize(); hud(); buildAvatars();
  scene.background.copy(SKY_RAIN); scene.fog.color.copy(SKY_RAIN); if (world.rain) world.rain.material.opacity = 0.5; conf.visible = false; confOn = false;
  let c = 3; const cd = () => { if (finished) return; if (c > 0) { banner(String(c)); Sfx.tick(); c--; setTimeout(cd, 750); } else { banner('MULAI!'); Sfx.go(); Sfx.music(true); running = true; startAt = performance.now(); spawnT = 0; spawn(-spanHalf * 0.55); spawn(-spanHalf * 0.15); if (window.Tutor) setTimeout(Tutor.hint, 1200); } };
  brief(cd);
}
function checkEnd() {
  if (finished) return;
  if (mode === 'battle') { if (resolved >= target) end(true); }
  else if (team.org + team.ano >= target) end(true);
}
function end(ok) {
  if (finished) return; finished = true; running = false; Sfx.music(false);
  drags.forEach((d) => flyBack(d)); drags.clear();
  const secs = Math.round((performance.now() - startAt) / 1000);
  if (ok) { Sfx.win(); Fx.win(); confetti(); if (mode !== 'battle') avatars.forEach((a) => { a.win = true; }); }
  $('instr').classList.add('hidden');
  let title, sub, stat = '', rank = '';
  if (mode === 'battle') {
    const ord = players.slice().sort((a, b) => b.score - a.score || a.wrong - b.wrong);
    ord[0].el && ord[0].el.classList.add('win'); avatars.forEach((a) => { a.win = a.P === ord[0]; });
    title = '🏆 ' + ord[0].name + ' menang!'; sub = 'Waktu ' + secs + ' detik · ' + target + ' sampah';
    rank = ord.map((P, r) => '<div><b>' + ['🥇', '🥈', '🥉', '4'][r] + '</b><span class="dot" style="width:18px;height:18px;border-radius:50%;border:2px solid #1b1a3a;background:' + P.color + '"></span><span>' + P.name.replace(/[<>]/g, '') + '<br><small>🌿 ' + P.org + ' · ♻️ ' + P.ano + ' · salah ' + P.wrong + ' · combo ' + P.best + '</small></span><b>' + P.score + '</b></div>').join('');
    banner('🏆 ' + ord[0].name + ' menang!');
  } else {
    title = ok ? (practice ? 'Latihan selesai! 🎉' : 'Hebat! Sungai desa bersih! 🎉') : 'Waktu habis! ⏱';
    sub = ok ? 'Kerja sama kalian menyelamatkan desa. Ikan kembali berenang!' : 'Sungai belum bersih. Ayo coba lagi bersama!';
    stat = [['⭐', team.score, 'Skor'], ['🌿', team.org, 'Organik'], ['♻️', team.ano, 'Anorganik'], ['❌', team.wrong, 'Salah']].map((s) => '<div>' + s[1] + '<small>' + s[0] + ' ' + s[2] + '</small></div>').join('');
    sub += ' Waktu ' + secs + ' detik.';
    if (ok) say(practice ? 'Latihan selesai. Hebat!' : 'Hebat! Sungai desa bersih!');
  }
  $('rTitle').textContent = title; $('rSub').textContent = sub; $('rStat').innerHTML = stat; $('rStat').classList.toggle('hidden', !stat); $('rank').innerHTML = rank;
  const coins = mode === 'battle' ? Math.max(...players.map((p) => p.score)) : team.score;
  if (window.Koin && coins > 0) setTimeout(() => Koin.add(coins / 20, 'Selamatkan Desa'), 600);
  setTimeout(() => show('result'), ok ? 3200 : 600);
}
function toMenu() { running = false; finished = true; Sfx.music(false); clearItems(); $('instr').classList.add('hidden'); $('topbar').classList.add('hidden'); $('bins').classList.add('hidden'); show('menu'); }
$('start').addEventListener('click', () => { practice = false; start(); });
$('again').addEventListener('click', start);
$('toMenu').addEventListener('click', toMenu);
$('pMenu').addEventListener('click', toMenu);
$('bExit').addEventListener('click', () => Dialog.ask('Selesai bermain sekarang?', toMenu));
$('bPause').addEventListener('click', () => { if (!running) return; running = false; pausedAt = performance.now(); drags.forEach((d) => flyBack(d)); drags.clear(); Sfx.music(false); show('pause'); });
$('resume').addEventListener('click', () => { show(null); startAt += performance.now() - pausedAt; running = true; last = 0; Sfx.music(true); });
$('bMute').addEventListener('click', function () { try { localStorage.setItem('bgy_muted', Sfx.muted() ? '0' : '1'); } catch (e) {} this.textContent = Sfx.muted() ? '🔇' : '🔊'; Sfx.music(!Sfx.muted() && running); });
$('bMute').textContent = Sfx.muted() ? '🔇' : '🔊';
document.addEventListener('visibilitychange', () => { if (document.hidden && running) $('bPause').click(); });

/* ---------------- loop ---------------- */
let last = 0, fishT = 0;
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
  if (!world.group) return;
  if (running) {
    if (timeLeft) { timeLeft -= dt; if (Math.floor(timeLeft + dt) !== Math.floor(timeLeft)) hud(); if (timeLeft <= 0) { mode === 'battle' ? end(true) : end(false); } }
    spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = LEVEL[level].gap * (0.8 + Math.random() * 0.4); }
  }
  // sampah mengambang & hanyut
  for (let k = items.length - 1; k >= 0; k--) {
    const it = items[k];
    if (it.state === 'gone') { items.splice(k, 1); continue; }
    if (it.state !== 'float') continue;
    if (running) it.x += it.v * dt;
    const bob = Math.sin(t / 420 + it.ph) * 0.07;
    it.s.position.set(it.x, -0.1 + bob, it.z + Math.sin(t / 900 + it.ph) * 0.18);
    it.s.material.rotation = Math.sin(t / 800 + it.ph) * 0.22;
    it.sh.position.set(it.x, -0.12, it.z);
    if (it.x > spanHalf + 1.4) { // lewat
      removeItem(it); items.splice(k, 1);
      if (running) { if (mode === 'battle') { resolved++; hud(); checkEnd(); } else { team.combo = 0; toast('💧 Ada sampah yang lewat. Ayo lebih cepat!', 'bad'); } }
    }
  }
  if (hintRing && hintRing.visible) { const h = hintRing.userData; h.t -= dt; const it = h.it; if (h.t <= 0 || it.state === 'gone') hintRing.visible = false; else { hintRing.position.set(it.x, -0.05, it.z); } }
  // sungai makin bersih → air jernih, hujan reda, langit cerah, ikan muncul
  const pr = (mode === 'battle' || team) ? progress() : 0;
  if (world.water) world.water.material.color.lerpColors(WATER_DIRTY, WATER_CLEAN, pr);
  scene.background.lerpColors(SKY_RAIN, SKY_SUN, pr); scene.fog.color.copy(scene.background);
  sun.intensity = 1.2 + pr * 1.0; if (world.rain) world.rain.material.opacity = 0.5 * (1 - pr);
  if (pr > 0.35 && !lite()) { fishT -= dt; if (fishT <= 0) { fishJump(); fishT = 3.5 - pr * 2.2; } }
  for (let k = fish.length - 1; k >= 0; k--) { const f = fish[k]; f.t += dt * 0.9; const u = Math.min(1, f.t); f.s.position.set(f.x + f.dir * u * 2.2, -0.3 + Math.sin(u * Math.PI) * 1.6, f.z); f.s.material.rotation = f.dir * (0.9 - u * 1.8); f.s.scale.x = Math.abs(f.s.scale.x) * -f.dir; if (u >= 1) { scene.remove(f.s); fish.splice(k, 1); } }
  waterT.offset.y += dt * (0.1 + 0.6 / LEVEL[level].cross);
  if (world.rain) { const a = world.rain.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 6) { a[i + 1] -= dt * 20; a[i + 4] -= dt * 20; if (a[i + 4] < 0) { a[i + 1] += 25; a[i + 4] += 25; } } world.rain.geometry.attributes.position.needsUpdate = true; }
  if (world.flag) world.flag.children.forEach((c, i) => { c.rotation.y = Math.sin(t / 250 + i) * 0.3; });
  if (confOn) { cData.forEach((d, i) => { d.p.addScaledVector(d.v, dt); d.r += dt * 4; if (d.p.y < 0) d.p.y = 10; _o.position.copy(d.p); _o.rotation.set(d.r, d.r * 0.7, 0); _o.scale.setScalar(1); _o.updateMatrix(); conf.setMatrixAt(i, _o.matrix); }); conf.instanceMatrix.needsUpdate = true; }
  animAvatars(t, dt);
  renderer.render(scene, cam);
}
buildWorld(4); resize(); requestAnimationFrame(frame);
// adegan menu: beberapa sampah hanyut di latar
seq = LEVEL[1].keys.slice(); level = level || 1;

window.__sd = {
  state: () => ({ running, finished, mode, resolved, target, team: team && { s: team.score, o: team.org, a: team.ano, w: team.wrong }, players: players.map((p) => ({ n: p.name, s: p.score, o: p.org, a: p.ano, w: p.wrong })), items: items.filter((i) => i.state === 'float').map((i) => ({ key: i.key, cat: ITEMS[i.key].cat, ...screenOf(i) })) }),
};
if (window.Tutor) Tutor.init('selamatkan-desa', [
  { sel: '.modes', text: 'Pilih Belajar untuk mengenal sampah, Battle untuk berlomba, atau Kerja Sama untuk bermain satu tim.' },
  { sel: '.mode.learn', text: 'Belum yakin? Mulai dari Belajar dulu.' },
], { inGame: 'Sentuh sampah di sungai, lalu seret ke tempat sampah yang benar.' });
