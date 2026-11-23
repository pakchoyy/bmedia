/* Main-yuk · Efek meriah bersama.
   Fx.good(x, y, text)  : ledakan konfeti + teks melayang di titik (px layar)
   Fx.bad(el, x, y)     : kilat merah + guncang elemen + tanda silang
   Fx.win()             : hujan konfeti layar penuh
   Menghormati prefers-reduced-motion (efek dikurangi, tetap ada umpan balik warna). */
(function (global) {
  'use strict';
  var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#ffd23f', '#ff7a1a', '#ff5d8f', '#2ec4b6', '#4aa8ff', '#b79cff', '#8cf0b8'];
  var cv, ctx, parts = [], running = false;

  var css = document.createElement('style');
  css.textContent =
    '.fx-pop{position:fixed;z-index:9999;pointer-events:none;font:900 clamp(22px,5vh,44px)/1 ui-rounded,Nunito,system-ui,sans-serif;color:#1b1a3a;' +
    'text-shadow:3px 3px 0 #fff,-2px -2px 0 #fff;transform:translate(-50%,-50%);animation:fxUp .9s cubic-bezier(.2,1.4,.4,1) forwards}' +
    '.fx-pop.bad{color:#e63946}' +
    '@keyframes fxUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.4)}25%{opacity:1;transform:translate(-50%,-60%) scale(1.25)}100%{opacity:0;transform:translate(-50%,-160%) scale(1)}}' +
    '.fx-flash{position:fixed;inset:0;z-index:9998;pointer-events:none;animation:fxFlash .45s ease-out forwards}' +
    '@keyframes fxFlash{from{opacity:.45}to{opacity:0}}' +
    '.fx-shake{animation:fxShake .4s ease-in-out}' +
    '@keyframes fxShake{20%{transform:translateX(-10px) rotate(-1deg)}40%{transform:translateX(9px) rotate(1deg)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}' +
    '@media (prefers-reduced-motion:reduce){.fx-pop,.fx-shake{animation-duration:.01s}}';
  document.head.appendChild(css);

  function canvas() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    document.body.appendChild(cv); ctx = cv.getContext('2d');
    function size() { var r = global.devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
    size(); global.addEventListener('resize', size);
  }
  function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life > 0 && p.y < innerHeight + 40; });
    parts.forEach(function (p) {
      p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.shape === 0) ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66);
      else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.4, 0, 6.283); ctx.fill(); }
      else { ctx.beginPath(); for (var i = 0; i < 5; i++) { var a = i * 1.2566 - 1.5708; ctx.lineTo(Math.cos(a) * p.s / 1.6, Math.sin(a) * p.s / 1.6); ctx.lineTo(Math.cos(a + .628) * p.s / 3.4, Math.sin(a + .628) * p.s / 3.4); } ctx.fill(); }
      ctx.restore();
    });
    if (parts.length) requestAnimationFrame(loop); else running = false;
  }
  function burst(x, y, n, spread, power) {
    canvas();
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + (Math.random() - .5) * spread, sp = power * (.5 + Math.random());
      parts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: .32, s: 7 + Math.random() * 7, c: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 70 + Math.random() * 40, shape: i % 3 });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  function text(x, y, t, bad) {
    var d = document.createElement('div'); d.className = 'fx-pop' + (bad ? ' bad' : ''); d.textContent = t;
    d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 950);
  }
  function flash(color) {
    var f = document.createElement('div'); f.className = 'fx-flash'; f.style.background = color; document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 480);
  }

  global.Fx = {
    good: function (x, y, t) {
      if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
      if (!reduce) burst(x, y, 34, 2.4, 11);
      text(x, y, t || '✔');
      flash('radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(140,240,184,.9), transparent 55%)');
    },
    bad: function (el, x, y) {
      if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
      text(x, y, '✖', true);
      flash('rgba(255,93,143,.35)');
      if (el && !reduce) { el.classList.remove('fx-shake'); void el.offsetWidth; el.classList.add('fx-shake'); }
    },
    win: function () {
      if (reduce) { flash('rgba(255,210,63,.6)'); return; }
      var k = 0, id = setInterval(function () {
        burst(Math.random() * innerWidth, -10, 18, 1.2, 4);
        burst(innerWidth * .1, innerHeight * .9, 12, 1, 15);
        burst(innerWidth * .9, innerHeight * .9, 12, 1, 15);
        if (++k > 10) clearInterval(id);
      }, 160);
      parts.forEach(function (p) { p.g = .18; });
    },
    center: function (el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  };
})(window);
