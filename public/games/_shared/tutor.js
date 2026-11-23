/* Main-yuk · Tutorial maskot bertahap + petunjuk dalam game + tombol Cara main & Suara.
   Tutor.init(id, steps:[{sel, text}], {inGame}) ; Tutor.hint() saat mulai main ; Tutor.done() saat jawaban pertama. */
(function (global) {
  'use strict';
  var css = document.createElement('style');
  css.textContent =
    '.tt-ov{position:fixed;inset:0;z-index:9500;pointer-events:auto}' +
    '.tt-hole{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(18,15,46,.66);border:3px dashed #ffd23f;transition:all .3s ease;pointer-events:none}' +
    '.tt-box{position:fixed;left:50%;transform:translateX(-50%);width:min(92vw,440px);display:flex;gap:10px;align-items:flex-end;transition:top .3s ease}' +
    '.tt-box img{width:86px;flex:none;filter:drop-shadow(3px 3px 0 rgba(27,26,58,.35));animation:ttBob 1.6s ease-in-out infinite}' +
    '@keyframes ttBob{50%{transform:translateY(-5px)}}' +
    '.tt-bub{flex:1;background:#fff;border:3px solid #1b1a3a;box-shadow:5px 5px 0 #1b1a3a;border-radius:18px;padding:10px 12px;font:800 15px/1.35 Nunito,sans-serif;color:#1b1a3a}' +
    '.tt-bub .st{font-size:11px;opacity:.6;font-weight:900;letter-spacing:.5px}' +
    '.tt-bub .bt{display:flex;gap:6px;margin-top:8px;justify-content:flex-end}' +
    '.tt-bub button{font:900 14px Nunito,sans-serif;border:2px solid #1b1a3a;border-radius:10px;padding:5px 12px;cursor:pointer;background:#fff;color:#1b1a3a}' +
    '.tt-bub button.go{background:#22c55e;box-shadow:2px 2px 0 #1b1a3a}' +
    '.tt-tools{position:absolute;top:10px;left:12px;display:flex;gap:6px;z-index:3}' +
    '.tt-tools button{font:900 12px Nunito,sans-serif;border:2px solid #1b1a3a;border-radius:99px;padding:4px 10px;background:#fff;color:#1b1a3a;box-shadow:2px 2px 0 #1b1a3a;cursor:pointer}' +
    '.tt-tools button.on{background:#ffd23f}' +
    '.tt-hint{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9400;display:flex;align-items:center;gap:8px;background:#fff;border:3px solid #1b1a3a;box-shadow:4px 4px 0 #1b1a3a;border-radius:16px;padding:6px 12px 6px 6px;font:800 14px Nunito,sans-serif;color:#1b1a3a;max-width:92vw;animation:ttIn .4s ease}' +
    '.tt-hint img{width:46px}@keyframes ttIn{from{opacity:0;transform:translate(-50%,20px)}}' +
    '@media (prefers-reduced-motion:reduce){.tt-box img,.tt-hint{animation:none}.tt-hole,.tt-box{transition:none}}';
  document.head.appendChild(css);

  var cfg = null, idx = 0, ov = null, hintEl = null;
  function seen() { try { return localStorage.getItem('bgy_tut_' + cfg.id) === '1'; } catch (e) { return false; } }
  function mark() { try { localStorage.setItem('bgy_tut_' + cfg.id, '1'); } catch (e) {} }
  function close() { if (ov) ov.remove(); ov = null; mark(); if (global.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} }

  function show() {
    var s = cfg.steps[idx]; if (!s) return close();
    var el = s.sel ? document.querySelector(s.sel) : null;
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(function () {
      var r = el && el.offsetParent !== null ? el.getBoundingClientRect() : null, hole = ov.querySelector('.tt-hole'), box = ov.querySelector('.tt-box');
      if (r) { hole.style.cssText = 'left:' + (r.left - 6) + 'px;top:' + (r.top - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px'; }
      else hole.style.cssText = 'left:50%;top:50%;width:0;height:0';
      var below = r ? r.bottom + 14 : innerHeight * .35, h = box.offsetHeight || 140;
      box.style.top = (r && below + h > innerHeight - 8 ? Math.max(8, r.top - h - 14) : below) + 'px';
      ov.querySelector('.tt-txt').textContent = s.text;
      ov.querySelector('.st').textContent = 'LANGKAH ' + (idx + 1) + ' DARI ' + cfg.steps.length;
      ov.querySelector('.go').textContent = idx === cfg.steps.length - 1 ? 'Ayo main! ▶' : 'Lanjut ▶';
      if (global.Suara) Suara.read(s.text);
    }, el ? 260 : 0);
  }
  function run() {
    idx = 0; if (ov) ov.remove();
    ov = document.createElement('div'); ov.className = 'tt-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Panduan cara main');
    ov.innerHTML = '<div class="tt-hole"></div><div class="tt-box"><img src="/maskot/halo.webp" alt=""><div class="tt-bub"><div class="st"></div><div class="tt-txt" aria-live="polite"></div><div class="bt"><button type="button" class="skip">Lewati</button><button type="button" class="go">Lanjut ▶</button></div></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('.skip').onclick = close;
    ov.querySelector('.go').onclick = function () { idx++; if (idx >= cfg.steps.length) close(); else show(); };
    show();
  }
  function tools() {
    var card = document.querySelector('#menu .card'); if (!card || card.querySelector('.tt-tools')) return;
    var t = document.createElement('div'); t.className = 'tt-tools';
    t.innerHTML = '<button type="button" class="help">❓ Cara main</button>' + (global.Suara && Suara.supported ? '<button type="button" class="tts" aria-pressed="false">🗣️ Suara</button>' : '');
    card.appendChild(t);
    t.querySelector('.help').onclick = run;
    var b = t.querySelector('.tts');
    if (b) { var sync = function () { var on = Suara.enabled(); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '🗣️ Suara: Nyala' : '🗣️ Suara'; }; sync(); b.onclick = function () { Suara.toggle(); sync(); }; }
  }

  global.Tutor = {
    init: function (id, steps, opt) {
      cfg = { id: id, steps: steps, inGame: opt && opt.inGame };
      var go = function () {
        tools();
        var force = /[?&]tutor=1/.test(location.search), room = /[?&]room=/.test(location.search);
        var menu = document.getElementById('menu');
        if (!room && menu && !menu.classList.contains('hidden') && (force || !seen())) setTimeout(run, 500);
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    },
    run: run,
    hint: function () {
      if (!cfg || !cfg.inGame) return;
      try { if (localStorage.getItem('bgy_hint_' + cfg.id) === '1') return; } catch (e) {}
      if (hintEl) hintEl.remove();
      hintEl = document.createElement('div'); hintEl.className = 'tt-hint';
      hintEl.innerHTML = '<img src="/maskot/halo.webp" alt=""><span></span>'; hintEl.querySelector('span').textContent = cfg.inGame;
      document.body.appendChild(hintEl);
      var h = hintEl; setTimeout(function () { if (h === hintEl) Tutor.done(); }, 9000);
    },
    done: function () { if (hintEl) { hintEl.remove(); hintEl = null; try { localStorage.setItem('bgy_hint_' + cfg.id, '1'); } catch (e) {} } }
  };
})(window);
