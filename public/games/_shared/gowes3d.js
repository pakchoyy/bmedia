/* Main-yuk · Gowes ke Sekolah 3D (Three.js).
   Logika game tetap di index.html: lapisan ini membaca elemen .bike (style.left %, visibility,
   kelas wob/go, data-char) lalu menggambar adegan 3D. Tanpa WebGL → tampilan 2D lama. */
import * as THREE from '/games/_shared/three.module.min.js';

const LEN = 140;
const LANE_W = 2.6;
const INK = 0x1b1a3a;

export const CHAR_OPTS = {
  skin: [['#f6d3b3', 'Terang'], ['#e9b98f', 'Kuning langsat'], ['#c98d63', 'Sawo matang'], ['#8d5a3b', 'Gelap']],
  gender: [['l', 'Laki-laki'], ['p', 'Perempuan']],
  head: [['pendek', 'Rambut pendek'], ['panjang', 'Rambut panjang'], ['kuncir', 'Kuncir'], ['jilbab', 'Jilbab'], ['peci', 'Peci'], ['topi', 'Topi sekolah']],
  aksesori: [['none', 'Tanpa', 0], ['kacamata', 'Kacamata', 40], ['dasi', 'Dasi kupu', 60], ['headset', 'Headset', 90], ['mahkota', 'Mahkota', 150], ['tanduk', 'Tanduk lucu', 120], ['sayap', 'Sayap', 250]],
  seragam: [['sd', 'SD'], ['smp', 'SMP'], ['sma', 'SMA'], ['pramuka', 'Pramuka'], ['olahraga', 'Olahraga']],
};
const UNIFORM = {
  sd: { top: 0xffffff, bottom: 0xd62839, tie: 0xd62839 },
  smp: { top: 0xffffff, bottom: 0x1f4fa8, tie: 0x1f4fa8 },
  sma: { top: 0xffffff, bottom: 0x7d8694, tie: 0x7d8694 },
  pramuka: { top: 0xb08a4f, bottom: 0x6b5232, tie: 0xd62839 },
  olahraga: { top: 0x2ec4b6, bottom: 0x1b1a3a, tie: null },
};
export function defaultChar(i) {
  return { gender: ['l', 'p', 'p', 'l', 'p'][i % 5], skin: CHAR_OPTS.skin[i % 4][0], head: ['pendek', 'jilbab', 'kuncir', 'peci', 'panjang'][i % 5], seragam: 'sd' };
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
const mats = new Map();
function mat(color) { const k = String(color); if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial({ color })); return mats.get(k); }
function box(w, h, d, color) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color)); m.castShadow = true; return m; }

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function faceMat(skin) {
  const key = 'face2' + skin;
  if (mats.has(key)) return mats.get(key);
  const t = canvasTex(256, 256, (x) => {
    x.fillStyle = skin; x.fillRect(0, 0, 256, 256);
    // alis
    x.strokeStyle = '#3a2618'; x.lineWidth = 9; x.lineCap = 'round';
    [[62, 92], [194, 92]].forEach(([cx, cy]) => { x.beginPath(); x.arc(cx, cy + 18, 26, Math.PI * 1.25, Math.PI * 1.75); x.stroke(); });
    // mata besar berkilau
    [[72, 128], [184, 128]].forEach(([cx, cy]) => {
      x.fillStyle = '#1b1a3a'; x.beginPath(); x.ellipse(cx, cy, 21, 27, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#5b3a24'; x.beginPath(); x.ellipse(cx, cy + 4, 14, 18, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#1b1a3a'; x.beginPath(); x.ellipse(cx, cy + 4, 8, 10, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - 7, cy - 9, 7, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(cx + 8, cy + 10, 3.5, 0, Math.PI * 2); x.fill();
    });
    // pipi
    x.fillStyle = 'rgba(255,93,143,.35)'; [[46, 172], [210, 172]].forEach(([cx, cy]) => { x.beginPath(); x.ellipse(cx, cy, 22, 13, 0, 0, Math.PI * 2); x.fill(); });
    // mulut senyum
    x.fillStyle = '#7a2230'; x.beginPath(); x.moveTo(104, 176); x.quadraticCurveTo(128, 214, 152, 176); x.closePath(); x.fill();
    x.fillStyle = '#ff8fa8'; x.beginPath(); x.ellipse(128, 194, 12, 6, 0, 0, Math.PI * 2); x.fill();
  });
  t.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.65 }); mats.set(key, m); return m;
}

function nameSprite(text, bg) {
  const t = canvasTex(256, 64, (x) => {
    x.font = '800 30px Nunito, Fredoka, sans-serif';
    const w = Math.min(250, x.measureText(text).width + 34);
    x.fillStyle = '#1b1a3a'; x.beginPath(); x.roundRect((256 - w) / 2 + 3, 9, w, 46, 23); x.fill();
    x.fillStyle = bg; x.beginPath(); x.roundRect((256 - w) / 2, 6, w, 46, 23); x.fill();
    x.lineWidth = 4; x.strokeStyle = '#1b1a3a'; x.stroke();
    x.fillStyle = '#1b1a3a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 30);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.scale.set(2.4, 0.6, 1); s.renderOrder = 10; return s;
}


/* ---------- sepeda 3D ---------- */
const LEG = 0.4, ARM = 0.33, CRANK = 0.16, BB = new THREE.Vector3(0, 0.44, 0.05), GRIP = new THREE.Vector3(0, 1.42, -0.48);
const G = {
  tire: new THREE.TorusGeometry(0.385, 0.06, 10, 28).rotateY(Math.PI / 2),
  rim: new THREE.TorusGeometry(0.33, 0.022, 6, 28).rotateY(Math.PI / 2),
  hub: new THREE.CylinderGeometry(0.055, 0.055, 0.14, 12).rotateZ(Math.PI / 2),
  spoke: new THREE.CylinderGeometry(0.009, 0.009, 0.66, 4),
  ring: new THREE.TorusGeometry(0.12, 0.018, 6, 24).rotateY(Math.PI / 2),
  cog: new THREE.TorusGeometry(0.055, 0.016, 6, 16).rotateY(Math.PI / 2),
  arm: new THREE.CapsuleGeometry(0.022, CRANK, 3, 8),
  pedal: new THREE.BoxGeometry(0.14, 0.035, 0.09),
  grip: new THREE.CapsuleGeometry(0.035, 0.1, 4, 10).rotateZ(Math.PI / 2),
  saddle: new THREE.SphereGeometry(1, 16, 10),
  fender: new THREE.TorusGeometry(0.43, 0.035, 6, 20, Math.PI * 0.7).rotateY(Math.PI / 2),
  thigh: new THREE.CapsuleGeometry(0.075, LEG - 0.12, 4, 10),
  arm2: new THREE.CapsuleGeometry(0.07, ARM - 0.1, 4, 10),
  hand: new THREE.SphereGeometry(0.085, 12, 8),
  sock: new THREE.CylinderGeometry(0.08, 0.08, 0.08, 10),
  shoe: new THREE.CapsuleGeometry(0.075, 0.12, 4, 10).rotateX(Math.PI / 2),
};
function smat(color, rough = 0.45, metal = 0.1) {
  const k = 's' + new THREE.Color(color).getHex() + '_' + rough + '_' + metal;
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
  return mats.get(k);
}
const UP = new THREE.Vector3(0, 1, 0);
const rgeos = new Map();
/** Kotak bersudut membulat (tanpa addon): titik BoxGeometry ditarik ke kulit bulat. */
function rgeo(w, h, d, r) {
  r = Math.min(r, w / 2, h / 2, d / 2) * 0.999;
  const k = [w, h, d, r].map((v) => v.toFixed(3)).join(',');
  if (rgeos.has(k)) return rgeos.get(k);
  const geo = new THREE.BoxGeometry(w, h, d, 5, 5, 5), pos = geo.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
    v.sub(c); if (v.lengthSq() > 1e-9) v.setLength(r); v.add(c); pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals(); rgeos.set(k, geo); return geo;
}
function rbox(w, h, d, color) {
  const m = new THREE.Mesh(rgeo(w, h, d, Math.min(w, h, d) * 0.32), smat(color, 0.65, 0)); m.castShadow = true; return m;
}
function tube(a, b, r, m, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), m);
  mesh.position.copy(a).addScaledVector(d, 0.5); mesh.quaternion.setFromUnitVectors(UP, d.normalize()); mesh.castShadow = true;
  return mesh;
}
function joint(p, r, m) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m); s.position.copy(p); return s; }
function buildBike(color) {
  const g = new THREE.Group();
  const paint = smat(color, 0.32, 0.25), chrome = smat(0xdfe5ee, 0.25, 0.6), rubber = smat(0x262536, 0.85, 0), dark = smat(0x3a3950, 0.5, 0.3);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = V(0, 0.45, 0.72), F = V(0, 0.45, -0.72);
  const S = V(0, 0.98, 0.3), H = V(0, 1.02, -0.52), Hb = V(0, 0.8, -0.58);
  // roda
  const wheels = [];
  [F, R].forEach((c) => {
    const w = new THREE.Group(); w.position.copy(c);
    const tire = new THREE.Mesh(G.tire, rubber); tire.castShadow = true; w.add(tire);
    w.add(new THREE.Mesh(G.rim, chrome));
    w.add(new THREE.Mesh(G.hub, paint));
    for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(G.spoke, chrome); sp.rotation.x = i * Math.PI / 6; w.add(sp); }
    g.add(w); wheels.push(w);
    const fe = new THREE.Mesh(G.fender, paint); fe.position.copy(c); fe.rotation.x = c === F ? 0.25 : 0.75; g.add(fe);
  });
  // rangka
  const fr = 0.045;
  g.add(tube(S, H, fr, paint), tube(Hb, BB, fr * 1.15, paint), tube(BB, S, fr, paint), tube(Hb, H, fr * 1.2, paint));
  [-1, 1].forEach((sx) => {
    const off = V(sx * 0.07, 0, 0);
    g.add(tube(BB.clone().add(off), R.clone().add(off), 0.028, paint), tube(S.clone().add(V(sx * 0.03, 0, 0)), R.clone().add(off), 0.026, paint));
    g.add(tube(Hb.clone().add(V(sx * 0.03, 0, 0)), F.clone().add(off), 0.03, chrome));
  });
  [S, H, Hb, BB].forEach((p) => g.add(joint(p, fr * 1.15, paint)));
  // setang & grip
  const top = V(0, 1.38, -0.5);
  g.add(tube(H, top, 0.03, chrome));
  const barL = V(-0.36, 1.42, -0.48), barR = V(0.36, 1.42, -0.48);
  g.add(tube(barL, barR, 0.024, chrome));
  [barL, barR].forEach((p) => { const gr = new THREE.Mesh(G.grip, smat(0xff5d8f, 0.7, 0)); gr.position.copy(p); gr.position.x *= 0.92; g.add(gr); });
  // sadel
  const post = V(0, 1.08, 0.34); g.add(tube(S, post, 0.022, chrome));
  const sad = new THREE.Mesh(G.saddle, smat(0x2b2a40, 0.6, 0)); sad.scale.set(0.13, 0.05, 0.2); sad.position.set(0, 1.11, 0.33); sad.castShadow = true; g.add(sad);
  const nose = new THREE.Mesh(G.saddle, sad.material); nose.scale.set(0.06, 0.04, 0.12); nose.position.set(0, 1.1, 0.2); g.add(nose);
  // gir, rantai, crank, pedal
  const ringX = 0.1;
  const ring = new THREE.Mesh(G.ring, chrome); ring.position.copy(BB).setX(ringX); g.add(ring);
  const cog = new THREE.Mesh(G.cog, chrome); cog.position.copy(R).setX(ringX); g.add(cog);
  g.add(tube(V(ringX, BB.y + 0.12, BB.z), V(ringX, R.y + 0.055, R.z), 0.012, dark, 5), tube(V(ringX, BB.y - 0.12, BB.z), V(ringX, R.y - 0.055, R.z), 0.012, dark, 5));
  const crank = new THREE.Group(); crank.position.copy(BB); g.add(crank);
  crank.add(new THREE.Mesh(G.hub, dark));
  const pedals = [];
  [[0.13, -1], [-0.13, 1]].forEach(([x, dir]) => {
    const arm = new THREE.Mesh(G.arm, chrome); arm.position.set(x, dir * CRANK / 2, 0); crank.add(arm);
    const pd = new THREE.Group(); pd.position.set(x + Math.sign(x) * 0.05, dir * CRANK, 0); crank.add(pd);
    pd.add(new THREE.Mesh(G.pedal, dark)); pedals.push(pd);
  });
  return { group: g, wheels, crank, pedals };
}
/** Atur crank, pedal (tetap datar), dan kaki (IK 2 tulang) ke sudut crank a. */
function poseRider(r, a) {
  r.crankA = a; r.crank.rotation.x = a;
  r.pedals.forEach((p) => { p.rotation.x = -a; });
  const hy = r.body.position.y, hz = r.body.position.z;
  r.legs.forEach((l, i) => {
    const aa = a + (i ? 0 : Math.PI);
    const py = BB.y - Math.cos(aa) * CRANK * (i ? 1 : 1), pz = BB.z - Math.sin(aa) * CRANK;
    const dy = py - (hy + l.position.y), dz = pz - (hz + l.position.z);
    const D = Math.min(LEG * 2 - 0.001, Math.max(0.12, Math.hypot(dy, dz)));
    const phi = Math.atan2(-dz, -dy);
    const alpha = Math.acos(Math.min(1, D / (2 * LEG)));
    l.rotation.x = phi + alpha;
    l.userData.knee.rotation.x = -2 * alpha;
  });
  // tangan memegang grip (koordinat lokal badan)
  (r.arms || []).forEach((sh) => {
    const ty = GRIP.y - hy, tz = GRIP.z - hz;
    const dy = ty - sh.position.y, dz = tz - sh.position.z;
    const D = Math.min(ARM * 2 - 0.001, Math.max(0.1, Math.hypot(dy, dz)));
    const alpha = Math.acos(Math.min(1, D / (2 * ARM)));
    sh.rotation.x = Math.atan2(-dz, -dy) - alpha;
    sh.userData.elbow.rotation.x = 2 * alpha;
  });
}

/** Anak sekolah bersepeda, proporsi chibi (kepala besar). */
export function makeRider(color, ch) {
  ch = Object.assign(defaultChar(0), ch || {});
  const skin = new THREE.Color(ch.skin).getHex();
  const u = UNIFORM[ch.seragam] || UNIFORM.sd;
  const g = new THREE.Group();
  const box = rbox;
  // sepeda (stylized: tabung halus, roda berjari-jari, crank + pedal + rantai)
  const bike = buildBike(color); g.add(bike.group);
  const wheels = bike.wheels;
  // badan
  const body = new THREE.Group(); body.position.set(0, 1.12, 0.3); g.add(body);
  const top = box(0.62, 0.62, 0.42, u.top); top.position.set(0, 0.4, -0.12); top.rotation.x = -0.4; body.add(top);
  if (u.tie) { const tie = box(0.12, 0.32, 0.05, u.tie); tie.position.set(0, 0.42, -0.36); tie.rotation.x = -0.4; body.add(tie); }
  const girl = ch.gender === 'p' && ch.seragam !== 'olahraga';
  const bot = girl ? new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.46, 0.42, 8), smat(u.bottom)) : box(0.58, 0.26, 0.48, u.bottom);
  bot.castShadow = true; bot.position.set(0, girl ? -0.02 : 0.04, 0); body.add(bot);
  const bag = box(0.5, 0.52, 0.22, color); bag.position.set(0, 0.48, 0.24); bag.rotation.x = -0.4; body.add(bag);
  const arms = [];
  [-0.34, 0.34].forEach((x) => {
    const sh = new THREE.Group(); sh.position.set(x, 0.66, -0.26); body.add(sh);
    const up = new THREE.Mesh(G.arm2, smat(u.top, 0.7, 0)); up.position.y = -ARM / 2; up.castShadow = true; sh.add(up);
    const el = new THREE.Group(); el.position.y = -ARM; sh.add(el);
    const lo = new THREE.Mesh(G.arm2, smat(ch.seragam === 'olahraga' ? skin : u.top, 0.7, 0)); lo.position.y = -ARM / 2; el.add(lo);
    const hand = new THREE.Mesh(G.hand, smat(skin, 0.7, 0)); hand.position.y = -ARM - 0.02; el.add(hand);
    sh.userData.elbow = el; sh.userData.gx = x; arms.push(sh);
  });
  const legs = [];
  const legC = ch.seragam === 'olahraga' ? u.bottom : skin;
  [-0.15, 0.15].forEach((x) => {
    const l = new THREE.Group(); l.position.set(x, -0.04, -0.08);
    const t = new THREE.Mesh(G.thigh, smat(legC, 0.8)); t.position.y = -LEG / 2; t.castShadow = true; l.add(t);
    const knee = new THREE.Group(); knee.position.y = -LEG; l.add(knee);
    const sh = new THREE.Mesh(G.thigh, smat(legC, 0.8)); sh.position.y = -LEG / 2; sh.castShadow = true; knee.add(sh);
    const sock = new THREE.Mesh(G.sock, smat(0xffffff, 0.8)); sock.position.y = -LEG + 0.04; knee.add(sock);
    const shoe = new THREE.Mesh(G.shoe, smat(0x2b2a40, 0.6)); shoe.position.set(0, -LEG - 0.02, -0.06); shoe.castShadow = true; knee.add(shoe);
    l.userData.knee = knee; body.add(l); legs.push(l);
  });
  // kepala besar
  const head = new THREE.Group(); head.position.set(0, 1.12, -0.38); body.add(head);
  const skinM = smat(skin), faceM = faceMat(ch.skin);
  // urutan sisi BoxGeometry: +x,-x,+y,-y,+z,-z (wajah ke depan = -z)
  const skull = new THREE.Mesh(rgeo(0.82, 0.78, 0.78, 0.2), [skinM, skinM, skinM, skinM, skinM, faceM]); skull.castShadow = true; head.add(skull);
  const hair = 0x2a1d14;
  if (ch.head === 'jilbab') {
    const j = box(0.92, 0.88, 0.86, 0xffffff); j.position.set(0, 0.03, 0.05); head.add(j);
    const front = new THREE.Mesh(rgeo(0.66, 0.6, 0.04, 0.015), [skinM, skinM, skinM, skinM, skinM, faceM]); front.position.set(0, -0.02, -0.4); head.add(front);
    const cape = box(1, 0.4, 0.7, 0xffffff); cape.position.set(0, -0.5, 0.1); head.add(cape);
  } else {
    const cap = box(0.86, 0.22, 0.82, hair); cap.position.set(0, 0.4, 0.02); head.add(cap);
    const back = box(0.86, 0.6, 0.18, hair); back.position.set(0, 0.12, 0.35); head.add(back);
    if (ch.head === 'panjang' || (ch.gender === 'p' && ch.head !== 'kuncir')) { const lh = box(0.88, 0.95, 0.22, hair); lh.position.set(0, -0.12, 0.38); head.add(lh); [-0.44, 0.44].forEach((x) => { const sd = box(0.1, 0.8, 0.6, hair); sd.position.set(x, -0.08, 0.1); head.add(sd); }); }
    if (ch.head === 'kuncir') { [-0.5, 0.5].forEach((x) => { const p = box(0.2, 0.36, 0.2, hair); p.position.set(x, 0.18, 0.2); head.add(p); const b = box(0.22, 0.08, 0.22, 0xff5d8f); b.position.set(x, 0.38, 0.2); head.add(b); }); }
    if (ch.head === 'peci') { const p = box(0.84, 0.3, 0.8, 0x1b1a3a); p.position.set(0, 0.55, 0.02); head.add(p); }
    if (ch.head === 'topi') { const p = box(0.86, 0.26, 0.82, ch.seragam === 'sd' ? 0xd62839 : 0x1f4fa8); p.position.set(0, 0.55, 0.02); head.add(p); const v = box(0.8, 0.06, 0.4, ch.seragam === 'sd' ? 0xd62839 : 0x1f4fa8); v.position.set(0, 0.44, -0.55); head.add(v); }
  }
  const ak = ch.aksesori || 'none';
  if (ak === 'kacamata') { [-0.2, 0.2].forEach((x) => { const l = box(0.24, 0.18, 0.04, 0x1b1a3a); l.position.set(x, 0.05, -0.41); head.add(l); const g2 = box(0.18, 0.12, 0.02, 0x9fd8ff); g2.position.set(x, 0.05, -0.43); head.add(g2); }); const br = box(0.16, 0.05, 0.04, 0x1b1a3a); br.position.set(0, 0.07, -0.41); head.add(br); }
  if (ak === 'dasi') { [-0.1, 0.1].forEach((x) => { const d = box(0.16, 0.14, 0.05, 0xff5d8f); d.position.set(x, 0.7, -0.4); d.rotation.z = x > 0 ? 0.4 : -0.4; body.add(d); }); }
  if (ak === 'headset') { const band = box(0.92, 0.1, 0.12, 0x1b1a3a); band.position.set(0, 0.5, 0.02); head.add(band); [-0.46, 0.46].forEach((x) => { const e = box(0.12, 0.3, 0.3, color); e.position.set(x, 0.05, 0.02); head.add(e); }); }
  if (ak === 'mahkota') { const c = box(0.7, 0.18, 0.66, 0xffd23f); c.position.set(0, 0.72, 0.02); head.add(c); [-0.26, 0, 0.26].forEach((x) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 4), smat(0xffd23f)); t.position.set(x, 0.92, -0.25); head.add(t); }); }
  if (ak === 'tanduk') { [-0.28, 0.28].forEach((x) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), smat(0xff7a1a)); t.position.set(x, 0.72, 0); t.rotation.z = x > 0 ? -0.3 : 0.3; head.add(t); }); }
  if (ak === 'sayap') { [-1, 1].forEach((sx) => { const w = box(0.06, 0.55, 0.75, 0xffffff); w.position.set(sx * 0.42, 0.55, 0.32); w.rotation.z = sx * 0.6; body.add(w); }); }
  if (ch.head !== 'peci' && ch.head !== 'topi') { const helm = box(0.9, 0.16, 0.86, color); helm.position.set(0, ch.head === 'jilbab' ? 0.53 : 0.56, 0.02); head.add(helm); }
  g.scale.setScalar(1.15);
  const rider = { group: g, wheels, legs, body, head, arms, crank: bike.crank, pedals: bike.pedals, crankA: 0.6 };
  poseRider(rider, 0.6);
  return rider;
}

/* ---------- lingkungan ---------- */
function skyTexture() {
  return canvasTex(8, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2f7fe0'); gr.addColorStop(0.45, '#7cc4ff'); gr.addColorStop(0.75, '#ffd7a8'); gr.addColorStop(1, '#ffb27a');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  });
}

function instanced(geo, color, list) {
  const m = new THREE.InstancedMesh(geo, mat(color), list.length);
  const o = new THREE.Object3D();
  list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[4] || 0, 0); o.scale.setScalar(p[3] || 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  return m;
}

function buildWorld(scene, lanes) {
  let seed = 11; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const roadW = Math.max(2, lanes) * LANE_W + 1.4, half = roadW / 2;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mat(0x4fc25a)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(roadW, LEN + 60), mat(0xe2643f)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.04, -LEN / 2 + 10); road.receiveShadow = true; scene.add(road);
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let l = 0; l <= lanes; l++) { const x = -half + 0.7 + l * ((roadW - 1.4) / Math.max(1, lanes)); const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.12, LEN + 60), white); ln.rotation.x = -Math.PI / 2; ln.position.set(x, 0.07, -LEN / 2 + 10); scene.add(ln); }
  // trotoar & pagar
  [-1, 1].forEach((s) => {
    const sw = box(2.2, 0.25, LEN + 60, 0xd9d2c3); sw.position.set(s * (half + 1.1), 0.12, -LEN / 2 + 10); sw.receiveShadow = true; scene.add(sw);
    const rail = box(0.12, 0.12, LEN + 60, 0xffffff); rail.position.set(s * (half + 2.2), 0.9, -LEN / 2 + 10); scene.add(rail);
  });
  const posts = []; for (let z = 10; z > -LEN - 20; z -= 2.5) [-1, 1].forEach((s) => posts.push([s * (half + 2.2), 0.45, z, 1]));
  scene.add(instanced(new THREE.BoxGeometry(0.14, 0.9, 0.14), 0xffffff, posts));
  // penonton (badan + kepala + bendera) di belakang pagar
  const shirts = [0xff5d8f, 0x4aa8ff, 0xffd23f, 0x2ec4b6, 0xff7a1a, 0xb79cff, 0xffffff];
  const groups = shirts.map(() => []), heads = [], flags = [];
  for (let z = 6; z > -LEN - 10; z -= 1.1) [-1, 1].forEach((s) => {
    if (rnd() < 0.18) return;
    const row = rnd() < 0.5 ? 0 : 1, x = s * (half + 3 + row * 1.1 + rnd() * 0.3), zz = z + rnd() * 0.4;
    groups[Math.floor(rnd() * shirts.length)].push([x, 0.55 + row * 0.25, zz, 1]);
    heads.push([x, 1.25 + row * 0.25, zz, 1]);
    if (rnd() < 0.3) flags.push([x - s * 0.3, 1.75 + row * 0.25, zz, 1]);
  });
  const crowd = new THREE.Group();
  groups.forEach((list, i) => list.length && crowd.add(instanced(new THREE.BoxGeometry(0.62, 0.9, 0.42), shirts[i], list)));
  crowd.add(instanced(new THREE.BoxGeometry(0.5, 0.5, 0.5), 0xe9b98f, heads));
  crowd.add(instanced(new THREE.BoxGeometry(0.04, 0.5, 0.36), 0xe63946, flags));
  scene.add(crowd);
  // rumah & pohon rapat
  const roofs = [0xff5d8f, 0x4aa8ff, 0x2ec4b6, 0xff7a1a, 0xb79cff];
  const walls = [], roofLists = roofs.map(() => []), trunks = [], leaves = [];
  for (let z = 8; z > -LEN - 10; z -= 7) [-1, 1].forEach((s) => {
    const x = s * (half + 9 + rnd() * 3);
    if (rnd() < 0.65) { walls.push([x, 1.5, z, 1, 0]); roofLists[Math.floor(rnd() * roofs.length)].push([x, 3.9, z, 1, Math.PI / 4]); }
    else { trunks.push([x, 0.9, z, 1]); leaves.push([x, 3, z, 1 + rnd() * 0.4]); }
    trunks.push([s * (half + 15 + rnd() * 5), 0.9, z + 3, 1]); leaves.push([s * (half + 15 + rnd() * 5), 3, z + 3, 1.2]);
  });
  scene.add(instanced(new THREE.BoxGeometry(4, 3, 4), 0xfff6dc, walls));
  roofLists.forEach((l, i) => l.length && scene.add(instanced(new THREE.ConeGeometry(3.3, 1.9, 4), roofs[i], l)));
  scene.add(instanced(new THREE.BoxGeometry(0.5, 1.8, 0.5), 0x8a5a3b, trunks));
  scene.add(instanced(new THREE.ConeGeometry(1.6, 3.4, 7), 0x2fae5a, leaves));
  // gapura finis
  const gate = new THREE.Group();
  [-1, 1].forEach((s) => { const p = box(0.5, 5, 0.5, 0xff5d8f); p.position.set(s * (half + 0.6), 2.5, -LEN); gate.add(p); });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(roadW + 2, 1.2, 0.3), [mat(0xffd23f), mat(0xffd23f), mat(0xffd23f), mat(0xffd23f),
    new THREE.MeshBasicMaterial({ map: canvasTex(512, 96, (x) => { x.fillStyle = '#ffd23f'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#1b1a3a'; x.font = '900 60px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FINIS · SD MAIN-YUK', 256, 50); }) }), mat(0xffd23f)]);
  banner.position.set(0, 5, -LEN); gate.add(banner); scene.add(gate);
  const fin = new THREE.Mesh(new THREE.PlaneGeometry(roadW, 1.4), new THREE.MeshBasicMaterial({ map: (() => { const t = canvasTex(64, 16, (x) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#1b1a3a' : '#fff'; x.fillRect(i * 4, j * 4, 4, 4); } }); t.magFilter = THREE.NearestFilter; return t; })() }));
  fin.rotation.x = -Math.PI / 2; fin.position.set(0, 0.08, -LEN); scene.add(fin);
  // sekolah & bendera
  const sch = new THREE.Group(); sch.position.set(0, 0, -LEN - 14);
  const b = box(14, 4, 4, 0xfff6dc); b.position.y = 2; sch.add(b);
  const r = box(15, 0.6, 4.8, 0xff7a1a); r.position.y = 4.3; sch.add(r);
  for (let i = -5; i <= 5; i += 2.5) { const w = box(1.4, 1.2, 0.05, 0x9fd8ff); w.position.set(i, 2.4, 2.02); sch.add(w); }
  const pole = box(0.15, 8, 0.15, 0xdddddd); pole.position.set(8.5, 4, 3); sch.add(pole);
  const red = box(2, 0.65, 0.05, 0xe63946); red.position.set(9.5, 7.6, 3); sch.add(red);
  const wht = box(2, 0.65, 0.05, 0xffffff); wht.position.set(9.5, 6.95, 3); sch.add(wht);
  scene.add(sch);
  // gunung & awan
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(18 + rnd() * 10, 22 + rnd() * 16, 6), mat(i % 2 ? 0x7fb0d6 : 0x96c1e2)); m.position.set(-110 + i * 28, 9, -LEN - 80 - rnd() * 30); scene.add(m); }
  const clouds = [];
  for (let i = 0; i < 12; i++) { const c = new THREE.Group(); for (let k = 0; k < 3; k++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(1.8 + rnd(), 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); bb.position.set(k * 2, rnd() * 0.6, 0); c.add(bb); } c.position.set(-70 + rnd() * 140, 22 + rnd() * 12, -30 - rnd() * 160); scene.add(c); clouds.push(c); }
  return { crowd, clouds, flag: [red, wht] };
}

/* ---------- efek boost ---------- */
function makeTrail(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.9), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffffff : color, transparent: true, opacity: 0 })); p.position.set((i - 2.5) * 0.25, 0.5 + (i % 3) * 0.35, 1.2 + (i % 2) * 0.4); g.add(p); }
  return g;
}

export function mount(sceneEl) {
  if (!hasWebGL() || !sceneEl) return null;
  sceneEl.classList.add('is3d');
  const canvas = document.createElement('canvas'); canvas.className = 'g3d'; sceneEl.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  let pr = Math.min(window.devicePixelRatio || 1, 1.5); renderer.setPixelRatio(pr);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(0xffd7a8, 60, 190);
  const cam = new THREE.PerspectiveCamera(60, 1, 0.3, 500);
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x5fae5a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.7); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
  scene.add(sun, sun.target);

  let world = null, worldLanes = 0;
  const riders = new Map();

  function sync() {
    const bikes = sceneEl.querySelectorAll('.rlane .bike');
    const n = bikes.length;
    if (n !== worldLanes) { worldLanes = n; if (!world) world = buildWorld(scene, Math.max(n, 2)); }
    const roadInner = Math.max(n, 2) * LANE_W;
    bikes.forEach((el, i) => {
      let r = riders.get(el);
      const ch = el.dataset.char;
      if (!r || r.ch !== ch) {
        if (r) scene.remove(r.group);
        const color = new THREE.Color(getComputedStyle(el).getPropertyValue('--c').trim() || '#ff7675');
        let cfg = null; try { cfg = ch ? JSON.parse(ch) : null; } catch (e) {}
        r = makeRider(color, cfg || defaultChar(i)); r.ch = ch; r.z = r.z || 0; r.tilt = 0; r.boost = 0;
        r.trail = makeTrail(color); r.group.add(r.trail);
        r.hex = '#' + color.getHexString(); r.text = null;
        scene.add(r.group); riders.set(el, r);
      }
      const t = el.querySelector('.tag')?.textContent || '';
      if (t !== r.text) { if (r.label) r.group.remove(r.label); r.label = nameSprite(t, r.hex); r.label.position.set(0, 3.2, 0); r.group.add(r.label); r.text = t; }
      r.visible = el.style.visibility !== 'hidden'; r.group.visible = r.visible;
      r.lane = -roadInner / 2 + LANE_W / 2 + i * (roadInner / Math.max(n, 2)) + (n === 1 ? roadInner / 4 : 0);
      const left = parseFloat(el.style.left) || 2;
      const tgt = -Math.max(0, Math.min(1, (left - 2) / 76)) * LEN;
      if (r.target !== undefined && tgt < r.target - 0.5) r.boost = 1;
      r.target = tgt; r.wob = el.classList.contains('wob'); r.isBot = el.classList.contains('bot');
    });
    riders.forEach((r, el) => { if (!el.isConnected) { scene.remove(r.group); riders.delete(el); } });
  }

  function resize() { const w = sceneEl.clientWidth, h = sceneEl.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(sceneEl); resize();

  let last = performance.now(), camZ = 8, alive = true, slow = 0, finishAt = 0, podium = null, lastLeader = null, shake = 0;
  // HUD: strip progres lintasan + posisi
  const hud = document.createElement('div'); hud.className = 'g3d-hud';
  hud.innerHTML = '<div class="g3d-track"><span class="g3d-fin">🏁</span></div><div class="g3d-speed"></div>';
  sceneEl.appendChild(hud);
  const track = hud.querySelector('.g3d-track'), speedFx = hud.querySelector('.g3d-speed');
  if (!document.getElementById('g3d-css')) {
    const st = document.createElement('style'); st.id = 'g3d-css';
    st.textContent = '.g3d-hud{position:absolute;inset:0;pointer-events:none;z-index:3;opacity:1!important}' +
      '.g3d-track{position:absolute;left:12px;right:12px;bottom:10px;height:12px;border-radius:99px;background:rgba(255,255,255,.75);border:2px solid #1b1a3a;box-shadow:2px 2px 0 #1b1a3a}' +
      '.g3d-fin{position:absolute;right:-6px;top:50%;transform:translateY(-50%);font-size:18px}' +
      '.g3d-dot{position:absolute;top:50%;width:22px;height:22px;margin-left:-11px;border-radius:50%;border:2px solid #1b1a3a;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;font:900 11px Nunito,sans-serif;color:#1b1a3a;transition:left .3s}' +
      '.g3d-speed{position:absolute;inset:0;opacity:0;transition:opacity .25s;background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.55) 0 1.2deg,transparent 1.2deg 9deg);-webkit-mask:radial-gradient(circle at 50% 45%,transparent 32%,#000 70%);mask:radial-gradient(circle at 50% 45%,transparent 32%,#000 70%)}' +
      '.g3d-speed.on{opacity:.8}';
    document.head.appendChild(st);
  }
  const dots = new Map();
  const t0 = performance.now(), camPos = new THREE.Vector3(6, 5.5, -8), camLook = new THREE.Vector3(0, 1.2, 0);
  let lastCenter = 0; const center0 = () => lastCenter;
  const roadHalf = () => Math.max(worldLanes, 2) * LANE_W / 2 + 0.7;
  function frame(now) {
    if (!alive) return;
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    const realDt = dt; if (finishAt && now - finishAt < 1400) dt *= 0.3; // slow-motion saat finis
    // turunkan kualitas otomatis bila perangkat lambat
    if (realDt > 0.034) { if (++slow > 90 && renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; if (world) world.crowd.visible = sceneEl.clientWidth > 900; pr = 1; renderer.setPixelRatio(1); resize(); } } else slow = Math.max(0, slow - 1);
    sync();
    let cnt = 0, lead = 0, back = -1e9;
    riders.forEach((r) => { if (r.visible) { cnt++; lead = Math.min(lead, r.z); back = Math.max(back, r.z); } });
    if (!cnt) { lead = back = 0; }
    const center = (back + lead) / 2, K = 0.25; lastCenter = center;
    // peringkat (berdasar target) → HUD, label, sorakan saat menyalip
    const ranked = [...riders.values()].filter((r) => r.visible).sort((a, b) => a.target - b.target);
    ranked.forEach((r, i) => {
      let d = dots.get(r); if (!d) { d = document.createElement('span'); d.className = 'g3d-dot'; d.style.background = r.hex; track.appendChild(d); dots.set(r, d); }
      d.style.left = Math.min(100, (-r.target / LEN) * 100) + '%'; d.textContent = i + 1; d.style.zIndex = 10 - i;
    });
    dots.forEach((d, r) => { if (!r.group.parent) { d.remove(); dots.delete(r); } });
    if (ranked[0] && lastLeader && ranked[0] !== lastLeader && !finishAt && ranked[0].target < -2 && window.Sfx && Sfx.cheer) Sfx.cheer();
    lastLeader = ranked[0] || null;
    const humans = ranked.filter((r) => !r.isBot);
    const boosting = humans.some((r) => r.boost > 0.4);
    speedFx.classList.toggle('on', boosting && !finishAt);
    if (boosting) shake = Math.min(1, shake + realDt * 3); else shake = Math.max(0, shake - realDt * 2);
    riders.forEach((r) => {
      const before = r.z;
      r.z += (r.target - r.z) * Math.min(1, dt * 3);
      const moved = Math.abs(r.z - before);
      const vz = center + (r.z - center) * K;
      if (podium && podium.built) { r.group.visible = !!r.podium; if (r.podium) { r.group.position.copy(r.podium); r.group.rotation.y = Math.PI; } } else r.group.position.set(r.lane, 0, vz);
      const spin = moved * 2.4 + dt * 0.5;                      // roda & crank satu sumber gerak
      r.wheels.forEach((w) => { w.rotation.x -= spin; });
      r.body.position.y = 1.12 + Math.abs(Math.sin(r.crankA)) * (moved > 0.002 ? 0.03 : 0);
      poseRider(r, r.crankA - spin * 0.55);
      r.head.rotation.z = Math.sin(now / 400 + r.lane) * 0.05;
      r.tilt += ((r.wob ? Math.sin(now / 45) * 0.35 : Math.sin(now / 160) * (moved > 0.002 ? 0.04 : 0)) - r.tilt) * Math.min(1, dt * 8);
      r.group.rotation.z = r.tilt;
      r.boost = Math.max(0, r.boost - dt * 1.2);
      r.trail.children.forEach((p, i) => { p.material.opacity = r.boost * 0.9; p.scale.z = 1 + r.boost * 3; p.position.z = 1.2 + (i % 2) * 0.4 + r.boost * 1.2 + Math.sin(now / 40 + i) * 0.1; });
    });
    // ---- kamera sinematik: intro → (chase / samping / depan rendah bergiliran) → finis slow-motion ----
    const spread = Math.abs((back - lead) * K);
    const many = cnt > 2;
    let leadVz = 0, leadX = 0; riders.forEach((r) => { if (r.visible && r.group.position.z <= leadVz) { leadVz = r.group.position.z; leadX = r.group.position.x; } });
    let focVz = leadVz, focX = leadX; if (humans[0]) { focVz = humans[0].group.position.z; focX = humans[0].group.position.x; }
    const age = (now - t0) / 1000;
    const dist = (many ? 7.5 : 5.8) + spread * 0.8;
    let want, look;
    if (podium && now > podium.at) {
      if (!podium.built) buildPodium();
      want = new THREE.Vector3(0, 4.2, podium.z + 9); look = new THREE.Vector3(0, 2.2, podium.z);
    } else if (finishAt) {
      const a = (now - finishAt) / 1000 * 0.5;                  // orbit pelan di depan pemenang
      want = new THREE.Vector3(leadX + 2.5 + Math.sin(a) * 3, 2.6, leadVz - 8.5);   // di depan pemenang, menghadap ke belakang
      look = new THREE.Vector3(leadX, 1.9, leadVz);
    } else if (age < 4.2 && lead > -1) {                        // hitung mundur: isometrik depan-samping
      const a = age / 4.2;
      const rx = roadHalf() + 0.6;                                 // di atas trotoar, tidak menabrak rumah
      want = new THREE.Vector3(rx - a * 1.5, 5.5 - a * 2, -8 + a * 3.5);
      look = new THREE.Vector3(0, 1.2, 0);
    } else {
      const shot = Math.floor((age - 4.2) / 7) % 4;             // 0 belakang, 1 samping, 2 belakang, 3 depan rendah
      // sudut samping dari dalam pagar & cukup tinggi agar penonton tidak menutupi; fokus pada pemain (bukan robot)
      if (shot === 1) { want = new THREE.Vector3(roadHalf() - 0.2, 3.6, focVz + 3.5); look = new THREE.Vector3(focX * 0.5, 1.3, focVz - 3); }
      else if (shot === 3) { want = new THREE.Vector3(focX * 0.6 + 1.2, 1.6, focVz - 7.5); look = new THREE.Vector3(focX * 0.5, 1.6, focVz + 2); }
      else { want = new THREE.Vector3(0, (many ? 3.6 : 2.9) + spread * 0.15, center + spread / 2 + dist); look = new THREE.Vector3(0, 1.7, center - 12); }
    }
    // saat berpindah sudut melintasi rombongan, kamera naik agar tidak menembus pesepeda
    if (!finishAt && Math.abs(camPos.z - center) < 5 && Math.abs(want.z - camPos.z) > 3) want.y = Math.max(want.y, 6.5);
    camPos.lerp(want, Math.min(1, realDt * (finishAt ? 3 : 2.6)));
    cam.fov += ((boosting && !finishAt ? 72 : 60) - cam.fov) * Math.min(1, realDt * 4); cam.updateProjectionMatrix();
    camLook.lerp(look, Math.min(1, realDt * 4));
    cam.position.copy(camPos); if (shake > 0) cam.position.add(new THREE.Vector3((Math.random() - .5) * shake * 0.12, (Math.random() - .5) * shake * 0.08, 0)); cam.lookAt(camLook);
    camZ = camPos.z;
    sun.position.set(10, 22, camZ + 6); sun.target.position.set(0, 0, camZ - 10);
    if (world) {
      world.clouds.forEach((c, i) => { c.position.x += dt * (0.5 + (i % 3) * 0.3); if (c.position.x > 80) c.position.x = -80; });
      world.crowd.position.y = Math.abs(Math.sin(now / 220)) * 0.12;
      const wv = Math.sin(now / 280) * 0.2; world.flag.forEach((f) => { f.rotation.y = wv; });
    }
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function buildPodium() {
    podium.built = true;
    const order = [...riders.values()].filter((r) => r.visible).sort((a, b) => a.target - b.target).slice(0, 3);
    const g = new THREE.Group(); g.position.set(0, 0, podium.z);
    const spots = [[0, 2.2, 0xffd23f], [-3, 1.4, 0xd7dbe3], [3, 0.9, 0xe0915a]];
    spots.forEach((p, i) => {
      const b = box(2.6, p[1], 2.2, p[2]); b.position.set(p[0], p[1] / 2, 0); g.add(b);
      const num = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(64, 64, (x) => { x.fillStyle = '#1b1a3a'; x.font = '900 52px Fredoka,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i + 1), 32, 36); }) }));
      num.position.set(p[0], p[1] / 2, 1.12); g.add(num);
      const r = order[i]; if (!r) return;
      r.podium = new THREE.Vector3(p[0], p[1], podium.z);
    });
    scene.add(g);
  }
  return { finish() { if (!finishAt) { finishAt = performance.now(); podium = { at: finishAt + 1900, z: center0() - 12, built: false }; } }, destroy() { alive = false; ro.disconnect(); renderer.dispose(); canvas.remove(); } };
}

/** Pratinjau karakter berputar untuk menu Buat Karakter. */
export function preview(canvas, color, getCfg) {
  if (!hasWebGL()) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa88, 1.4));
  const d = new THREE.DirectionalLight(0xffffff, 1.4); d.position.set(3, 5, 4); scene.add(d);
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 50); cam.position.set(4.2, 3.2, -5.2); cam.lookAt(0, 1.6, 0);
  let r = null, key = '', alive = true;
  function frame(now) {
    if (!alive) return;
    const cfg = getCfg(), k = JSON.stringify(cfg);
    if (k !== key) { if (r) scene.remove(r.group); r = makeRider(new THREE.Color(color), cfg); scene.add(r.group); key = k; }
    const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h && (canvas.width !== Math.round(w * renderer.getPixelRatio()))) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    r.group.rotation.y = Math.sin(now / 1200) * 0.9;
    renderer.render(scene, cam); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { destroy() { alive = false; renderer.dispose(); } };
}
