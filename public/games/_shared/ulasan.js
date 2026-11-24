/* Main-yuk · Ulasan singkat setelah main (tidak wajib). Muncul saat layar hasil tampil,
   paling sering sekali per game per hari. Terkirim ke /api/usulan sebagai jenis "Ulasan". */
(function () {
  'use strict';
  var IDS = ['result', 'over', 'modal-gameover'];
  var game = (document.title || 'Game').split('·')[0].trim();
  var key = 'bgy_ulas_' + location.pathname + '_' + new Date().toISOString().slice(0, 10);
  function done() { try { return localStorage.getItem(key) === '1'; } catch (e) { return false; } }
  function mark() { try { localStorage.setItem(key, '1'); } catch (e) {} }
  var css = document.createElement('style');
  css.textContent = '.ul-card{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:99980;width:min(94vw,380px);background:#fff;border:3px solid #1b1a3a;box-shadow:5px 5px 0 #1b1a3a;border-radius:20px;padding:12px 14px;font-family:Nunito,sans-serif;color:#1b1a3a;animation:ulIn .25s ease}' +
    '@keyframes ulIn{from{opacity:0;transform:translate(-50%,20px)}}' +
    '.ul-card b{font-size:16px;font-weight:900;display:block;padding-right:34px}.ul-x{position:absolute;right:8px;top:8px;width:36px;height:36px;border-radius:50%;border:2px solid #1b1a3a;background:#fff;font:900 15px Nunito,sans-serif;cursor:pointer}' +
    '.ul-stars{display:flex;gap:4px;margin:8px 0}.ul-stars button{flex:1;min-height:44px;font-size:28px;line-height:1;background:none;border:0;cursor:pointer;filter:grayscale(1);opacity:.45}.ul-stars button.on{filter:none;opacity:1}' +
    '.ul-card textarea{width:100%;min-height:54px;border:2px solid #1b1a3a;border-radius:12px;padding:6px 10px;font:700 14px Nunito,sans-serif;resize:none}' +
    '.ul-send{margin-top:8px;width:100%;min-height:44px;border:2px solid #1b1a3a;box-shadow:2px 2px 0 #1b1a3a;border-radius:12px;background:#ffd23f;font:900 15px Nunito,sans-serif;cursor:pointer}.ul-send:disabled{opacity:.5}';
  document.head.appendChild(css);
  var shown = false;
  function show() {
    if (shown || done()) return; shown = true;
    var c = document.createElement('div'); c.className = 'ul-card'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Beri ulasan');
    c.innerHTML = '<button class="ul-x" aria-label="Tutup">✕</button><b>Suka main game ini?</b><div class="ul-stars"></div><textarea maxlength="300" placeholder="Ceritakan singkat (boleh kosong)"></textarea><button class="ul-send" disabled>Kirim ulasan</button>';
    var rating = 0, st = c.querySelector('.ul-stars'), send = c.querySelector('.ul-send');
    for (var i = 1; i <= 5; i++) (function (n) { var b = document.createElement('button'); b.type = 'button'; b.textContent = '⭐'; b.setAttribute('aria-label', n + ' bintang'); b.onclick = function () { rating = n; [].forEach.call(st.children, function (x, k) { x.classList.toggle('on', k < n); }); send.disabled = false; }; st.appendChild(b); })(i);
    c.querySelector('.ul-x').onclick = function () { mark(); c.remove(); };
    send.onclick = function () {
      var t = c.querySelector('textarea').value.trim();
      var nama = ''; try { nama = localStorage.getItem('bgy_name') || localStorage.getItem('bgy_player_name') || ''; } catch (e) {}
      send.disabled = true; send.textContent = 'Mengirim...';
      fetch('/api/usulan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jenis: 'Ulasan', rating: rating, nama: nama.slice(0, 60), peran: 'Murid', pesan: '[' + game + '] ' + (t || '⭐'.repeat(rating)) }) })
        .then(function (r) { if (!r.ok) throw 0; mark(); c.innerHTML = '<b style="padding:6px 0">Terima kasih! 💛</b>'; setTimeout(function () { c.remove(); }, 1600); })
        .catch(function () { send.disabled = false; send.textContent = 'Gagal, coba lagi'; });
    };
    document.body.appendChild(c);
  }
  function vis(el) { if (el && el.classList.contains('modal-overlay')) return el.classList.contains('visible'); return el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden' && !el.classList.contains('hidden'); }
  new MutationObserver(function () {
    if (shown) return;
    for (var i = 0; i < IDS.length; i++) { var el = document.getElementById(IDS[i]); if (vis(el)) { setTimeout(show, 1800); return; } }
  }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
})();
