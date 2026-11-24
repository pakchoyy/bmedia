/* Main-yuk · Misi Selamatkan Desa (2.5D, Three.js r160).
   Desa banjir karena saluran tersumbat sampah. Pemain mengambil sampah, memilah Organik/Anorganik
   di pos pemilahan sekolah, dan membawa sampah B3 (pakai capit) ke Penampungan B3. */
import * as THREE from '/games/_shared/three.module.min.js';

const $ = (id) => document.getElementById(id);
const A = 'assets/';

/* ---------------- data ---------------- */
const ITEMS = {
  daun: { nama: 'daun kering', cat: 'organik', why: 'Daun kering bisa membusuk jadi kompos. Masukkan ke Organik, tempat hijau.' },
  pisang: { nama: 'kulit pisang', cat: 'organik', why: 'Kulit pisang mudah membusuk. Itu sampah Organik, tempat hijau.' },
  botol: { nama: 'botol plastik', cat: 'anorganik', why: 'Botol plastik tidak membusuk dan bisa didaur ulang. Masukkan ke Anorganik, tempat biru.' },
  kaleng: { nama: 'kaleng', cat: 'anorganik', why: 'Kaleng dari logam bisa didaur ulang. Masukkan ke Anorganik, tempat biru.' },
  kardus: { nama: 'kardus', cat: 'anorganik', why: 'Kardus bisa didaur ulang jadi kertas baru. Masukkan ke Anorganik, tempat biru.' },
  baterai: { nama: 'baterai bekas', cat: 'b3' },
  lampu: { nama: 'lampu bekas', cat: 'b3' },
};
const LEVELS = {
  1: { org: 4, ano: 4, b3: 0, time: 0 },
  2: { org: 5, ano: 5, b3: 2, time: 0 },
  3: { org: 6, ano: 6, b3: 3, time: 240 },
};
const STORY = [
  ['🌧️', 'Hujan deras turun semalaman di desa kita.'],
  ['🌊', 'Air meluap ke jalan. Saluran air tersumbat sampah!'],
  ['🧹', 'Ayo bantu! Ambil sampahnya, lalu pilah di pos sekolah. Sampah B3 ambil pakai capit.'],
];
const BAG_MAX = 3;

/* ---------------- menu ---------------- */
let charKey = 'boy', level = 2, gfx = 'bagus';
try { charKey = localStorage.getItem('sd_char') || 'boy'; level = +localStorage.getItem('sd_level') || 2; gfx = localStorage.getItem('bgy_gfx') || ((navigator.hardwareConcurrency || 8) <= 4 ? 'ringan' : 'bagus'); } catch (e) {}
function seg(id, fn, isOn) {
  const el = $(id);
  const mark = () => [...el.children].forEach((b) => b.classList.toggle('on', isOn(b.dataset.n)));
  el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fn(b.dataset.n); mark(); Sfx.click(); showBest(); });
  mark();
}
seg('segLevel', (n) => { level = +n; }, (n) => +n === level);
seg('segGfx', (n) => { gfx = n; try { localStorage.setItem('bgy_gfx', n); } catch (e) {} }, (n) => n === gfx);
const markChar = () => [...$('chars').children].forEach((b) => b.classList.toggle('on', b.dataset.c === charKey));
$('chars').addEventListener('click', (e) => { const b = e.target.closest('.char'); if (!b) return; charKey = b.dataset.c; markChar(); Sfx.click(); });
markChar();
const bestKey = () => 'sd_best_' + level;
function showBest() { let b = 0; try { b = +localStorage.getItem(bestKey()) || 0; } catch (e) {} $('best').textContent = b ? '🏆 Rekor kamu: ' + b + ' poin' : ''; }
showBest();

/* ---------------- renderer ---------------- */
const cv = $('cv');
const lite = () => gfx === 'ringan';
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const SKY_RAIN = new THREE.Color(0x8fa6b8), SKY_SUN = new THREE.Color(0x9fdcff);
scene.background = SKY_RAIN.clone();
scene.fog = new THREE.Fog(0x8fa6b8, 60, 120);
const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
const CAM_OFF = new THREE.Vector3(22, 24, 22);
const hemi = new THREE.HemisphereLight(0xdfefff, 0x5f8f4a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d8, 1.1); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
scene.add(sun, sun.target);

const mats = new Map();
function M(color, o = {}) { const k = color + JSON.stringify(o); if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.8, metalness: 0 }, o))); return mats.get(k); }
function box(w, h, d, c, x, y, z, parent = scene, cast = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'number' ? M(c) : c); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; }
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 4; return t; }
const loader = new THREE.TextureLoader();
const texCache = {};
function tex(name) { if (!texCache[name]) { const t = loader.load(A + name + '.png'); t.colorSpace = THREE.SRGBColorSpace; texCache[name] = t; } return texCache[name]; }

/* ---------------- dunia (mengikuti denah: jalan diagonal, saluran di kedua sisi, sekolah, rumah, sungai) ---------------- */
const colliders = []; // {x0,x1,z0,z1}
function solid(x, z, w, d) { colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); }
const BOUND = { x0: -34, x1: 34, z0: -19, z1: 18 };
const world = {};
function buildWorld() {
  // tanah rumput & tanah becek
  const grass = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6fbf4f'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.fillStyle = Math.random() < .5 ? '#62b043' : '#7fcd5c'; x.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, [40, 40]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground); world.ground = ground;
  const mud = new THREE.MeshStandardMaterial({ color: 0xc89a6a, roughness: 0.9 });
  [[0, -6.6, 80, 2.2], [0, 6.6, 80, 2.2], [-10, -10, 5, 6], [12, 10, 4, 6]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mud); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); m.receiveShadow = true; scene.add(m); });
  // jalan aspal
  const asp = canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#5e6371'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < .5 ? '#555a67' : '#6b7080'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [10, 1]);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(84, 6), new THREE.MeshStandardMaterial({ map: asp, roughness: 0.75 }));
  road.rotation.x = -Math.PI / 2; road.position.y = 0.03; road.receiveShadow = true; scene.add(road);
  // saluran beton + air mengalir (tekstur digeser)
  const waterT = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#3e9be0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(Math.random() * w, Math.random() * h); x.lineTo(Math.random() * w, Math.random() * h); x.stroke(); } }, [30, 1]);
  world.waterT = waterT;
  world.channels = [];
  [-4.1, 4.1].forEach((z) => {
    box(84, 0.35, 0.22, 0xcfd3da, 0, 0.17, z - 0.7); box(84, 0.35, 0.22, 0xcfd3da, 0, 0.17, z + 0.7);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(84, 1.2), new THREE.MeshStandardMaterial({ map: waterT, color: 0x8a6a45, roughness: 0.2, metalness: 0.1 }));
    w.rotation.x = -Math.PI / 2; w.position.set(0, 0.08, z); scene.add(w); world.channels.push(w);
  });
  // sekolah (kiri atas di denah) + halaman + bendera + pagar
  const sch = new THREE.Group(); sch.position.set(-12, 0, -13); scene.add(sch);
  const wallT = canvasTex(256, 64, (x) => { x.fillStyle = '#f3e3c3'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#c0392b'; x.fillRect(0, 44, 256, 20); for (let i = 0; i < 4; i++) { x.fillStyle = '#6a4a32'; x.fillRect(20 + i * 62, 10, 30, 30); x.fillStyle = '#9fd8ff'; x.fillRect(23 + i * 62, 13, 24, 24); } });
  box(10, 3, 5, new THREE.MeshStandardMaterial({ map: wallT }), 0, 1.5, 0, sch);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 11, 3), M(0xd8432f)); roof.rotation.set(Math.PI / 6, 0, Math.PI / 2); roof.scale.set(1, 1, 0.75); roof.position.y = 4.2; roof.castShadow = true; sch.add(roof);
  box(10.5, 0.25, 2.2, 0xe5e5e5, 0, 0.12, 3.4, sch); [-4.6, -1.5, 1.5, 4.6].forEach((x) => box(0.3, 2.8, 0.3, 0xfff6dc, x, 1.4, 4.3, sch));
  solid(-12, -13, 10.4, 5.4);
  const pole = box(0.12, 5, 0.12, 0xdddddd, -9, 2.5, -8.8); const flag = new THREE.Group(); flag.position.set(-9, 4.6, -8.8); scene.add(flag);
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), new THREE.MeshBasicMaterial({ color: 0xe8202a, side: THREE.DoubleSide })); fr.position.set(0.7, 0.22, 0); flag.add(fr);
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); fw.position.set(0.7, -0.22, 0); flag.add(fw);
  world.flag = flag; box(1, 0.2, 1, 0xbfbfbf, -9, 0.1, -8.8); solid(-9, -8.8, 0.6, 0.6);
  // pagar halaman sekolah
  box(0.3, 0.9, 9, 0xf1e2b8, -18, 0.45, -11.5); box(0.3, 0.9, 9, 0xf1e2b8, -2.5, 0.45, -11.5); solid(-18, -11.5, 0.4, 9); solid(-2.5, -11.5, 0.4, 9);
  // rumah-rumah
  const roofs = [0xd8432f, 0x2f7de0, 0xff8a1f, 0x8a5a3b];
  const houses = [[2, -13, 'kayu', 0], [12, -13, 'bata', 1], [-26, -12, 'kayu', 3], [24, -12, 'bata', 2], [-24, 12, 'bata', 1], [-8, 12.5, 'bata', 0], [8, 13, 'kayu', 0], [26, 11, 'kayu', 0]];
  houses.forEach(([x, z, t, r], i) => makeHouse(x, z, t, roofs[r], i % 2 ? Math.PI / 2 : 0));
  // sungai + jembatan (kanan atas)
  const river = new THREE.Mesh(new THREE.PlaneGeometry(90, 5), new THREE.MeshStandardMaterial({ map: waterT, color: 0xbfe6ff, roughness: 0.15 }));
  river.rotation.x = -Math.PI / 2; river.position.set(0, 0.05, -22); scene.add(river);
  box(3, 0.4, 7, 0xbfc4cc, 22, 0.35, -21.5); box(0.2, 0.7, 7, 0xa7adb6, 20.6, 0.9, -21.5); box(0.2, 0.7, 7, 0xa7adb6, 23.4, 0.9, -21.5);
  // pepohonan (instanced)
  const trunks = [], palms = [], round = [], bushes = [];
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (let i = 0; i < 60; i++) {
    const x = -38 + rnd() * 76, z = rnd() < .5 ? -16 - rnd() * 4 : 15 + rnd() * 6;
    if (colliders.some((c) => x > c.x0 - 1.5 && x < c.x1 + 1.5 && z > c.z0 - 1.5 && z < c.z1 + 1.5)) continue;
    if (rnd() < .55) { palms.push([x, z, 0.8 + rnd() * .5, rnd() * 6]); } else round.push([x, z, 0.8 + rnd() * .6]);
  }
  for (let i = 0; i < 70; i++) { const x = -36 + rnd() * 72, z = (rnd() < .5 ? -1 : 1) * (8 + rnd() * 9); if (!colliders.some((c) => x > c.x0 - .6 && x < c.x1 + .6 && z > c.z0 - .6 && z < c.z1 + .6)) bushes.push([x, z, 0.6 + rnd() * .6]); }
  const o = new THREE.Object3D();
  const inst = (geo, mat, list, f) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((p, i) => { f(o, p); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = true; scene.add(m); return m; };
  inst(new THREE.CylinderGeometry(0.18, 0.3, 5, 7), M(0x9b7448), palms, (o, p) => { o.position.set(p[0], 2.5 * p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, 0, 0.06); });
  const leaf = []; for (let i = 0; i < 8; i++) { const g = new THREE.BoxGeometry(0.6, 0.06, 2.8); g.translate(0, 0, 1.4); g.rotateX(0.5); g.rotateY(i / 8 * Math.PI * 2); leaf.push(g.toNonIndexed()); }
  const leafGeo = mergeGeos(leaf);
  inst(leafGeo, M(0x2fb84a, { flatShading: true }), palms, (o, p) => { o.position.set(p[0] + 0.3 * p[2], 5 * p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, p[3], 0); });
  inst(new THREE.CylinderGeometry(0.25, 0.4, 2, 7), M(0x7a5536), round, (o, p) => { o.position.set(p[0], p[2], p[1]); o.scale.setScalar(p[2]); o.rotation.set(0, 0, 0); });
  inst(new THREE.IcosahedronGeometry(1.8, 1), M(0x2f9e44, { flatShading: true }), round, (o, p) => { o.position.set(p[0], 3 * p[2], p[1]); o.scale.setScalar(p[2]); });
  inst(new THREE.IcosahedronGeometry(0.7, 1), M(0x3cbf55, { flatShading: true }), bushes, (o, p) => { o.position.set(p[0], 0.4 * p[2], p[1]); o.scale.set(p[2], p[2] * 0.75, p[2]); });
  // hujan
  const N = lite() ? 300 : 900, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 60, y = Math.random() * 30, z = (Math.random() - .5) * 60; pos.set([x, y, z, x + .15, y - .9, z + .15], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  world.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.55 }));
  world.rain.frustumCulled = false; scene.add(world.rain);
}
function mergeGeos(list) { const p = [], n = []; list.forEach((g) => { p.push(...g.attributes.position.array); n.push(...g.attributes.normal.array); }); const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); return m; }
const brickT = () => canvasTex(128, 64, (x) => { x.fillStyle = '#b5553a'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#8e3f2a'; x.lineWidth = 2; for (let r = 0; r < 8; r++) { x.beginPath(); x.moveTo(0, r * 8); x.lineTo(128, r * 8); x.stroke(); for (let c = 0; c < 8; c++) { const xx = c * 16 + (r % 2) * 8; x.beginPath(); x.moveTo(xx, r * 8); x.lineTo(xx, r * 8 + 8); x.stroke(); } } }, [2, 1]);
const woodT = () => canvasTex(128, 64, (x) => { x.fillStyle = '#a8693c'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#7d4a26'; x.lineWidth = 2; for (let r = 0; r < 8; r++) { x.beginPath(); x.moveTo(0, r * 8 + 4); x.lineTo(128, r * 8 + 4); x.stroke(); } x.fillStyle = '#5a3418'; x.fillRect(56, 26, 18, 38); x.fillStyle = '#9fd8ff'; x.fillRect(16, 18, 18, 16); x.fillRect(94, 18, 18, 16); }, [1, 1]);
let _brick, _wood;
function makeHouse(x, z, type, roofC, rot) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const lift = type === 'kayu' ? 0.8 : 0;
  if (lift) [[-2.2, -1.6], [2.2, -1.6], [-2.2, 1.6], [2.2, 1.6]].forEach(([a, b]) => box(0.3, lift, 0.3, 0x6a4a32, a, lift / 2, b, g));
  const mat = type === 'kayu' ? new THREE.MeshStandardMaterial({ map: (_wood = _wood || woodT()) }) : new THREE.MeshStandardMaterial({ map: (_brick = _brick || brickT()) });
  box(5, 2.6, 3.8, mat, 0, lift + 1.3, 0, g);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 5.8, 3), M(roofC, { roughness: 0.55 })); roof.rotation.set(Math.PI / 6, 0, Math.PI / 2); roof.scale.set(1, 1, 0.78); roof.position.y = lift + 3.55; roof.castShadow = true; g.add(roof);
  box(5, 0.15, 1.4, 0xb98a5a, 0, lift + 0.08, 2.6, g); box(5, 0.5, 0.08, 0xd9b37a, 0, lift + 0.45, 3.28, g);
  const w = rot ? 4.4 : 5.4, d = rot ? 5.4 : 4.4; solid(x, z, w, d);
}

/* ---------------- titik sumbatan, sampah, pos ---------------- */
const CLOGS = [{ x: -18, z: -4.1 }, { x: 4, z: 4.1 }, { x: 20, z: -4.1 }];
const SORT_POS = new THREE.Vector3(-6, 0, -9.2), B3_POS = new THREE.Vector3(-15.5, 0, -8.2);
let clogs = [], trash = [], player = null, bag = [], capit = null, stats = null, running = false, timeLeft = 0, score = 0, wrong = 0;
function sprite(name, h) {
  const t = tex(name); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.08 }));
  const img = t.image; const ar = img && img.width ? img.width / img.height : 1;
  s.scale.set(h * ar, h, 1); s.center.set(0.5, 0); s.userData.h = h;
  if (!img || !img.width) { const onl = () => { s.scale.set(h * t.image.width / t.image.height, h, 1); }; t.addEventListener ? setTimeout(function chk() { if (t.image && t.image.width) onl(); else setTimeout(chk, 100); }, 50) : 0; }
  return s;
}
function shadowDisc(r) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.06; return m; }
const staticGroup = new THREE.Group(); scene.add(staticGroup);
function buildStations() {
  // pos pemilahan: 2 tempat sampah + papan
  [['bin-organik', -1.2], ['bin-anorganik', 1.2]].forEach(([n, dx]) => { const s = sprite(n, 1.9); s.position.set(SORT_POS.x + dx, 0, SORT_POS.z); staticGroup.add(s); const sh = shadowDisc(0.7); sh.position.set(SORT_POS.x + dx, 0.06, SORT_POS.z); staticGroup.add(sh); });
  staticGroup.add(signBoard('POS PEMILAHAN', SORT_POS.x, SORT_POS.z - 1.3, '#2ec4b6'));
  // penampungan B3: tempat merah + kotak beratap
  const b = sprite('bin-b3', 1.9); b.position.copy(B3_POS); staticGroup.add(b);
  const sh = shadowDisc(0.7); sh.position.set(B3_POS.x, 0.06, B3_POS.z); staticGroup.add(sh);
  staticGroup.add(signBoard('PENAMPUNGAN B3', B3_POS.x, B3_POS.z - 1.3, '#e63946'));
  solid(SORT_POS.x, SORT_POS.z, 3.4, 0.8); solid(B3_POS.x, B3_POS.z, 1.2, 0.8);
}
function signBoard(text, x, z, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const t = canvasTex(512, 128, (c) => { c.fillStyle = color; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#1b1a3a'; c.lineWidth = 10; c.strokeRect(5, 5, 502, 118); c.fillStyle = '#fff'; c.font = '900 44px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 66); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t })); s.scale.set(3.2, 0.8, 1); s.position.y = 2.7; g.add(s);
  return g;
}
function spawnLevel() {
  const L = LEVELS[level];
  const pool = [];
  const pick = (keys, n) => { for (let i = 0; i < n; i++) pool.push(keys[i % keys.length]); };
  pick(['daun', 'pisang'], L.org); pick(['botol', 'kaleng', 'kardus'], L.ano); pick(['baterai', 'lampu'], L.b3);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  // tumpukan sumbatan: genangan coklat + air keruh
  clogs = CLOGS.map((c, i) => {
    const pud = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshStandardMaterial({ color: 0x9a7650, transparent: true, opacity: 0.85, roughness: 0.15 }));
    pud.rotation.x = -Math.PI / 2; pud.position.set(c.x, 0.04, c.z); pud.scale.setScalar(3.4); scene.add(pud);
    return { ...c, i, pud, items: [], clear: false, shrink: 3.4 };
  });
  trash = pool.map((key, k) => {
    const c = clogs[k % clogs.length];
    const ang = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 1.6;
    const x = c.x + Math.cos(ang) * r * 1.4, z = c.z + Math.sin(ang) * r * 0.9;
    const h = ITEMS[key].cat === 'b3' ? 0.95 : key === 'kardus' ? 1.1 : 1.0;
    const s = sprite(key, h); s.position.set(x, 0.05, z); scene.add(s);
    const sh = shadowDisc(0.35); sh.position.set(x, 0.06, z); scene.add(sh);
    const t = { key, s, sh, clog: c, ph: Math.random() * 6, gone: false };
    c.items.push(t); return t;
  });
}
function clearLevel() { trash.forEach((t) => { scene.remove(t.s); scene.remove(t.sh); }); clogs.forEach((c) => scene.remove(c.pud)); trash = []; clogs = []; }

/* ---------------- pemain ---------------- */
const P = { pos: new THREE.Vector3(-6, 0, -1.5), vel: new THREE.Vector3(), face: 1, walk: 0, target: null, bob: 0 };
function makePlayer() {
  if (player) { scene.remove(player.g); }
  const g = new THREE.Group(); scene.add(g);
  const s = sprite(charKey, 2.5); g.add(s);
  const sh = shadowDisc(0.55); g.add(sh);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 32), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.9, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.07; g.add(ring);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 4), new THREE.MeshBasicMaterial({ color: 0xffd23f })); arrow.rotation.x = Math.PI / 2; const ag = new THREE.Group(); ag.add(arrow); arrow.position.z = 1.6; ag.position.y = 0.3; g.add(ag);
  const carry = new THREE.Group(); g.add(carry); carry.position.y = 2.75;
  player = { g, s, ring, ag, carry };
  P.pos.set(-6, 0, -1.5); P.target = null;
}
function renderCarry() {
  player.carry.clear();
  const list = capit ? [capit] : bag;
  list.forEach((k, i) => { const s = sprite(k, 0.55); s.position.set((i - (list.length - 1) / 2) * 0.55, 0, 0); player.carry.add(s); });
}
function collide(x, z) {
  if (x < BOUND.x0 || x > BOUND.x1 || z < BOUND.z0 || z > BOUND.z1) return true;
  const r = 0.4; return colliders.some((c) => x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1);
}

/* ---------------- input ---------------- */
const keys = {};
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase(); keys[k] = true;
  if ((k === ' ' || k === 'e' || k === 'enter') && running && $('sort').classList.contains('hidden')) { e.preventDefault(); doAction(); }
  if (k === 'q' && running && !$('act2').classList.contains('hidden')) $('act2').click();
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
// arah layar → dunia (kamera isometrik dari +x,+z)
const SUP = new THREE.Vector3(-1, 0, -1).normalize(), SRIGHT = new THREE.Vector3(1, 0, -1).normalize();
const joy = { x: 0, y: 0, id: null };
(function setupJoy() {
  const el = $('joy'), knob = el.querySelector('i');
  const set = (e) => { const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 38}px,${dy * 38}px)`; };
  el.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; el.setPointerCapture(e.pointerId); set(e); P.target = null; });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) set(e); });
  const end = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
})();
// ketuk tanah → jalan ke sana
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
cv.addEventListener('pointerdown', (e) => {
  if (!running) return;
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (ray.ray.intersectPlane(GROUND, hit)) { P.target = hit.clone(); tapMark.position.set(hit.x, 0.08, hit.z); tapMark.visible = true; tapMark.scale.setScalar(1); }
});
const tapMark = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.45, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); tapMark.rotation.x = -Math.PI / 2; tapMark.visible = false; scene.add(tapMark);

/* ---------------- aksi ---------------- */
let near = null; // {type, t?}
let warnedB3 = false;
function toast(text, kind, say) {
  const old = document.querySelector('.toast'); if (old) old.remove();
  const d = document.createElement('div'); d.className = 'toast ' + (kind || ''); d.textContent = text; document.body.appendChild(d);
  clearTimeout(toast.t); toast.t = setTimeout(() => d.remove(), 3400);
  if (say && window.Suara) Suara.read(text, { force: !Sfx.muted() });
}
function findNear() {
  const p = P.pos; let best = null, bd = 1.7;
  if (p.distanceTo(SORT_POS) < 2.6 && bag.length) return { type: 'sort' };
  if (p.distanceTo(B3_POS) < 2.3 && capit) return { type: 'b3drop' };
  const can = (t) => ITEMS[t.key].cat === 'b3' ? !capit && !bag.length : !capit && bag.length < BAG_MAX;
  let any = null, ad = 1.7;
  for (const t of trash) { if (t.gone) continue; const d = Math.hypot(t.s.position.x - p.x, t.s.position.z - p.z); if (d < ad) { ad = d; any = t; } if (d < bd && can(t)) { bd = d; best = t; } }
  best = best || any;
  if (best) return { type: ITEMS[best.key].cat === 'b3' ? 'b3' : 'trash', t: best };
  if (p.distanceTo(SORT_POS) < 2.6) return { type: 'sortEmpty' };
  return null;
}
function updateAction() {
  near = findNear();
  const a = $('act'), a2 = $('act2');
  a2.classList.add('hidden'); a.classList.remove('dim');
  if (!near) { a.textContent = capit ? 'Bawa ke Penampungan B3' : bag.length >= BAG_MAX ? 'Tas penuh! Ke pos pilah' : 'Dekati sampah'; a.classList.add('dim'); return; }
  const n = near.t ? ITEMS[near.t.key].nama : '';
  if (near.type === 'trash') { if (capit) { a.textContent = 'Serahkan B3 dulu'; a.classList.add('dim'); } else if (bag.length >= BAG_MAX) { a.textContent = 'Tas penuh! Ke pos pilah'; a.classList.add('dim'); } else a.textContent = '✋ Ambil ' + n; }
  else if (near.type === 'b3') { if (capit || bag.length) { a.textContent = capit ? 'Capit sedang dipakai' : 'Kosongkan tas dulu'; a.classList.add('dim'); } else { a.textContent = '🧤 Pakai capit'; a2.textContent = '✋ Pakai tangan'; a2.classList.remove('hidden'); } }
  else if (near.type === 'sort') a.textContent = '♻️ Pilah sampah';
  else if (near.type === 'sortEmpty') { a.textContent = 'Tas masih kosong'; a.classList.add('dim'); }
  else if (near.type === 'b3drop') a.textContent = '☢️ Serahkan B3';
}
function removeTrash(t) {
  t.gone = true; scene.remove(t.s); scene.remove(t.sh);
  const c = t.clog;
  if (!c.clear && c.items.every((x) => x.gone)) {
    c.clear = true; stats.clogs++;
    toast('Saluran ' + (c.i + 1) + ' bersih! Air mengalir lagi.', 'good', true); Sfx.cheer && Sfx.cheer();
    score += 20; hud();
  }
}
function doAction() {
  if (!running) return;
  near = findNear(); if (!near) return;
  const t = near.t;
  if (near.type === 'trash' && !capit && bag.length < BAG_MAX) { bag.push(t.key); removeTrash(t); Sfx.pop(); renderCarry(); hud(); if (window.Tutor) Tutor.done(); }
  else if (near.type === 'b3' && !capit && !bag.length) {
    capit = t.key; removeTrash(t); Sfx.coin && Sfx.coin(); renderCarry(); hud();
    toast('Bagus! Sampah B3 diambil pakai capit. Bawa ke Penampungan B3 merah di dekat sekolah.', 'good', true);
  }
  else if (near.type === 'sort') openSort();
  else if (near.type === 'b3drop') {
    stats.b3++; score += 15; capit = null; renderCarry(); hud(); Sfx.good(); fxAt(B3_POS);
    toast('Terima kasih! Sampah B3 aman di penampungan. Jangan dibuang ke saluran atau dibongkar.', 'good', true);
    checkWin();
  }
  updateAction();
}
$('act').addEventListener('click', doAction);
$('act2').addEventListener('click', () => {
  if (!near || near.type !== 'b3') return;
  wrong++; Sfx.bad(); score = Math.max(0, score - 5); hud();
  toast('Awas! ' + ITEMS[near.t.key].nama + ' termasuk sampah B3 yang berbahaya. Jangan dipegang langsung. Pakai capit.', 'bad', true);
});
function fxAt(v) { const p = v.clone(); p.y = 1.5; p.project(cam); const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight; if (window.Fx) Fx.good(x, y, '+'); }

/* ---------------- pos pemilahan (seret / ketuk) ---------------- */
let selIdx = -1;
function openSort() {
  running = false; selIdx = -1; renderSort(); $('sort').classList.remove('hidden'); Sfx.click();
  if (window.Suara) Suara.read('Seret sampah ke tempat yang benar.', { force: !Sfx.muted() });
}
function closeSort() { $('sort').classList.add('hidden'); running = true; last = 0; updateAction(); checkWin(); }
$('sortClose').addEventListener('click', closeSort);
function renderSort() {
  const box = $('sitems'); box.innerHTML = '';
  if (!bag.length) { box.innerHTML = '<div style="font-weight:900;padding:30px 0">Tas sudah kosong. Hebat! 👏</div>'; return; }
  bag.forEach((k, i) => {
    const d = document.createElement('div'); d.className = 'sitem nb-sm' + (i === selIdx ? ' sel' : ''); d.innerHTML = '<img alt="">'; d.querySelector('img').src = A + k + '.png'; d.title = ITEMS[k].nama;
    d.addEventListener('pointerdown', (e) => dragItem(e, i, d)); box.appendChild(d);
  });
}
function binAt(x, y) { return [...document.querySelectorAll('#sort .bin')].find((b) => { const r = b.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }); }
function dragItem(e, i, el) {
  e.preventDefault(); const sx = e.clientX, sy = e.clientY; let moved = false, hot = null;
  const g = document.createElement('img'); g.className = 'ghost'; g.src = A + bag[i] + '.png'; g.style.left = sx + 'px'; g.style.top = sy + 'px'; g.style.display = 'none'; document.body.appendChild(g);
  const mv = (ev) => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { moved = true; g.style.display = ''; } g.style.left = ev.clientX + 'px'; g.style.top = ev.clientY + 'px'; const b = binAt(ev.clientX, ev.clientY); if (b !== hot) { hot && hot.classList.remove('hot'); hot = b; hot && hot.classList.add('hot'); } };
  const up = (ev) => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); g.remove(); hot && hot.classList.remove('hot'); if (!moved) { selIdx = selIdx === i ? -1 : i; renderSort(); return; } const b = binAt(ev.clientX, ev.clientY); if (b) dropTo(i, b.dataset.cat, b); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
document.querySelectorAll('#sort .bin').forEach((b) => b.addEventListener('click', () => { if (selIdx >= 0) dropTo(selIdx, b.dataset.cat, b); }));
function dropTo(i, cat, el) {
  const k = bag[i], it = ITEMS[k];
  if (it.cat === cat) {
    bag.splice(i, 1); score += 10; stats[cat === 'organik' ? 'org' : 'ano']++; Sfx.good(); selIdx = -1;
    const r = el.getBoundingClientRect(); if (window.Fx) Fx.good(r.left + r.width / 2, r.top + 20, '+10');
    toast('Benar! ' + it.nama[0].toUpperCase() + it.nama.slice(1) + ' masuk ' + (cat === 'organik' ? 'Organik.' : 'Anorganik.'), 'good', false);
  } else {
    wrong++; Sfx.bad(); el.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], 300);
    toast('Belum tepat. ' + it.why, 'bad', true);
  }
  renderCarry(); hud(); renderSort();
  if (!bag.length) setTimeout(() => { if (!$('sort').classList.contains('hidden')) closeSort(); }, 900);
}

/* ---------------- HUD ---------------- */
function hud() {
  const total = trash.length, left = trash.filter((t) => !t.gone).length + bag.length + (capit ? 1 : 0);
  $('hScore').textContent = '⭐ ' + score;
  $('hMission').textContent = 'Saluran bersih ' + stats.clogs + '/3 · Sampah beres ' + (total - left) + '/' + total;
  const b = $('bag'); let html = '<small>Tas</small>';
  for (let i = 0; i < BAG_MAX; i++) html += '<span class="slot">' + (bag[i] ? '<img src="' + A + bag[i] + '.png" alt="">' : '') + '</span>';
  if (LEVELS[level].b3) html += '<small>🧤</small><span class="slot capit">' + (capit ? '<img src="' + A + capit + '.png" alt="">' : '') + '</span>';
  b.innerHTML = html;
  if (LEVELS[level].time) { const s = Math.max(0, Math.ceil(timeLeft)); $('hTime').textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
}
function checkWin() {
  if (trash.every((t) => t.gone) && !bag.length && !capit) win(true);
}

/* ---------------- alur ---------------- */
let last = 0, won = false, sunT = 0;
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setPixelRatio(Math.min(lite() ? 1 : 1.5, devicePixelRatio || 1)); renderer.setSize(w, h, false);
  const asp = w / h, viewH = asp < 1 ? 19 : 17;
  cam.left = -viewH * asp / 2; cam.right = viewH * asp / 2; cam.top = viewH / 2; cam.bottom = -viewH / 2; cam.updateProjectionMatrix();
}
addEventListener('resize', resize);
function story(done) {
  let i = 0; const el = $('story');
  const show = () => { $('stIcon').textContent = STORY[i][0]; $('stText').textContent = STORY[i][1]; $('stNext').textContent = i === STORY.length - 1 ? 'Mulai! ▶' : 'Lanjut ▶'; if (window.Suara) Suara.read(STORY[i][1], { force: !Sfx.muted() }); };
  el.classList.remove('hidden'); show();
  $('stNext').onclick = () => { i++; Sfx.click(); if (i >= STORY.length) { el.classList.add('hidden'); done(); } else show(); };
  $('stSkip').onclick = () => { el.classList.add('hidden'); done(); };
}
let built = false;
function start() {
  try { localStorage.setItem('sd_char', charKey); localStorage.setItem('sd_level', level); } catch (e) {}
  if (!built) { buildWorld(); buildStations(); built = true; }
  renderer.shadowMap.enabled = !lite(); world.rain.material.opacity = 0.55;
  clearLevel(); spawnLevel(); makePlayer();
  bag = []; capit = null; score = 0; wrong = 0; won = false; sunT = 0; stats = { clogs: 0, org: 0, ano: 0, b3: 0 };
  timeLeft = LEVELS[level].time; $('hTime').classList.toggle('hidden', !timeLeft);
  scene.background.copy(SKY_RAIN); scene.fog.color.copy(SKY_RAIN); world.channels.forEach((c) => c.material.color.setHex(0x8a6a45));
  ['menu', 'win'].forEach((id) => $(id).classList.add('hidden'));
  resize(); renderCarry(); hud();
  const touch = matchMedia('(pointer: coarse)').matches;
  story(() => {
    $('hud').classList.remove('hidden'); $('act').classList.remove('hidden'); $('joy').classList.toggle('hidden', !touch); $('keys').classList.toggle('hidden', touch);
    running = true; last = 0; Sfx.go(); Sfx.music(true); updateAction();
    if (window.Tutor) setTimeout(Tutor.hint, 600);
  });
}
function win(ok) {
  running = false; won = ok; Sfx.music(false);
  ['hud', 'act', 'act2', 'joy', 'keys'].forEach((id) => $(id).classList.add('hidden'));
  const stars = !ok ? 0 : wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
  $('wTitle').textContent = ok ? 'Desa selamat! 🎉' : 'Waktu habis! ⏱';
  $('wStars').textContent = ok ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '💧';
  $('wSub').textContent = ok ? 'Skor ' + score + ' · salah pilah ' + wrong + ' kali. Saluran bersih, air mengalir lagi.' : 'Skor ' + score + '. Coba lagi, desa masih butuh bantuanmu!';
  $('wOrg').textContent = stats.org; $('wAno').textContent = stats.ano; $('wB3').textContent = stats.b3;
  let best = 0; try { best = +localStorage.getItem(bestKey()) || 0; if (ok && score > best) localStorage.setItem(bestKey(), score); } catch (e) {}
  if (window.Koin && ok) setTimeout(() => Koin.add(score / 10, 'Selamatkan Desa'), 800);
  if (ok) setTimeout(() => { Sfx.win(); Fx.win(); }, 1200);
  setTimeout(() => { $('win').classList.remove('hidden'); if (!ok) Fx.mascot('sedih'); }, ok ? 4000 : 200);
}
$('start').addEventListener('click', start);
$('again').addEventListener('click', start);
$('toMenu').addEventListener('click', () => { $('win').classList.add('hidden'); $('menu').classList.remove('hidden'); showBest(); });
$('bExit').addEventListener('click', () => Dialog.ask('Selesai bermain sekarang?', () => { running = false; Sfx.music(false); ['hud', 'act', 'act2', 'joy', 'keys', 'sort'].forEach((id) => $(id).classList.add('hidden')); $('menu').classList.remove('hidden'); }));
$('bMute').addEventListener('click', function () { try { localStorage.setItem('bgy_muted', Sfx.muted() ? '0' : '1'); } catch (e) {} this.textContent = Sfx.muted() ? '🔇' : '🔊'; Sfx.music(!Sfx.muted() && running); });
$('bMute').textContent = Sfx.muted() ? '🔇' : '🔊';

/* ---------------- loop ---------------- */
const tmp = new THREE.Vector3(), mv = new THREE.Vector3(), camT = new THREE.Vector3(-6, 0, -1.5);
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
  if (!built) return;
  if (running) {
    if (timeLeft) { timeLeft -= dt; if (Math.floor(timeLeft + dt) !== Math.floor(timeLeft)) hud(); if (timeLeft <= 0) { win(false); } }
    // gerak
    mv.set(0, 0, 0);
    const ky = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0), kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    if (kx || ky) { mv.addScaledVector(SUP, ky).addScaledVector(SRIGHT, kx); P.target = null; }
    if (joy.x || joy.y) { mv.addScaledVector(SUP, -joy.y).addScaledVector(SRIGHT, joy.x); }
    if (!mv.lengthSq() && P.target) { mv.subVectors(P.target, P.pos); mv.y = 0; if (mv.length() < 0.25) { P.target = null; mv.set(0, 0, 0); tapMark.visible = false; } }
    const speed = 5.2;
    if (mv.lengthSq() > 0.0001) {
      mv.normalize().multiplyScalar(speed * dt);
      const nx = P.pos.x + mv.x, nz = P.pos.z + mv.z;
      let movedOk = false;
      if (!collide(nx, P.pos.z)) { P.pos.x = nx; movedOk = true; }
      if (!collide(P.pos.x, nz)) { P.pos.z = nz; movedOk = true; }
      if (!movedOk) { P.target = null; tapMark.visible = false; }
      const sx = mv.dot(SRIGHT); if (Math.abs(sx) > 0.001) P.face = sx < 0 ? -1 : 1;
      P.walk += dt * 11;
    } else P.walk *= 0.85;
    updateAction.n = (updateAction.n || 0) + 1; if (updateAction.n % 6 === 0) updateAction();
  }
  // pemain: jalan = naik-turun + goyang, balik arah
  if (player) {
    player.g.position.copy(P.pos);
    const moving = mv.lengthSq() > 0 && running;
    const bob = moving ? Math.abs(Math.sin(P.walk)) * 0.18 : Math.sin(t / 500) * 0.02;
    player.s.position.y = bob; player.s.material.rotation = moving ? Math.sin(P.walk) * 0.06 : 0;
    const w = Math.abs(player.s.scale.x); player.s.scale.x = w * P.face;
    player.ring.material.opacity = near && near.type !== 'sortEmpty' ? 0.95 : 0.35;
    player.carry.position.y = 2.75 + bob + Math.sin(t / 300) * 0.05;
    // panah ke sasaran
    let goal = null;
    if (capit) goal = B3_POS; else if (bag.length >= BAG_MAX || (bag.length && trash.every((x) => x.gone || ITEMS[x.key].cat === 'b3'))) goal = SORT_POS;
    else { let bd = 1e9; for (const x of trash) { if (x.gone) continue; if (ITEMS[x.key].cat === 'b3' && bag.length) continue; const d = x.s.position.distanceToSquared(P.pos); if (d < bd) { bd = d; goal = x.s.position; } } }
    player.ag.visible = !!goal && running && (!near || near.type === 'sortEmpty');
    if (goal) player.ag.rotation.y = Math.atan2(goal.x - P.pos.x, goal.z - P.pos.z);
  }
  // sampah bergoyang di air
  trash.forEach((x) => { if (!x.gone) x.s.position.y = 0.05 + Math.abs(Math.sin(t / 600 + x.ph)) * 0.06; });
  // genangan surut
  clogs.forEach((c) => { if (c.clear && c.shrink > 0.01) { c.shrink = Math.max(0, c.shrink - dt * 1.6); c.pud.scale.setScalar(c.shrink); if (c.shrink <= 0.01) c.pud.visible = false; } });
  // air saluran: makin jernih saat saluran dibersihkan
  if (stats) { const k = stats.clogs / 3; world.channels.forEach((c) => c.material.color.setRGB(0.54 + (0.75 - 0.54) * k, 0.42 + (0.9 - 0.42) * k, 0.27 + (1 - 0.27) * k)); }
  world.waterT.offset.x -= dt * (0.15 + (stats ? stats.clogs : 0) * 0.25);
  // hujan / cerah
  if (won) { sunT = Math.min(1, sunT + dt * 0.6); scene.background.lerpColors(SKY_RAIN, SKY_SUN, sunT); scene.fog.color.copy(scene.background); world.rain.material.opacity = 0.55 * (1 - sunT); sun.intensity = 1.1 + sunT * 1.2; }
  else { sun.intensity = 1.1; }
  const rp = world.rain.geometry.attributes.position, arr = rp.array;
  for (let i = 0; i < arr.length; i += 6) { arr[i + 1] -= dt * 22; arr[i + 4] -= dt * 22; if (arr[i + 4] < 0) { const x = P.pos.x + (Math.random() - .5) * 50, z = P.pos.z + (Math.random() - .5) * 50, y = 22 + Math.random() * 8; arr[i] = x; arr[i + 1] = y; arr[i + 2] = z; arr[i + 3] = x + .15; arr[i + 4] = y - .9; arr[i + 5] = z + .15; } }
  rp.needsUpdate = true;
  if (world.flag) world.flag.children.forEach((c, i) => { c.rotation.y = Math.sin(t / 250 + i) * 0.3; });
  if (tapMark.visible) { tapMark.scale.multiplyScalar(1 + dt * 0.8); tapMark.material.opacity = Math.max(0, tapMark.material.opacity - dt); if (tapMark.material.opacity <= 0) { tapMark.visible = false; tapMark.material.opacity = 0.9; } }
  // kamera mengikuti
  camT.lerp(P.pos, Math.min(1, dt * 6));
  cam.position.copy(camT).add(CAM_OFF); cam.lookAt(camT);
  sun.position.copy(camT).add(tmp.set(12, 25, 8)); sun.target.position.copy(camT);
  renderer.render(scene, cam);
}
resize(); requestAnimationFrame(frame);
// pratinjau latar di menu
buildWorld(); buildStations(); built = true; makePlayer();

window.__sd = { state: () => ({ running, bag: [...bag], capit, score, wrong, stats, pos: [P.pos.x, P.pos.z], trash: trash.filter((t) => !t.gone).map((t) => ({ key: t.key, x: t.s.position.x, z: t.s.position.z })), near: near && near.type }), tp: (x, z) => { P.pos.set(x, 0, z); camT.copy(P.pos); }, act: doAction, SORT_POS, B3_POS };
if (window.Tutor) Tutor.init('selamatkan-desa', [
  { sel: '#chars', text: 'Pilih karaktermu: laki-laki atau perempuan.' },
  { sel: '#segLevel', text: 'Pilih tingkat. Normal dan Seru punya sampah B3.' },
  { sel: '#start', text: 'Ambil sampah di saluran, lalu pilah di pos sekolah. Sampah B3 pakai capit!' },
], { inGame: 'Jalan ke sampah, lalu tekan tombol Ambil.' });
