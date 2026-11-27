/* Main-yuk · Mabar Online bersama (ruang 5 angka) untuk game Karya Admin.
   Aktif bila URL berisi ?room=&pid=&tok=. Pola sama dengan Tangkap Kupu:
   polling status → sinkron jam server → hitung mundur → main sampai endsAt → kirim skor berkala → papan akhir.
   Ruang.init({ ready(): bool, onStart(remainMs, name), getStats(): {score, caught, quizRight, quizWrong}, onEnd(), onTop(top) }) */
(function (global) {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var R = { code: Q.get('room'), pid: Q.get('pid'), tok: Q.get('tok') };
  var active = !!(R.code && /^\d{5}$/.test(R.code) && R.pid && R.tok);
  var opt = null, offset = 0, poll = 0, sendT = 0, tickT = 0, started = false, ended = false, endsAt = 0, myName = '';

  var css = document.createElement('style');
  css.textContent =
    '#ruang-ov{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(27,26,58,.82);font-family:Nunito,system-ui,sans-serif}' +
    '#ruang-ov .rc{background:#fff;border:4px solid #1b1a3a;box-shadow:9px 9px 0 #1b1a3a;border-radius:28px;padding:18px 22px;width:min(100%,460px);text-align:center;color:#1b1a3a}' +
    '#ruang-ov img.mas{width:110px;height:auto}#ruang-ov img.emoji{width:1em;height:1em}#ruang-ov h2{font:700 clamp(22px,4.5vh,32px)/1.1 Fredoka,sans-serif;margin:4px 0}' +
    '#ruang-ov .msg{font-weight:900;font-size:18px;margin-top:6px}#ruang-ov .cnt{font-weight:800;opacity:.7;margin-top:2px}' +
    '#ruang-ov .big{font:700 72px/1 Fredoka,sans-serif;color:#ff7a1a;margin-top:6px}' +
    '#ruang-ov ol{list-style:none;padding:0;margin:10px 0 0;text-align:left}#ruang-ov li{display:flex;justify-content:space-between;gap:8px;padding:6px 10px;margin-top:5px;border:2px solid #1b1a3a;border-radius:12px;font-weight:900;background:#fff6dc}#ruang-ov li.me{background:#ffd23f}' +
    '#ruang-hud{position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:9980;display:flex;gap:6px;font:800 14px Nunito,sans-serif}' +
    '#ruang-hud img.emoji{width:1em;height:1em}#ruang-hud span{background:#fff;border:2px solid #1b1a3a;box-shadow:2px 2px 0 #1b1a3a;border-radius:99px;padding:2px 12px;color:#1b1a3a;white-space:nowrap}' +
    '#ruang-hud .rank{background:#ffd23f}body.ruang-on #timer{visibility:hidden}';
  document.head.appendChild(css);

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ov = null, hud = null;
  function overlay(html) {
    if (!ov) { ov = el('<div id="ruang-ov"></div>'); document.body.appendChild(ov); }
    ov.innerHTML = '<div class="rc">' + html + '</div>'; ov.style.display = 'flex';
  }
  function hideOverlay() { if (ov) ov.style.display = 'none'; }
  function now() { return Date.now() + offset; }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  function lobby(d) {
    overlay('<img class="mas" src="/maskot/halo.webp" alt=""><h2>Mabar Online</h2><div class="msg"></div><div class="cnt"></div>');
    ov.querySelector('.msg').textContent = d.msg; ov.querySelector('.cnt').textContent = d.cnt || '';
  }
  function check() {
    fetch('/api/ruang/' + R.code + '/status?pid=' + encodeURIComponent(R.pid) + '&tok=' + encodeURIComponent(R.tok), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (started) return;
        offset = d.serverNow - Date.now();
        if (!d.me) { lobby({ msg: 'Kamu belum terdaftar di ruang ini. Masuk lagi lewat Mabar Yuk.' }); clearInterval(poll); return; }
        myName = d.me;
        var cnt = d.players + ' murid di ruang';
        if (d.status === 'lobby') { lobby({ msg: '👋 Halo, ' + d.me + '! Menunggu guru memulai…', cnt: cnt }); return; }
        if (d.status === 'finished') { lobby({ msg: 'Permainan sudah selesai.', cnt: cnt }); clearInterval(poll); return; }
        if (opt.ready && !opt.ready()) { lobby({ msg: 'Memuat soal…', cnt: cnt }); return; }
        var ms = d.startsAt - now();
        if (ms > 150) {
          overlay('<img class="mas" src="/maskot/sorak.webp" alt=""><h2>Bersiap!</h2><div class="big">' + Math.ceil(ms / 1000) + '</div><div class="cnt">' + esc(cnt) + '</div>');
          if (global.Sfx) Sfx.tick();
          return;
        }
        begin(d);
      })
      .catch(function () { if (!started) lobby({ msg: 'Menyambungkan ulang…' }); });
  }
  function begin(d) {
    started = true; clearInterval(poll); hideOverlay();
    endsAt = d.endsAt;
    document.body.classList.add('ruang-on');
    hud = el('<div id="ruang-hud">' + (opt.noTimer ? '' : '<span class="t">⏱ --:--</span>') + '<span class="rank">🏆 –</span></div>'); document.body.appendChild(hud);
    opt.onStart(endsAt - now(), myName);
    tickT = setInterval(function () {
      var left = endsAt - now();
      if (!opt.noTimer) hud.querySelector('.t').textContent = '⏱ ' + fmt(left);
      if (left <= 0) finish();
    }, 250);
    sendT = setInterval(function () { send(false); }, 2500);
  }
  function send(final) {
    var s = opt.getStats();
    return fetch('/api/ruang/' + R.code + '/skor', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ pid: R.pid, tok: R.tok, final: !!final, score: s.score, caught: s.caught, quizRight: s.quizRight, quizWrong: s.quizWrong })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && hud) hud.querySelector('.rank').textContent = '🏆 #' + d.rank + ' dari ' + d.total;
      if (d && opt.onTop) opt.onTop(d.top || []);
      if (d && d.status === 'finished' && !final && !ended) finish(); // guru menghentikan lebih awal
      return d;
    }).catch(function () { return null; });
  }
  function board(d) {
    if (!d) { overlay('<h2>Waktu habis!</h2><div class="msg">Menyimpan skor…</div>'); return; }
    var rows = (d.top || []).map(function (t, i) { return '<li class="' + (t.me ? 'me' : '') + '"><span>' + (['🥇', '🥈', '🥉'][i] || (i + 1) + '.') + ' ' + esc(t.name) + '</span><span>' + t.score + '</span></li>'; }).join('');
    overlay('<img class="mas" src="/maskot/' + (d.rank <= 3 ? 'jempol' : 'halo') + '.webp" alt=""><h2>Waktu habis!</h2>' +
      '<div class="msg">Kamu peringkat ' + d.rank + ' dari ' + d.total + ' · skor ' + d.score + '</div><ol>' + rows + '</ol>' +
      '<div class="cnt" style="margin-top:10px">' + (d.status === 'finished' ? 'Hasil sudah dikirim ke guru.' : 'Menunggu teman lain selesai…') + '</div>');
  }
  function finish() {
    if (ended) return; ended = true;
    clearInterval(tickT); clearInterval(sendT);
    if (hud) hud.remove();
    opt.onEnd();
    if (global.Sfx) { Sfx.music(false); Sfx.win(); }
    var n = 0;
    (function again() { send(true).then(function (d) { board(d); if (n++ < 4 && !(d && d.status === 'finished')) setTimeout(again, 4000); }); })();
  }

  global.Ruang = {
    active: active,
    init: function (o) {
      if (!active) return;
      opt = o; lobby({ msg: 'Menyambungkan ke ruang…' });
      check(); poll = setInterval(check, 1000);
    }
  };
})(window);
