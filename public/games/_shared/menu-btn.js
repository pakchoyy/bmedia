/* Main-yuk · Tombol ☰ menu Main-yuk di header game (bukan melayang di atas area main).
   Mengirim pesan ke pembungkus GameFrame; hanya aktif saat game dibuka di dalam Main-yuk. */
(function () {
  'use strict';
  if (window.parent === window) return;
  var post = function (m) { try { parent.postMessage({ mainyuk: m }, location.origin); } catch (e) {} };
  post('menu-in-header');
  var css = document.createElement('style');
  css.textContent = '.my-menu{flex:none;width:40px;height:40px;min-width:40px;border-radius:12px;border:2px solid #1b1a3a;box-shadow:2px 2px 0 #1b1a3a;background:#ffd23f;color:#1b1a3a;font:900 20px/1 Nunito,sans-serif;cursor:pointer;display:inline-grid;place-items:center;pointer-events:auto;margin-right:4px}' +
    '.my-menu:active{transform:translate(2px,2px);box-shadow:none}' +
    '.my-menu.float{position:fixed;left:8px;top:8px;z-index:9000}';
  document.head.appendChild(css);
  var SEL = ['.topbar', '.hud-top', '.hud', '.tt-tools'];
  function mk(cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'my-menu' + (cls ? ' ' + cls : ''); b.setAttribute('aria-label', 'Menu Main-yuk'); b.textContent = '☰'; b.addEventListener('click', function (e) { e.stopPropagation(); post('open-menu'); }); return b; }
  function visible(el) { return el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; }
  var floatBtn = null;
  function place() {
    var host = null;
    for (var i = 0; i < SEL.length && !host; i++) { var list = document.querySelectorAll(SEL[i]); for (var k = 0; k < list.length; k++) if (visible(list[k])) { host = list[k]; break; } }
    if (host) {
      if (!host.querySelector(':scope > .my-menu')) host.insertBefore(mk(), host.firstChild);
      if (floatBtn) floatBtn.style.display = 'none';
    } else {
      if (!floatBtn) { floatBtn = mk('float'); document.body.appendChild(floatBtn); }
      floatBtn.style.display = '';
    }
  }
  var t = 0; new MutationObserver(function () { clearTimeout(t); t = setTimeout(place, 60); }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
})();
