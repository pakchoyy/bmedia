/* Main-yuk · Suara & musik bersama (Web Audio, tanpa file).
   Sfx.good() Sfx.bad() Sfx.pop() Sfx.win() Sfx.click() Sfx.tick() Sfx.go()
   Sfx.music(true|false)  : musik latar ceria (pelan)
   Sfx.muted()            : membaca pengaturan bisu bersama (localStorage bgy_muted) */
(function (global) {
  'use strict';
  var ctx = null, master = null, delay = null, musicGain = null, musicTimer = 0, musicOn = false, step = 0, nextT = 0;

  function muted() { try { return localStorage.getItem('bgy_muted') === '1'; } catch (e) { return false; } }
  function ac() {
    if (!ctx) {
      var C = global.AudioContext || global.webkitAudioContext; if (!C) return null;
      ctx = new C();
      master = ctx.createGain(); master.gain.value = .9;
      // gema ringan agar suara terasa "penuh"
      delay = ctx.createDelay(); delay.delayTime.value = .12;
      var fb = ctx.createGain(); fb.gain.value = .22; var wet = ctx.createGain(); wet.gain.value = .18;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
      master.connect(ctx.destination); master.connect(delay);
      musicGain = ctx.createGain(); musicGain.gain.value = .0; musicGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function note(freq, t, dur, type, vol, dest, slide) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), s = c.currentTime + (t || 0);
    o.type = type || 'triangle'; o.frequency.setValueAtTime(freq, s);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, s + dur);
    g.gain.setValueAtTime(.0001, s); g.gain.linearRampToValueAtTime(vol || .18, s + .012); g.gain.exponentialRampToValueAtTime(.0001, s + dur);
    o.connect(g); g.connect(dest || master); o.start(s); o.stop(s + dur + .05);
  }
  function noise(t, dur, vol, hp) {
    var c = ac(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), s = c.currentTime + (t || 0);
    f.type = 'highpass'; f.frequency.value = hp || 1200; g.gain.value = vol || .25;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(master); src.start(s);
  }
  var N = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

  var S = {
    muted: muted,
    unlock: function () { ac(); },
    click: function () { if (muted()) return; note(N(84), 0, .06, 'sine', .12); },
    tick: function () { if (muted()) return; note(N(76), 0, .08, 'square', .06); note(N(88), 0, .05, 'sine', .05); },
    go: function () { if (muted()) return; [72, 76, 79, 84].forEach(function (m, i) { note(N(m), i * .06, .25, 'triangle', .16); }); noise(.18, .25, .12, 3000); },
    good: function () {
      if (muted()) return;
      note(N(79), 0, .12, 'triangle', .2); note(N(84), .07, .14, 'triangle', .2); note(N(88), .14, .28, 'triangle', .2);
      note(N(96), .14, .3, 'sine', .07); noise(.02, .12, .07, 6000); // kilau
    },
    bad: function () {
      if (muted()) return;
      note(N(52), 0, .28, 'sawtooth', .1, null, N(40)); note(N(47), .05, .3, 'square', .06, null, N(36));
    },
    bell: function () { if (muted()) return; note(N(93), 0, .35, 'sine', .12); note(N(98), .09, .4, 'sine', .1); },
    cheer: function () { if (muted()) return; noise(0, .9, .18, 700); noise(.05, .7, .1, 2500); },
    coin: function () { if (muted()) return; note(N(88), 0, .08, 'square', .08); note(N(95), .07, .22, 'square', .08); },
    pop: function () {
      if (muted()) return;
      noise(0, .09, .45, 900); note(N(88), 0, .08, 'sine', .14, null, N(100));
    },
    win: function () {
      if (muted()) return;
      var seq = [[72, 0], [76, .12], [79, .24], [84, .36], [79, .52], [84, .64]];
      seq.forEach(function (p) { note(N(p[0]), p[1], .3, 'triangle', .2); note(N(p[0] - 12), p[1], .3, 'sine', .1); });
      [60, 64, 67, 72].forEach(function (m) { note(N(m), .8, 1.2, 'triangle', .12); });
      noise(.8, .6, .1, 4000);
    },
    /** Musik latar: progresi I–V–vi–IV dengan melodi pentatonik, volume kecil. */
    music: function (on) {
      musicOn = !!on;
      var c = ac(); if (!c) return;
      clearInterval(musicTimer);
      musicGain.gain.cancelScheduledValues(c.currentTime);
      musicGain.gain.linearRampToValueAtTime(musicOn && !muted() ? .07 : 0, c.currentTime + .4);
      if (!musicOn) return;
      var chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], penta = [72, 74, 76, 79, 81, 84];
      nextT = c.currentTime + .1; step = 0;
      musicTimer = setInterval(function () {
        if (muted()) { musicGain.gain.value = 0; return; } else if (musicGain.gain.value < .05) musicGain.gain.value = .07;
        while (nextT < c.currentTime + .3) {
          var bar = Math.floor(step / 8) % 4, ch = chords[bar], beat = step % 8, t = nextT - c.currentTime;
          if (beat % 4 === 0) note(N(ch[0] - 12), t, .45, 'sine', .5, musicGain);            // bas
          if (beat % 2 === 1) ch.forEach(function (m) { note(N(m), t, .18, 'triangle', .14, musicGain); }); // akor ketuk
          if (Math.random() < .55) note(N(penta[(step * 3 + bar) % penta.length]), t, .2, 'square', .08, musicGain); // melodi
          nextT += .2; step++;
        }
      }, 80);
    }
  };
  // Buka audio pada interaksi pertama (kebijakan autoplay browser)
  ['pointerdown', 'keydown'].forEach(function (ev) { global.addEventListener(ev, function () { ac(); }, { once: true }); });
  global.Sfx = S;
})(window);
