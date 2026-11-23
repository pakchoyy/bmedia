/* Main-yuk · Tampilan 3D untuk Gowes ke Sekolah (Three.js).
   Tidak mengubah logika game: membaca posisi .bike (style.left %) di lintasan 2D,
   lalu menggambar pesepeda 3D di jalan desa dengan kamera mengikuti dari belakang.
   Jika WebGL tidak tersedia, tampilan 2D lama tetap dipakai. */
import * as THREE from '/games/_shared/three.module.min.js';

const LEN = 120;           // panjang lintasan (start z=0 → finis z=-LEN)
const LANE_W = 3.2;

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

function mat(color, opts) { return new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {})); }
function box(w, h, d, color) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color)); }

function nameSprite(text, bg) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.font = '800 30px Nunito, Fredoka, sans-serif';
  const w = Math.min(250, x.measureText(text).width + 34);
  x.fillStyle = '#1b1a3a'; x.beginPath(); x.roundRect((256 - w) / 2 + 3, 9, w, 46, 23); x.fill();
  x.fillStyle = bg; x.beginPath(); x.roundRect((256 - w) / 2, 6, w, 46, 23); x.fill();
  x.lineWidth = 4; x.strokeStyle = '#1b1a3a'; x.stroke();
  x.fillStyle = '#1b1a3a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.scale.set(2.6, 0.65, 1); s.renderOrder = 10;
  return s;
}

function makeRider(color) {
  const g = new THREE.Group();
  const ink = 0x1b1a3a;
  // sepeda
  const wheelGeo = new THREE.TorusGeometry(0.42, 0.08, 8, 18);
  const wheels = [];
  [-0.7, 0.7].forEach((z) => {
    const w = new THREE.Mesh(wheelGeo, mat(0x2b2a40)); w.rotation.y = Math.PI / 2; w.position.set(0, 0.45, z); g.add(w); wheels.push(w);
    const hub = box(0.08, 0.08, 0.08, 0xdddddd); hub.position.set(0, 0.45, z); g.add(hub);
  });
  const frame = box(0.12, 0.12, 1.3, color); frame.position.set(0, 0.8, 0); g.add(frame);
  const down = box(0.1, 0.5, 0.1, color); down.position.set(0, 0.62, 0.05); g.add(down);
  const fork = box(0.1, 0.55, 0.1, 0x555566); fork.position.set(0, 0.7, -0.68); g.add(fork);
  const bar = box(0.7, 0.08, 0.08, ink); bar.position.set(0, 1.02, -0.6); g.add(bar);
  const seat = box(0.22, 0.08, 0.32, ink); seat.position.set(0, 1.0, 0.35); g.add(seat);
  // anak (seragam merah putih)
  const body = new THREE.Group(); body.position.set(0, 1.05, 0.25); g.add(body);
  const shirt = box(0.55, 0.6, 0.38, 0xffffff); shirt.position.set(0, 0.38, -0.08); shirt.rotation.x = -0.35; body.add(shirt);
  const shorts = box(0.5, 0.22, 0.42, 0xd62839); shorts.position.set(0, 0.02, 0); body.add(shorts);
  const head = box(0.42, 0.42, 0.42, 0xf2c49b); head.position.set(0, 0.86, -0.32); body.add(head);
  const helm = box(0.48, 0.2, 0.5, color); helm.position.set(0, 1.12, -0.32); body.add(helm);
  const bag = box(0.42, 0.42, 0.18, color); bag.position.set(0, 0.42, 0.22); bag.rotation.x = -0.35; body.add(bag);
  const armL = box(0.12, 0.12, 0.6, 0xf2c49b); armL.position.set(-0.3, 0.42, -0.45); armL.rotation.x = 0.5; body.add(armL);
  const armR = armL.clone(); armR.position.x = 0.3; body.add(armR);
  const legs = [];
  [-0.16, 0.16].forEach((x) => { const l = box(0.14, 0.5, 0.14, 0xf2c49b); l.position.set(x, -0.25, -0.1); body.add(l); legs.push(l); });
  // garis tepi gelap tipis memberi kesan kartun
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(1.7);
  return { group: g, wheels, legs, body };
}

function tree(x, z, s) {
  const g = new THREE.Group();
  const trunk = box(0.35 * s, 1.2 * s, 0.35 * s, 0x8a5a3b); trunk.position.y = 0.6 * s; g.add(trunk);
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.1 * s, 2.2 * s, 7), mat(0x2fae5a)); leaf.position.y = 2.1 * s; g.add(leaf);
  const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.85 * s, 1.6 * s, 7), mat(0x45c46b)); leaf2.position.y = 2.9 * s; g.add(leaf2);
  g.position.set(x, 0, z); return g;
}
function house(x, z, roof) {
  const g = new THREE.Group();
  const w = box(2.6, 1.8, 2.2, 0xfff6dc); w.position.y = 0.9; g.add(w);
  const r = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.3, 4), mat(roof)); r.position.y = 2.45; r.rotation.y = Math.PI / 4; g.add(r);
  const d = box(0.6, 1.0, 0.05, 0x4aa8ff); d.position.set(0, 0.5, 1.11); g.add(d);
  g.position.set(x, 0, z); g.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2; return g;
}
function school() {
  const g = new THREE.Group();
  const b = box(9, 3.2, 3, 0xfff6dc); b.position.y = 1.6; g.add(b);
  const r = box(9.6, 0.5, 3.6, 0xff7a1a); r.position.y = 3.45; g.add(r);
  for (let i = -3; i <= 3; i += 2) { const w = box(1, 0.9, 0.05, 0x9fd8ff); w.position.set(i, 2, 1.52); g.add(w); }
  const door = box(1.3, 1.8, 0.05, 0x4aa8ff); door.position.set(0, 0.9, 1.52); g.add(door);
  // papan nama & bendera merah putih
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#1b1a3a'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#ffd23f'; x.font = '900 40px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SD MAIN-YUK', 128, 34);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); sign.position.set(0, 4.3, 1.4); g.add(sign);
  const pole = box(0.1, 5, 0.1, 0xdddddd); pole.position.set(5.5, 2.5, 2); g.add(pole);
  const red = box(1.4, 0.45, 0.04, 0xe63946); red.position.set(6.2, 4.75, 2); g.add(red);
  const white = box(1.4, 0.45, 0.04, 0xffffff); white.position.set(6.2, 4.3, 2); g.add(white);
  g.flag = [red, white];
  return g;
}

export function mount(sceneEl) {
  if (!hasWebGL() || !sceneEl) return null;
  sceneEl.classList.add('is3d');
  const canvas = document.createElement('canvas'); canvas.className = 'g3d';
  sceneEl.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fdcff);
  scene.fog = new THREE.Fog(0xc9ecff, 40, 140);
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6ab84f, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(12, 25, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 80 });
  scene.add(sun); scene.add(sun.target);

  // tanah, jalan, marka
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(0x5cc95c)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(LANE_W * 4 + 1.2, LEN + 40), mat(0x5c5f73)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, -LEN / 2 + 5); road.receiveShadow = true; scene.add(road);
  const edgeMat = mat(0xffffff);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.25, LEN + 40), edgeMat); e.rotation.x = -Math.PI / 2; e.position.set(s * (LANE_W * 2 + 0.45), 0.02, -LEN / 2 + 5); scene.add(e); });
  for (let l = -1; l <= 1; l++) for (let z = 8; z > -LEN - 15; z -= 4) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.8), edgeMat); d.rotation.x = -Math.PI / 2; d.position.set(l * LANE_W, 0.02, z); scene.add(d); }
  // garis start & finis kotak-kotak
  const cc = document.createElement('canvas'); cc.width = 64; cc.height = 16; const cx = cc.getContext('2d');
  for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { cx.fillStyle = (i + j) % 2 ? '#1b1a3a' : '#ffffff'; cx.fillRect(i * 4, j * 4, 4, 4); }
  const chk = new THREE.CanvasTexture(cc); chk.magFilter = THREE.NearestFilter;
  const finish = new THREE.Mesh(new THREE.PlaneGeometry(LANE_W * 4 + 1.2, 1.2), new THREE.MeshBasicMaterial({ map: chk })); finish.rotation.x = -Math.PI / 2; finish.position.set(0, 0.03, -LEN); scene.add(finish);
  const arch = new THREE.Group();
  [-1, 1].forEach((s) => { const p = box(0.35, 4.2, 0.35, 0xff5d8f); p.position.set(s * (LANE_W * 2 + 1.2), 2.1, -LEN); arch.add(p); });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(LANE_W * 4 + 2.8, 0.9, 0.2), mat(0xffd23f)); banner.position.set(0, 4.1, -LEN); arch.add(banner);
  scene.add(arch);
  const sch = school(); sch.position.set(0, 0, -LEN - 10); scene.add(sch);

  // dekorasi tepi jalan (acak tetap)
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const roofs = [0xff5d8f, 0x4aa8ff, 0x2ec4b6, 0xff7a1a, 0xb79cff];
  for (let z = 6; z > -LEN - 5; z -= 6) {
    [-1, 1].forEach((s) => {
      const off = LANE_W * 2 + 5 + rnd() * 6;
      if (rnd() < 0.28) scene.add(house(s * (off + 2), z + rnd() * 2, roofs[Math.floor(rnd() * roofs.length)]));
      else scene.add(tree(s * off, z + rnd() * 3, 0.8 + rnd() * 0.6));
      if (rnd() < 0.5) scene.add(tree(s * (off + 7 + rnd() * 6), z + rnd() * 3, 1 + rnd() * 0.8));
    });
  }
  // gunung & awan di kejauhan
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(14 + rnd() * 10, 18 + rnd() * 14, 6), mat(i % 2 ? 0x7fb6d8 : 0x93c5e3));
    m.position.set(-90 + i * 22 + rnd() * 8, 8, -LEN - 70 - rnd() * 30); scene.add(m);
  }
  const clouds = [];
  for (let i = 0; i < 10; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1.6 + rnd(), 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); b.position.set(k * 1.8, rnd() * 0.6, 0); c.add(b); }
    c.position.set(-60 + rnd() * 120, 18 + rnd() * 10, -20 - rnd() * 140); scene.add(c); clouds.push(c);
  }

  // pesepeda: dibuat sesuai elemen .bike di DOM
  const riders = new Map();
  function sync() {
    const bikes = sceneEl.querySelectorAll('.rlane .bike');
    const n = bikes.length;
    bikes.forEach((el, i) => {
      let r = riders.get(el);
      if (!r) {
        const color = new THREE.Color(getComputedStyle(el).getPropertyValue('--c').trim() || '#ff7675');
        r = makeRider(color); r.z = 0; r.tilt = 0;
        r.label = nameSprite(el.querySelector('.tag')?.textContent || '', '#' + color.getHexString());
        r.label.position.set(0, 2.2, 0); r.group.add(r.label); r.text = el.querySelector('.tag')?.textContent;
        scene.add(r.group); riders.set(el, r);
      }
      const t = el.querySelector('.tag')?.textContent || '';
      if (t !== r.text) { r.group.remove(r.label); r.label = nameSprite(t, '#' + new THREE.Color(getComputedStyle(el).getPropertyValue('--c').trim()).getHexString()); r.label.position.set(0, 2.2, 0); r.group.add(r.label); r.text = t; }
      r.visible = el.style.visibility !== 'hidden';
      r.group.visible = r.visible;
      r.lane = (i - (n - 1) / 2) * LANE_W;
      const left = parseFloat(el.style.left) || 2;
      r.target = -Math.max(0, Math.min(1, (left - 2) / 76)) * LEN;
      r.wob = el.classList.contains('wob');
    });
    riders.forEach((r, el) => { if (!el.isConnected) { scene.remove(r.group); riders.delete(el); } });
  }

  function resize() {
    const w = sceneEl.clientWidth, h = sceneEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(sceneEl); resize();

  let last = performance.now(), camZ = 8, alive = true, t0 = last;
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    sync();
    let cnt = 0, lead = 0, back = -1e9;
    riders.forEach((r) => {
      const before = r.z;
      r.z += (r.target - r.z) * Math.min(1, dt * 3.2);
      const moved = Math.abs(r.z - before);
      r.group.position.set(r.lane, 0, r.z);
      r.wheels.forEach((w) => { w.rotation.x -= moved * 2.2 + dt * 0.4; });
      r.legs[0].rotation.x = Math.sin(now / 90) * (moved > 0.002 ? 0.7 : 0.1);
      r.legs[1].rotation.x = -r.legs[0].rotation.x;
      r.tilt += ((r.wob ? Math.sin(now / 50) * 0.35 : 0) - r.tilt) * Math.min(1, dt * 8);
      r.group.rotation.z = r.tilt;
      r.body.position.y = 1.05 + Math.abs(Math.sin(now / 90)) * (moved > 0.002 ? 0.05 : 0);
      if (r.visible) { cnt++; lead = Math.min(lead, r.z); back = Math.max(back, r.z); }
    });
    // jarak antar pemain dirapatkan secara visual (seperti game balap) agar semua tetap besar di layar
    if (!cnt) { lead = 0; back = 0; }
    const center = (back + lead) / 2, K = 0.3;
    let vLead = 0, vBack = 0;
    riders.forEach((r) => {
      const vz = center + (r.z - center) * K;
      r.group.position.z = vz;
      if (r.visible) { vLead = Math.min(vLead, vz - center); vBack = Math.max(vBack, vz - center); }
    });
    const dist = (sceneEl.clientHeight < 240 ? 6 : 9) + (vBack - vLead) * 0.7; // layar pendek (HP): kamera lebih dekat
    camZ += (center + vBack + dist - camZ) * Math.min(1, dt * 2);
    cam.position.set(0, 3.6 + dist * 0.28, camZ);
    cam.lookAt(0, 1.6, camZ - dist - 8);
    sun.position.set(12, 25, camZ + 10); sun.target.position.set(0, 0, camZ - 10);
    clouds.forEach((c, i) => { c.position.x += dt * (0.6 + (i % 3) * 0.3); if (c.position.x > 70) c.position.x = -70; });
    const wave = Math.sin((now - t0) / 300) * 0.15; sch.flag.forEach((f) => { f.rotation.y = wave; });
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { destroy() { alive = false; ro.disconnect(); renderer.dispose(); canvas.remove(); } };
}
