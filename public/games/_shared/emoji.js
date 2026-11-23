/* Main-yuk · Emoji seragam di semua perangkat: ganti emoji teks dengan gambar Twemoji (CC-BY 4.0).
   Dimuat setelah twemoji.min.js. Mengamati perubahan isi halaman agar emoji baru ikut diganti. */
(function () {
  'use strict';
  if (!window.twemoji) return;
  var OPT = { folder: 'svg', ext: '.svg', base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/' };
  var css = document.createElement('style');
  css.textContent = 'img.emoji{height:1em;width:1em;margin:0 .05em;vertical-align:-.12em;display:inline-block;pointer-events:none}';
  document.head.appendChild(css);
  var busy = false;
  function run(node) { busy = true; try { twemoji.parse(node || document.body, OPT); } catch (e) {} busy = false; }
  run();
  new MutationObserver(function (list) {
    if (busy) return;
    list.forEach(function (m) {
      if (m.type === 'characterData' && m.target.parentNode) run(m.target.parentNode);
      m.addedNodes && m.addedNodes.forEach(function (n) { if (n.nodeType === 1) run(n); else if (n.nodeType === 3 && n.parentNode) run(n.parentNode); });
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
