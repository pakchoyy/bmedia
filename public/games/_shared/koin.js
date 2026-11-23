/* Main-yuk · Koin bersama semua game (disimpan di perangkat, localStorage).
   Koin.get()  Koin.add(n, label)  Koin.spend(n) -> bool  Koin.owned(id) / Koin.own(id)
   Koin dipakai di toko kosmetik (mis. aksesori karakter Gowes). */
(function (global) {
  'use strict';
  var K = 'bgy_koin', O = 'bgy_owned';
  function get() { try { return Math.max(0, parseInt(localStorage.getItem(K), 10) || 0); } catch (e) { return 0; } }
  function set(v) { try { localStorage.setItem(K, String(Math.max(0, Math.round(v)))); } catch (e) {} }
  function owned() { try { return JSON.parse(localStorage.getItem(O) || '[]'); } catch (e) { return []; } }
  var css = document.createElement('style');
  css.textContent = '.koin-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:10000;background:#ffd23f;border:3px solid #1b1a3a;box-shadow:4px 4px 0 #1b1a3a;border-radius:99px;padding:6px 16px;font:900 18px Fredoka,Nunito,sans-serif;color:#1b1a3a;animation:koinIn 2.6s forwards;pointer-events:none;white-space:nowrap}' +
    '@keyframes koinIn{0%{opacity:0;transform:translate(-50%,-30px) scale(.7)}12%{opacity:1;transform:translate(-50%,0) scale(1.08)}20%{transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-20px)}}';
  document.head.appendChild(css);
  global.Koin = {
    get: get,
    add: function (n, label) {
      n = Math.max(0, Math.round(n)); if (!n) return 0;
      set(get() + n);
      var t = document.createElement('div'); t.className = 'koin-toast'; t.textContent = '🪙 +' + n + ' koin' + (label ? ' · ' + label : '') + ' (total ' + get() + ')';
      document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2700);
      if (global.Sfx && Sfx.coin) Sfx.coin();
      return n;
    },
    spend: function (n) { if (get() < n) return false; set(get() - n); return true; },
    owned: function (id) { return owned().indexOf(id) >= 0; },
    own: function (id) { var o = owned(); if (o.indexOf(id) < 0) { o.push(id); try { localStorage.setItem(O, JSON.stringify(o)); } catch (e) {} } }
  };
})(window);
