/* Main-yuk · Generator soal matematika bersama (Gowes ke Sekolah, Balon Pecah).
   MathGen.MODES  : daftar mode {id, label, icon}
   MathGen.make(modeId, level 1..3) -> { q, o:[4 teks], a: indeks benar } */
(function (global) {
  'use strict';
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[rnd(0, arr.length - 1)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }

  // Pengecoh angka yang masuk akal (tidak negatif, unik)
  function numOptions(ans, step) {
    step = step || Math.max(1, Math.round(Math.abs(ans) * 0.1));
    var cand = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + step, ans - step, ans + 2 * step, ans * 2, Math.round(ans / 2)];
    var out = [ans];
    shuffle(cand).forEach(function (c) { if (out.length < 4 && c >= 0 && out.indexOf(c) < 0) out.push(c); });
    var k = 3; while (out.length < 4) { if (out.indexOf(ans + k) < 0) out.push(ans + k); k++; }
    return out;
  }
  function pack(q, ans, opts, fmt) {
    fmt = fmt || String;
    var o = shuffle(opts.slice());
    return { q: q, o: o.map(fmt), a: o.indexOf(ans) };
  }
  function num(q, ans, step) { return pack(q, ans, numOptions(ans, step)); }

  var R = { // rentang angka per tingkat
    1: { a: [1, 10], m: [2, 5], d: [2, 5] },
    2: { a: [10, 99], m: [2, 10], d: [2, 10] },
    3: { a: [100, 999], m: [6, 15], d: [3, 12] }
  };

  var G = {
    add: function (L) { var a = rnd.apply(0, R[L].a), b = rnd.apply(0, R[L].a); return num(a + ' + ' + b + ' = ?', a + b); },
    sub: function (L) { var a = rnd.apply(0, R[L].a), b = rnd.apply(0, R[L].a); if (b > a) { var t = a; a = b; b = t; } return num(a + ' − ' + b + ' = ?', a - b); },
    mul: function (L) { var a = rnd.apply(0, R[L].m), b = rnd(2, L === 3 ? 15 : 10); return num(a + ' × ' + b + ' = ?', a * b, a); },
    div: function (L) { var b = rnd.apply(0, R[L].d), ans = rnd.apply(0, R[L].m); return num((b * ans) + ' ÷ ' + b + ' = ?', ans); },
    mix: function (L) { return G[pick(['add', 'sub', 'mul', 'div'])](L); },
    sq: function (L) { var a = L === 1 ? rnd(1, 10) : L === 2 ? rnd(5, 20) : rnd(11, 30); return num(a + '² = ?', a * a, a); },
    cube: function (L) { var a = L === 1 ? rnd(1, 5) : L === 2 ? rnd(3, 10) : rnd(6, 15); return num(a + '³ = ?', a * a * a, a * a); },
    sqrt: function (L) { var a = L === 1 ? rnd(1, 10) : L === 2 ? rnd(5, 20) : rnd(11, 30); return num('√' + (a * a) + ' = ?', a); },
    cbrt: function (L) { var a = L === 1 ? rnd(1, 5) : L === 2 ? rnd(3, 10) : rnd(6, 15); return num('∛' + (a * a * a) + ' = ?', a); },
    mixadv: function (L) { return G[pick(['add', 'sub', 'mul', 'div', 'sq', 'sqrt'])](L); },
    add2: function (L) { var lo = L === 1 ? 10 : L === 2 ? 25 : 50; var a = rnd(lo, 99), b = rnd(lo, 99); return num(a + ' + ' + b + ' = ?', a + b); },
    sub2: function (L) { var lo = L === 1 ? 10 : L === 2 ? 25 : 50; var a = rnd(lo, 99), b = rnd(10, a); return num(a + ' − ' + b + ' = ?', a - b); },
    addsub: function (L) { return G[pick(['add', 'sub'])](L); },
    muldiv: function (L) { return G[pick(['mul', 'div'])](L); },
    pct: function (L) {
      var p = L === 1 ? pick([10, 25, 50]) : L === 2 ? pick([10, 20, 25, 50, 75]) : pick([5, 15, 30, 40, 60, 80]);
      var base = (L === 1 ? rnd(1, 10) : L === 2 ? rnd(2, 20) : rnd(2, 40)) * (100 / gcd(p, 100));
      return num(p + '% dari ' + base + ' = ?', base * p / 100);
    },
    fpb: function (L) {
      var f = L === 1 ? rnd(2, 6) : L === 2 ? rnd(3, 12) : rnd(6, 20);
      var x = rnd(2, L === 1 ? 5 : 9), y; do { y = rnd(2, L === 1 ? 5 : 9); } while (y === x || gcd(x, y) !== 1);
      return num('FPB dari ' + (f * x) + ' dan ' + (f * y) + ' = ?', f, 1);
    },
    kpk: function (L) {
      var M = L === 1 ? 10 : L === 2 ? 15 : 25, a = rnd(2, M), b; do { b = rnd(2, M); } while (b === a);
      return num('KPK dari ' + a + ' dan ' + b + ' = ?', lcm(a, b), Math.min(a, b));
    },
    time: function (L) {
      var h = rnd(1, 11), m = L === 1 ? pick([0, 30]) : L === 2 ? pick([0, 15, 30, 45]) : rnd(0, 11) * 5;
      var add = L === 1 ? rnd(1, 3) * 60 : L === 2 ? pick([30, 45, 60, 90, 120]) : rnd(2, 20) * 5;
      var t = (h * 60 + m + add) % (12 * 60), ans = t;
      function f(v) { var hh = Math.floor(v / 60) % 12 || 12, mm = v % 60; return String(hh).padStart(2, '0') + '.' + String(mm).padStart(2, '0'); }
      var opts = [ans]; [15, -15, 30, -30, 60, -60, 5, -5].forEach(function (d) { var v = (ans + d + 720) % 720; if (opts.length < 4 && opts.indexOf(v) < 0) opts.push(v); });
      var dur = add >= 60 ? (Math.floor(add / 60) + ' jam' + (add % 60 ? ' ' + (add % 60) + ' menit' : '')) : add + ' menit';
      return pack('Pukul ' + f(h * 60 + m) + ' + ' + dur + ' = ?', ans, opts, f);
    },
    dist: function (L) {
      var kinds = L === 1 ? [['km', 'm', 1000], ['m', 'cm', 100]] : L === 2 ? [['km', 'm', 1000], ['m', 'cm', 100], ['hm', 'm', 100], ['dam', 'm', 10]] : [['km', 'cm', 100000], ['km', 'dam', 100], ['hm', 'dm', 1000], ['m', 'mm', 1000]];
      var k = pick(kinds), v = L === 3 ? rnd(2, 15) : rnd(1, 9);
      return num(v + ' ' + k[0] + ' = … ' + k[1], v * k[2], k[2]);
    },
    fruit: function (L) {
      var F = ['🍎', '🍌', '🍉', '🍊', '🍇', '🍓'], f = pick(F);
      var a = rnd(1, L === 1 ? 5 : 7), b = rnd(1, L === 1 ? 4 : 6), op = L === 1 ? '+' : pick(['+', '−']);
      if (op === '−' && b > a) { var t = a; a = b; b = t; }
      return num(f.repeat(a) + ' ' + op + ' ' + f.repeat(b) + ' = ?', op === '+' ? a + b : a - b, 1);
    }
  };

  var MODES = [
    { id: 'add', label: 'Tambah', icon: '+' }, { id: 'sub', label: 'Kurang', icon: '−' }, { id: 'mul', label: 'Kali', icon: '×' }, { id: 'div', label: 'Bagi', icon: '÷' },
    { id: 'mix', label: 'Campuran', icon: '±' }, { id: 'sq', label: 'Pangkat 2', icon: 'x²' }, { id: 'cube', label: 'Pangkat 3', icon: 'x³' }, { id: 'sqrt', label: 'Akar', icon: '√' },
    { id: 'cbrt', label: 'Akar Pangkat 3', icon: '∛' }, { id: 'mixadv', label: 'Campuran Lanjut', icon: '?' }, { id: 'add2', label: '+ 2 Digit', icon: '+2' }, { id: 'sub2', label: '− 2 Digit', icon: '−2' },
    { id: 'addsub', label: 'Tambah Kurang', icon: '+−' }, { id: 'muldiv', label: 'Kali Bagi', icon: '×÷' }, { id: 'pct', label: 'Persen', icon: '%' }, { id: 'fpb', label: 'FPB', icon: 'FPB' },
    { id: 'kpk', label: 'KPK', icon: 'KPK' }, { id: 'time', label: 'Waktu', icon: '🕐' }, { id: 'dist', label: 'Jarak', icon: '📏' }, { id: 'fruit', label: 'Hitung Buah', icon: '🍉' }
  ];

  global.MathGen = {
    MODES: MODES,
    make: function (mode, level) { return (G[mode] || G.add)(Math.min(3, Math.max(1, level || 1))); },
    /** Render grid pilihan mode ke elemen; onPick(id) dipanggil saat dipilih */
    renderGrid: function (el, current, onPick) {
      el.innerHTML = '';
      MODES.forEach(function (m) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'mg-btn' + (m.id === current ? ' on' : '');
        b.innerHTML = '<span class="mg-i"></span><span class="mg-l"></span>';
        b.querySelector('.mg-i').textContent = m.icon; b.querySelector('.mg-l').textContent = m.label;
        b.setAttribute('aria-pressed', m.id === current ? 'true' : 'false');
        b.addEventListener('click', function () { [].forEach.call(el.children, function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); }); b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); onPick(m.id); });
        el.appendChild(b);
      });
    }
  };
})(window);
