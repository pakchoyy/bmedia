/* Main-yuk · Tombol header di semua game: 🏠 Beranda (kiri) dan ☰ Menu (kanan, dekat ✖).
   Menekan ☰ menjeda game, lalu membuka menu Main-yuk; "Lanjut main" melanjutkan. */
(function () {
  'use strict';
  if (window.parent === window) return;
  var post = function (m) { try { parent.postMessage({ mainyuk: m }, location.origin); } catch (e) {} };
  post('menu-in-header');
  // ulangi beberapa kali: pembungkus Main-yuk bisa siap lebih lambat dari game
  var n = 0, tk = setInterval(function () { post('menu-in-header'); if (++n > 20) clearInterval(tk); }, 700);

  // ---- jeda universal: tahan rAF & timer saat menu terbuka ----
  var paused = false, held = [], ownPause = null;
  var rAF = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) { return rAF(function (t) { if (paused) held.push(cb); else cb(t); }); };
  var sI = window.setInterval.bind(window), sT = window.setTimeout.bind(window);
  window.setInterval = function (fn, ms) { var a = [].slice.call(arguments, 2); return sI(function () { if (!paused && typeof fn === 'function') fn.apply(null, a); }, ms); };
  window.setTimeout = function (fn, ms) { var a = [].slice.call(arguments, 2); var run = function () { if (paused) { sT(run, 120); return; } if (typeof fn === 'function') fn.apply(null, a); }; return sT(run, ms); };
  function pause() {
    var own = document.getElementById('btn-pause'); // game dengan tombol jeda sendiri (Tangkap Kupu)
    if (own) { var ov = document.getElementById('modal-pause'); if (!(ov && ov.classList.contains('visible'))) { own.click(); ownPause = own; } return; }
    paused = true; try { if (window.Sfx) Sfx.music(false); } catch (e) {}
  }
  function resume() {
    if (ownPause) { var r = document.getElementById('btn-resume'); if (r) r.click(); ownPause = null; return; }
    if (!paused) return; paused = false;
    var q = held; held = []; q.forEach(function (cb) { rAF(cb); });
  }
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var d = e.data || {}; if (d.mainyuk === 'resume') resume();
  });

  var css = document.createElement('style');
  css.textContent = '.my-hb{flex:none;width:40px;height:40px;min-width:40px;border-radius:12px;border:2px solid #1b1a3a;box-shadow:2px 2px 0 #1b1a3a;color:#1b1a3a;font:900 19px/1 Nunito,sans-serif;cursor:pointer;display:inline-grid;place-items:center;pointer-events:auto;position:relative;z-index:5}' +
    '#bExit{background:#ff5d5d !important;color:#fff !important}.my-menu{background:#ffd23f;margin:0 4px}'+'.my-home{background:#fff;margin-right:4px}' +
    '.my-hb:active{transform:translate(2px,2px);box-shadow:none}' +
    '.my-float{position:fixed;top:8px;z-index:9000}.my-menu.my-float{right:8px}.my-home.my-float{left:8px}';
  document.head.appendChild(css);
  var SEL = ['.topbar', '.hud-top', '.hud', '.tt-tools'];
  function mk(kind) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'my-hb ' + (kind === 'menu' ? 'my-menu' : 'my-home');
    b.setAttribute('aria-label', kind === 'menu' ? 'Jeda dan menu' : 'Beranda Main-yuk'); b.textContent = kind === 'menu' ? '☰' : '🏠';
    b.addEventListener('click', function (e) { e.stopPropagation(); if (kind === 'menu') { pause(); post('open-menu'); } else post('home'); });
    return b;
  }
  function visible(el) { return el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; }
  var fl = null;
  function place() {
    var host = null;
    for (var i = 0; i < SEL.length && !host; i++) { var list = document.querySelectorAll(SEL[i]); for (var k = 0; k < list.length; k++) if (visible(list[k])) { host = list[k]; break; } }
    if (host) {
      var groups = host.querySelectorAll(':scope > .hud-group'); // Tangkap Kupu: tombol masuk ke grup kiri & kanan
      var L = groups.length ? groups[0] : host, R = groups.length ? groups[groups.length - 1] : host;
      if (!L.querySelector(':scope > .my-home')) L.insertBefore(mk('home'), L.firstChild);
      if (!document.querySelector('.my-menu:not(.my-float)')) { var x = document.getElementById('bExit'); if (x && host.contains(x)) x.parentNode.insertBefore(mk('menu'), x); else R.appendChild(mk('menu')); }
      if (fl) fl.forEach(function (b) { b.style.display = 'none'; });
    } else {
      if (!fl) { fl = [mk('home'), mk('menu')]; fl.forEach(function (b) { b.classList.add('my-float'); document.body.appendChild(b); }); }
      fl.forEach(function (b) { b.style.display = ''; });
    }
  }
  var t = 0; new MutationObserver(function () { clearTimeout(t); t = sT(place, 80); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
})();
