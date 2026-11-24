/* Main-yuk · Misi Selamatkan Desa — Duel Sungai 1–4 pemain (Three.js r160).
   Sampah hanyut di sungai, satu jalur per pemain. Saat sampah tiba di depanmu,
   tekan Organik atau Anorganik. Pertama yang mencapai target menang. */
import * as THREE from '/games/_shared/three.module.min.js';

const $ = (id) => document.getElementById(id);
const A = 'assets/';
const ITEMS = {
  daun: { nama: 'Daun kering', cat: 'org', why: 'Daun kering bisa membusuk. Itu Organik.' },
  pisang: { nama: 'Kulit pisang', cat: 'org', why: 'Kulit pisang mudah membusuk. Itu Organik.' },
  botol: { nama: 'Botol plastik', cat: 'ano', why: 'Plastik tidak membusuk. Itu Anorganik.' },
  kaleng: { nama: 'Kaleng', cat: 'ano', why: 'Kaleng dari logam. Itu Anorganik.' },
  kardus: { nama: 'Kardus', cat: 'ano', why: 'Kardus didaur ulang jadi kertas. Itu Anorganik.' },
};
const LEVEL_KEYS = { 1: ['daun', 'pisang', 'botol', 'kaleng'], 2: ['daun', 'pisang', 'botol', 'kaleng', 'kardus'], 3: ['daun', 'pisang', 'botol', 'kaleng', 'kardus'] };
const COLORS = ['#ff5d8f', '#4aa8ff', '#ffd23f', '#2ec4b6'];
const KEYS = [['a', 's'], ['g', 'h'], ['k', 'l'], ['arrowleft', 'arrowright']];
const KEYLBL = ['A · S', 'G · H', 'K · L', '← · →'];
const LW = 3.2;               // lebar satu jalur
const SPAWN_Z = -46, CATCH_Z = 1.2, MISS_Z = 3.2, FRONT_Z = -9; // zona tangkap: FRONT_Z..MISS_Z

/* ---------------- menu ---------------- */
let nPlayers = 2, level = 2, tempo = 1, target = 15, gfx = 'bagus';
try {
  nPlayers = +localStorage.getItem('sd_np') || 2; level = +localStorage.getItem('sd_level') || 2;
  tempo = +localStorage.getItem('tempo_selamatkan-desa') || 1; target = +localStorage.getItem('sd_target') || 15;
  gfx = localStorage.getItem('bgy_gfx') || ((navigator.hardwareConcurrency || 8) <= 4 ? 'ringan' : 'bagus');
} catch (e) {}
const lite = () => gfx === 'ringan';
function seg(id, fn, isOn) {
  const el = $(id);
  const mark = () => [...el.children].forEach((b) => b.classList.toggle('on', isOn(b.dataset.n)));
  el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fn(b.dataset.n); mark(); Sfx.click(); });
  mark();
}
seg('segPlayers', (n) => { nPlayers = +n; renderNames(); }, (n) => +n === nPlayers);
seg('segLevel', (n) => { level = +n; }, (n) => +n === level);
seg('segTempo', (n) => { tempo = +n; try { localStorage.setItem('tempo_selamatkan-desa', n); } catch (e) {} }, (n) => +n === tempo);
seg('segTarget', (n) => { target = +n; }, (n) => +n === target);
seg('segGfx', (n) => { gfx = n; try { localStorage.setItem('bgy_gfx', n); } catch (e) {} }, (n) => n === gfx);
const charOf = (i) => { try { return localStorage.getItem('sd_char_' + i) || (i % 2 ? 'girl' : 'boy'); } catch (e) { return i % 2 ? 'girl' : 'boy'; } };
const nameOf = (i) => { try { return localStorage.getItem('sd_name_' + i) || ''; } catch (e) { return ''; } };
function renderNames() {
  const box = $('names'); box.innerHTML = '';
  for (let i = 0; i < nPlayers; i++) {
    const d = document.createElement('div'); d.className = 'nm';
    d.innerHTML = '<span class="dot"></span><input maxlength="16" autocomplete="off"><button class="ch nb-sm press" type="button" aria-label="Ganti karakter"><img alt=""></button>';
    d.querySelector('.dot').style.background = COLORS[i];
    const inp = d.querySelector('input'); inp.placeholder = 'Pemain ' + (i + 1); inp.value = nameOf(i);
    inp.addEventListener('change', () => { try { localStorage.setItem('sd_name_' + i, inp.value.trim()); } catch (e) {} });
    const img = d.querySelector('img'); img.src = A + charOf(i) + '.png';
    d.querySelector('.ch').addEventListener('click', () => { const c = charOf(i) === 'boy' ? 'girl' : 'boy'; try { localStorage.setItem('sd_char_' + i, c); } catch (e) {} img.src = A + c + '.png'; Sfx.click(); });
    box.appendChild(d);
  }
}
renderNames();

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
Object.keys(ITEMS).concat(['boy', 'girl', 'bin-organik', 'bin-anorganik']).forEach((n) => { const im = new Image(); im.onload = () => { aspects[n] = im.width / im.height; }; im.src = A + n + '.png'; });
function sprite(n, h) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(n), transparent: true, alphaTest: 0.06 })); s.center.set(0.5, 0); s.userData = { n, h }; fitSprite(s); return s; }
function fitSprite(s) { const ar = aspects[s.userData.n] || 0.6; s.scale.set(s.userData.h * ar * (s.userData.flip || 1), s.userData.h, 1); }
function mergeGeos(list) { const p = [], n = []; list.forEach((g) => { const ng = g.index ? g.toNonIndexed() : g; p.push(...ng.attributes.position.array); n.push(...ng.attributes.normal.array); }); const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); return m; }

const world = { lanes: 0, group: null };
const waterT = canvasTex(128, 128, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#2f8fcf'); g.addColorStop(.5, '#46a9e6'); g.addColorStop(1, '#2f8fcf'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2;
  for (let i = 0; i < 26; i++) { const yy = Math.random() * h, xx = Math.random() * w; x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + 8, yy + 4, xx + 18, yy); x.stroke(); }
}, [2, 10]);
function buildWorld(lanes) {
  if (world.group) scene.remove(world.group);
  const G = new THREE.Group(); scene.add(G); world.group = G; world.lanes = lanes;
  const RW = lanes * LW, half = RW / 2;
  // air
  const water = new THREE.Mesh(new THREE.PlaneGeometry(RW, 80), new THREE.MeshStandardMaterial({ map: waterT, roughness: 0.15, metalness: 0.15, color: 0x9fbfd0 }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.15, -30); water.receiveShadow = true; G.add(water); world.water = water;
  waterT.repeat.set(lanes * 0.8, 10);
  // pembatas jalur: tali + pelampung
  const buoyM = [M(0xff4d4d, { roughness: 0.4 }), M(0xffffff, { roughness: 0.4 })];
  for (let l = 1; l < lanes; l++) {
    const x = -half + l * LW;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 70, 5), M(0xf5f5f5)); rope.rotation.x = Math.PI / 2; rope.position.set(x, -0.05, -30); G.add(rope);
    for (let z = 2; z > -60; z -= 1.6) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), buoyM[Math.round(z / 1.6) & 1]); b.position.set(x, -0.05, z); G.add(b); }
  }
  // garis zona tangkap per jalur
  world.zones = [];
  for (let l = 0; l < lanes; l++) {
    const zx = -half + LW / 2 + l * LW;
    const z = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.3, MISS_Z - FRONT_Z), new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS[l]), transparent: true, opacity: 0.13, depthWrite: false }));
    z.rotation.x = -Math.PI / 2; z.position.set(zx, -0.1, (MISS_Z + FRONT_Z) / 2); G.add(z); world.zones.push(z);
  }
  // tepi sungai: tanah, batu, rumput
  const grassT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6cbd4e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 800; i++) { x.fillStyle = Math.random() < .5 ? '#5eae41' : '#7fcd5c'; x.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, [20, 20]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: grassT, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = 0.02; ground.receiveShadow = true; G.add(ground);
  // potong rumput di area sungai: pakai dinding tepi (tanah coklat) menutupi
  [-1, 1].forEach((s) => {
    box(1.4, 0.5, 80, M(0xa27a52), s * (half + 0.7), 0.0, -30, G);
  });
  ground.position.x = 0; ground.geometry = holedGround(RW);
  // depan (tempat berdiri pemain): dermaga kayu
  const deckT = canvasTex(128, 64, (x) => { x.fillStyle = '#b07a46'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#7d5230'; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, 64); x.stroke(); } }, [lanes * 2, 1]);
  box(RW + 2.8, 0.35, 3.6, new THREE.MeshStandardMaterial({ map: deckT, roughness: 0.8 }), 0, 0.05, 5.4, G);
  // jembatan di hulu (asal sampah)
  box(RW + 6, 0.6, 3, 0xc9ced6, 0, 1.6, -50, G); box(RW + 6, 0.8, 0.25, 0xa7adb6, 0, 2.3, -48.6, G); box(RW + 6, 0.8, 0.25, 0xa7adb6, 0, 2.3, -51.4, G);
  [-1, 1].forEach((s) => box(0.8, 2, 3, 0xbfc4cc, s * (half + 0.4), 0.6, -50, G));
  // batu-batu di tepi
  const rocks = []; for (let z = 4; z > -58; z -= 1.3) [-1, 1].forEach((s) => { if (Math.random() < .55) rocks.push([s * (half + 0.3 + Math.random() * .7), z + Math.random(), 0.25 + Math.random() * .35]); });
  inst(G, new THREE.DodecahedronGeometry(1, 0), M(0x8d939c, { flatShading: true }), rocks, (o, p) => { o.position.set(p[0], 0.1, p[1]); o.scale.set(p[2] * 1.3, p[2], p[2]); o.rotation.set(p[1], p[0], 0); });
  // pohon kelapa, pisang, rindang
  const palms = [], round = [], bush = [];
  for (let z = 6; z > -62; z -= 3.2) [-1, 1].forEach((s) => {
    const x = s * (half + 3 + Math.random() * 7);
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
  [[-1, -24], [1, -30], [-1, -40], [1, -18], [1, -42], [-1, -12]].forEach(([s, z], i) => house(G, s * (half + 12 + (i % 2) * 3), z, roofs[i % 4], i % 3 === 0 ? 'kayu' : 'bata'));
  school(G, -(half + 13), -54);
  // hujan
  const N = lite() ? 250 : 800, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 50, y = Math.random() * 25, z = -50 + Math.random() * 60; pos.set([x, y, z, x + .1, y - .9, z + .2], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  world.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xe6f4ff, transparent: true, opacity: 0.5 })); world.rain.frustumCulled = false; G.add(world.rain);
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

/* ---------------- pemain di tepi + sampah ---------------- */
let players = [], items = [], running = false, finished = false, seq = [], spawnT = 0, seqI = 0, startAt = 0, robot = null;
const laneX = (l) => -world.lanes * LW / 2 + LW / 2 + l * LW;
function nameSprite(text, color) {
  const t = canvasTex(256, 64, (x) => { x.font = '800 30px Nunito, sans-serif'; const w = Math.min(250, x.measureText(text).width + 34); x.fillStyle = '#1b1a3a'; x.beginPath(); x.roundRect((256 - w) / 2 + 3, 9, w, 46, 23); x.fill(); x.fillStyle = color; x.beginPath(); x.roundRect((256 - w) / 2, 6, w, 46, 23); x.fill(); x.lineWidth = 4; x.strokeStyle = '#1b1a3a'; x.stroke(); x.fillStyle = '#1b1a3a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 30); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); s.scale.set(2.2, 0.55, 1); s.renderOrder = 10; return s;
}
function shadow(r) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.28, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.25; return m; }
function makeStand(P) {
  const g = new THREE.Group(); g.position.set(laneX(P.i), 0.22, 5.4); world.group.add(g);
  const ch = sprite(P.char, 2.3); g.add(ch); if (P.bot) ch.material.color.setHex(0xb8bcc8);
  g.add(shadow(0.5));
  const bo = sprite('bin-organik', 1.15); bo.position.set(-1.0, 0, 0.2); g.add(bo);
  const ba = sprite('bin-anorganik', 1.15); ba.position.set(1.0, 0, 0.2); g.add(ba);
  const lbl = nameSprite(P.name, P.color); lbl.position.set(0, 2.75, 0); g.add(lbl);
  P.stand = { g, ch, bo, ba, jump: 0 };
}
function spawn(z0) {
  const key = seq[seqI++ % seq.length], drift = (Math.random() - 0.5) * 0.9, spin = (Math.random() - 0.5) * 1.2;
  players.forEach((P) => {
    if (P.done) return;
    const s = sprite(key, key === 'kardus' ? 1.35 : 1.2);
    s.position.set(laneX(P.i) + drift, -0.12, z0 != null ? z0 : SPAWN_Z);
    world.group.add(s);
    items.push({ key, s, P, x0: laneX(P.i) + drift, ph: Math.random() * 6, spin, state: 'float', t: 0 });
  });
}
function frontItem(P) {
  let best = null;
  for (const it of items) if (it.P === P && it.state === 'float' && it.s.position.z > FRONT_Z && it.s.position.z < MISS_Z) { if (!best || it.s.position.z > best.s.position.z) best = it; }
  return best;
}

/* ---------------- panel pemain ---------------- */
function buildPads() {
  const pads = $('pads'); pads.innerHTML = ''; pads.style.gridTemplateColumns = 'repeat(' + players.length + ', 1fr)';
  players.forEach((P) => {
    const el = document.createElement('section'); el.className = 'pad'; el.style.setProperty('--c', P.color);
    el.innerHTML = '<header><span class="nmx"></span><span class="kh">⌨ ' + (P.bot ? '' : KEYLBL[P.i]) + '</span><span class="sc">0/' + target + '</span></header><div class="clean"><i></i></div>' +
      '<div class="body"><button class="bt org nb-sm press" type="button"><img src="' + A + 'bin-organik.png" alt="">Organik</button><div class="cur"></div><button class="bt ano nb-sm press" type="button"><img src="' + A + 'bin-anorganik.png" alt="">Anorganik</button></div>';
    el.querySelector('.nmx').textContent = P.name;
    if (P.bot) el.querySelectorAll('.bt').forEach((b) => { b.disabled = true; b.style.opacity = .55; });
    el.querySelector('.org').addEventListener('pointerdown', (e) => { e.preventDefault(); press(P, 'org'); });
    el.querySelector('.ano').addEventListener('pointerdown', (e) => { e.preventDefault(); press(P, 'ano'); });
    pads.appendChild(el); P.el = el;
  });
}
function padUpdate(P) {
  P.el.querySelector('.sc').textContent = P.score + '/' + target;
  P.el.querySelector('.clean i').style.width = Math.max(0, P.clean) + '%';
  const it = frontItem(P), cur = P.el.querySelector('.cur');
  const key = it ? it.key : '';
  if (cur.dataset.k !== key) { cur.dataset.k = key; cur.innerHTML = key ? '<img src="' + A + key + '.png" alt="' + ITEMS[key].nama + '">' : ''; }
  cur.classList.toggle('ready', !!it && it.s.position.z > -3);
}
function msg(P, text) {
  let m = P.el.querySelector('.msg'); if (!m) { m = document.createElement('div'); m.className = 'msg'; P.el.appendChild(m); }
  m.textContent = text; clearTimeout(P.msgT); P.msgT = setTimeout(() => m.remove(), 1800);
}

/* ---------------- tekan tombol ---------------- */
function press(P, cat) {
  if (!running || P.done || performance.now() < P.frozen) return;
  if (window.Tutor) Tutor.done();
  const it = frontItem(P);
  if (!it) { return; }
  if (ITEMS[it.key].cat === cat) {
    it.state = 'fly'; it.t = 0; it.from = it.s.position.clone();
    const bin = cat === 'org' ? P.stand.bo : P.stand.ba; it.to = new THREE.Vector3().setFromMatrixPosition(bin.matrixWorld).add(new THREE.Vector3(0, 1.1, 0));
    P.score++; P.combo++; P.right++;
    P.stand.jump = 1; splash(it.s.position, 0xffffff, 18);
    if (!P.bot) { Sfx.good(); if (P.combo % 5 === 0) { Sfx.coin && Sfx.coin(); msg(P, '🔥 ' + P.combo + ' benar berturut-turut!'); } }
    P.el.classList.remove('good'); void P.el.offsetWidth; P.el.classList.add('good');
    if (P.score >= target) finish(P);
  } else {
    P.combo = 0; P.wrong++; P.frozen = performance.now() + 1000;
    it.bounce = 1;
    if (!P.bot) Sfx.bad();
    P.el.classList.remove('frozen'); void P.el.offsetWidth; P.el.classList.add('frozen'); setTimeout(() => P.el.classList.remove('frozen'), 1000);
    msg(P, '❌ ' + ITEMS[it.key].why);
    if (players.filter((x) => !x.bot).length === 1 && window.Suara) Suara.read(ITEMS[it.key].why, { force: !Sfx.muted() });
  }
  padUpdate(P);
}
addEventListener('keydown', (e) => {
  if (!running || e.repeat) return;
  const k = e.key.toLowerCase();
  players.forEach((P) => { if (P.bot) return; const ks = KEYS[P.i]; if (k === ks[0]) { e.preventDefault(); press(P, 'org'); } else if (k === ks[1]) { e.preventDefault(); press(P, 'ano'); } });
});

/* ---------------- efek ---------------- */
const SPL = 220, sPos = new Float32Array(SPL * 3), sVel = new Float32Array(SPL * 3), sLife = new Float32Array(SPL); let sNext = 0;
for (let i = 0; i < SPL; i++) sPos[i * 3 + 1] = -9;
const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
const splashPts = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xe8f7ff, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false })); splashPts.frustumCulled = false; scene.add(splashPts);
function splash(p, c, n) { for (let k = 0; k < n; k++) { const i = sNext; sNext = (sNext + 1) % SPL; sPos.set([p.x, 0, p.z], i * 3); const a = Math.random() * 6.28, v = 1 + Math.random() * 2; sVel.set([Math.cos(a) * v, 2.5 + Math.random() * 2.5, Math.sin(a) * v], i * 3); sLife[i] = 0.8; } }
const CONF = 160, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.22), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF);
conf.visible = false; conf.frustumCulled = false; scene.add(conf);
const cData = []; for (let i = 0; i < CONF; i++) { cData.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: Math.random() * 6 }); conf.setColorAt(i, new THREE.Color([0xff5d8f, 0xffd23f, 0x2ec4b6, 0x4aa8ff, 0xff7a1a, 0xffffff][i % 6])); }
let confC = null;
function confetti(c) { confC = c; conf.visible = true; cData.forEach((d) => { d.p.set(c.x + (Math.random() - .5) * 6, c.y + Math.random() * 4, c.z + (Math.random() - .5) * 4); d.v.set((Math.random() - .5) * 1.5, -1.2 - Math.random(), (Math.random() - .5) * 1.5); }); }
function banner(t) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = t; stage.appendChild(b); setTimeout(() => b.remove(), 1600); }

/* ---------------- alur ---------------- */
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setPixelRatio(Math.min(lite() ? 1 : 1.5, devicePixelRatio || 1)); renderer.setSize(w, h, false);
  cam.aspect = w / h;
  const RW = Math.max(2, world.lanes || 2) * LW;
  // jaga semua jalur terlihat: jarak kamera menyesuaikan lebar sungai & rasio layar
  const fitW = (RW + 5) / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / cam.aspect;
  const d = Math.max(11, fitW * 0.95);
  cam.position.set(0, d * 0.6, 9 + d * 0.62); cam.lookAt(0, 0, -9); cam.updateProjectionMatrix();
}
addEventListener('resize', resize);
new ResizeObserver(resize).observe(stage);
function start() {
  try { localStorage.setItem('sd_np', nPlayers); localStorage.setItem('sd_level', level); localStorage.setItem('sd_target', target); } catch (e) {}
  const names = [...$('names').querySelectorAll('input')].map((inp, i) => (inp.value || '').trim().replace(/[<>]/g, '') || ('Pemain ' + (i + 1)));
  players = names.map((n, i) => ({ i, name: n, color: COLORS[i], char: charOf(i), score: 0, right: 0, wrong: 0, miss: 0, combo: 0, clean: 100, frozen: 0 }));
  if (nPlayers === 1) players.push({ i: 1, name: '🤖 Robot', color: '#b8bcc8', char: 'boy', score: 0, right: 0, wrong: 0, miss: 0, combo: 0, clean: 100, frozen: 0, bot: true, think: 0 });
  items.forEach((it) => it.s.parent && it.s.parent.remove(it.s)); items = [];
  renderer.shadowMap.enabled = !lite();
  buildWorld(players.length);
  players.forEach(makeStand);
  const keys = LEVEL_KEYS[level]; seq = []; for (let i = 0; i < 200; i++) seq.push(keys[Math.floor(Math.random() * keys.length)]); seqI = 0;
  $('menu').classList.add('hidden'); $('result').classList.add('hidden'); $('pads').classList.remove('hidden'); $('topbar').classList.remove('hidden');
  $('hTarget').textContent = '🎯 Target ' + target + ' sampah';
  buildPads(); resize();
  scene.background.copy(SKY_RAIN); scene.fog.color.copy(SKY_RAIN); world.rain.material.opacity = 0.5; conf.visible = false; confC = null;
  finished = false; running = false; spawnT = 0.2;
  let n = 3; const cd = () => { if (n > 0) { banner(String(n)); Sfx.tick(); n--; setTimeout(cd, 800); } else { banner('MULAI!'); Sfx.go(); Sfx.music(true); running = true; startAt = performance.now(); { const gap = speed() * (level === 3 ? 1.35 : level === 2 ? 1.6 : 1.9) / tempo; for (let z = -18; z > SPAWN_Z; z -= gap) spawn(z); spawnT = 0.4; } if (window.Tutor) setTimeout(Tutor.hint, 1500); } };
  cd();
}
function finish(W) {
  if (finished) return; finished = true; running = false;
  players.forEach((P) => { P.done = true; P.el.querySelectorAll('.bt').forEach((b) => { b.disabled = true; }); });
  W.el.classList.add('win'); Sfx.music(false);
  if (W.bot) Sfx.bad(); else { Sfx.win(); Fx.win(); }
  confetti(new THREE.Vector3(laneX(W.i), 3, 4));
  banner('🏆 ' + W.name + ' menang!');
  setTimeout(showResult, 3600);
}
function showResult() {
  const ord = players.slice().sort((a, b) => b.score - a.score || a.wrong - b.wrong);
  $('rTitle').textContent = ord[0].bot ? 'Robot menang! Coba lagi 💪' : '🏆 ' + ord[0].name + ' menang!';
  const secs = Math.round((performance.now() - startAt) / 1000);
  $('rSub').textContent = 'Waktu ' + secs + ' detik · target ' + target + ' sampah';
  $('rank').innerHTML = ord.map((P, r) => '<div><b>' + (r + 1) + '</b><span>' + P.name.replace(/[<>]/g, '') + '<br><small>' + P.right + ' benar · ' + P.wrong + ' salah · ' + P.miss + ' lewat</small></span><b>' + P.score + '</b></div>').join('');
  $('result').classList.remove('hidden');
  const best = players.filter((p) => !p.bot).reduce((m, p) => Math.max(m, p.score * 10 - p.wrong * 5), 0);
  if (window.Koin && best > 0) Koin.add(best / 10, 'Selamatkan Desa');
}
function toMenu() { running = false; finished = true; Sfx.music(false); ['pads', 'topbar', 'result'].forEach((id) => $(id).classList.add('hidden')); $('menu').classList.remove('hidden'); }
$('start').addEventListener('click', start);
$('again').addEventListener('click', start);
$('toMenu').addEventListener('click', toMenu);
$('bExit').addEventListener('click', () => Dialog.ask('Selesai bermain sekarang?', toMenu));
$('bMute').addEventListener('click', function () { try { localStorage.setItem('bgy_muted', Sfx.muted() ? '0' : '1'); } catch (e) {} this.textContent = Sfx.muted() ? '🔇' : '🔊'; Sfx.music(!Sfx.muted() && running); });
$('bMute').textContent = Sfx.muted() ? '🔇' : '🔊';

/* ---------------- loop ---------------- */
let last = 0; const tmp = new THREE.Vector3();
function speed() { return (3.6 + (level - 1) * 0.7) * tempo; }
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
  if (!world.group) return;
  if (running) {
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = (level === 3 ? 1.35 : level === 2 ? 1.6 : 1.9) / tempo; }
    // robot
    players.forEach((P) => {
      if (!P.bot || P.done) return;
      const it = frontItem(P); if (!it) return;
      if (it.s.position.z > -1 + (P.think || 0)) {
        const acc = [0, 0.72, 0.82, 0.9][level];
        const c = ITEMS[it.key].cat; press(P, Math.random() < acc ? c : c === 'org' ? 'ano' : 'org'); P.think = Math.random() * 3.2 - 0.8;
      }
    });
  }
  // sampah hanyut / terbang ke tempat sampah
  const v = speed();
  for (let k = items.length - 1; k >= 0; k--) {
    const it = items[k], s = it.s;
    if (it.state === 'float') {
      if (running || finished) s.position.z += v * dt * (running ? 1 : 0.3);
      s.position.x = it.x0 + Math.sin(t / 700 + it.ph) * 0.35;
      s.position.y = -0.12 + Math.abs(Math.sin(t / 380 + it.ph)) * 0.08;
      s.material.rotation = Math.sin(t / 900 + it.ph) * 0.25 + it.spin * 0.2;
      if (it.bounce) { it.bounce = Math.max(0, it.bounce - dt * 2.5); s.position.y += Math.sin(it.bounce * Math.PI) * 0.8; s.position.z -= dt * 1.5 * it.bounce; }
      if (s.position.z > MISS_Z && !it.missed) { it.missed = true; it.P.miss++; it.P.combo = 0; it.P.clean -= 8; if (!it.P.bot && running) msg(it.P, '💧 Sampah lewat! Sungai makin kotor.'); }
      if (s.position.z > 7) { s.parent && s.parent.remove(s); items.splice(k, 1); }
    } else if (it.state === 'fly') {
      it.t += dt * 2.4; const u = Math.min(1, it.t);
      s.position.lerpVectors(it.from, it.to, u); s.position.y += Math.sin(u * Math.PI) * 2.2;
      s.material.rotation += dt * 8;
      if (u >= 1) { s.parent && s.parent.remove(s); items.splice(k, 1); }
    }
  }
  // karakter melompat, nomor panel
  players.forEach((P) => {
    if (!P.stand) return;
    P.stand.jump = Math.max(0, P.stand.jump - dt * 3);
    P.stand.ch.position.y = Math.sin(P.stand.jump * Math.PI) * 0.6 + (P.done && P.el.classList.contains('win') ? Math.abs(Math.sin(t / 220)) * 0.5 : 0);
    if (P.el) padUpdate(P);
  });
  // langit makin cerah saat sungai makin bersih (kemajuan pemain terbaik)
  const prog = players.length ? Math.min(1, Math.max(...players.map((p) => p.score)) / target) : 0;
  scene.background.lerpColors(SKY_RAIN, SKY_SUN, prog); scene.fog.color.copy(scene.background);
  sun.intensity = 1.2 + prog * 1.0; if (world.rain) world.rain.material.opacity = 0.5 * (1 - prog);
  waterT.offset.y += dt * v * 0.05;
  if (world.rain) { const a = world.rain.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 6) { a[i + 1] -= dt * 20; a[i + 4] -= dt * 20; if (a[i + 4] < 0) { a[i + 1] += 25; a[i + 4] += 25; } } world.rain.geometry.attributes.position.needsUpdate = true; }
  if (world.flag) world.flag.children.forEach((c, i) => { c.rotation.y = Math.sin(t / 250 + i) * 0.3; });
  for (let i = 0; i < SPL; i++) { if (sLife[i] <= 0) continue; sLife[i] -= dt; sVel[i * 3 + 1] -= 9 * dt; sPos[i * 3] += sVel[i * 3] * dt; sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt; sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt; if (sLife[i] <= 0) sPos[i * 3 + 1] = -9; }
  sGeo.attributes.position.needsUpdate = true;
  if (confC) { cData.forEach((d, i) => { d.p.addScaledVector(d.v, dt); d.r += dt * 4; if (d.p.y < 0) d.p.set(confC.x + (Math.random() - .5) * 6, confC.y + 4, confC.z + (Math.random() - .5) * 4); _o.position.copy(d.p); _o.rotation.set(d.r, d.r * 0.7, 0); _o.scale.setScalar(1); _o.updateMatrix(); conf.setMatrixAt(i, _o.matrix); }); conf.instanceMatrix.needsUpdate = true; }
  renderer.render(scene, cam);
}
// adegan latar di menu
buildWorld(2); resize(); requestAnimationFrame(frame);
setInterval(() => { players.forEach((P) => P.stand && fitSprite(P.stand.ch)); }, 1000); // pastikan rasio PNG benar setelah termuat

window.__sd = { state: () => ({ running, finished, players: players.map((p) => ({ n: p.name, s: p.score, w: p.wrong, m: p.miss, bot: !!p.bot })), front: players.map((p) => { const it = frontItem(p); return it ? { key: it.key, cat: ITEMS[it.key].cat, z: it.s.position.z } : null; }) }), press: (i, c) => press(players[i], c) };
if (window.Tutor) Tutor.init('selamatkan-desa', [
  { sel: '#segPlayers', text: 'Pilih jumlah pemain. Satu orang melawan robot, atau 2 sampai 4 teman.' },
  { sel: '#names', text: 'Tulis nama dan ketuk gambar untuk ganti karakter.' },
  { sel: '#start', text: 'Sampah hanyut ke arahmu. Tekan Organik atau Anorganik sebelum lewat!' },
], { inGame: 'Lihat sampah di tengah panelmu, lalu tekan Organik atau Anorganik.' });
