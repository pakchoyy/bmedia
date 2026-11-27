/* Main-yuk · Pembaca suara (Web Speech API, bahasa Indonesia). Gratis, tanpa server.
   Suara.enabled()  Suara.toggle()  Suara.read(teks, {force})  Suara.say(teks) */
(function (global) {
  'use strict';
  var synth = global.speechSynthesis, voice = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices() || [];
    var ids = vs.filter(function (v) { return /^id/i.test(v.lang) || /indonesia/i.test(v.name); });
    // utamakan suara perempuan yang jernih; hindari suara pria (mis. "Andika" di Windows)
    function rank(v) { var n = v.name; return /Gadis|Damayanti|Female|Wanita/i.test(n) ? 0 : /Natural|Online/i.test(n) && !/Ardi|Andika|Male/i.test(n) ? 1 : /Google/i.test(n) ? 2 : /Andika|Ardi|Male/i.test(n) ? 9 : 5; }
    ids.sort(function (a, b) { return rank(a) - rank(b); });
    voice = ids[0] || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  function enabled() { try { return localStorage.getItem('bgy_tts') === '1'; } catch (e) { return false; } }
  function words(t) {
    return String(t)
      .replace(/(\d+)\s*²/g, '$1 kuadrat').replace(/(\d+)\s*³/g, '$1 pangkat tiga')
      .replace(/∛\s*(\d+)/g, 'akar pangkat tiga dari $1').replace(/√\s*(\d+)/g, 'akar dari $1')
      .replace(/\s*\+\s*/g, ' tambah ').replace(/\s*[−-]\s*(?=\d)/g, ' kurang ').replace(/\s*×\s*/g, ' kali ').replace(/\s*÷\s*/g, ' bagi ')
      .replace(/(\d+)\s*%/g, '$1 persen').replace(/=\s*\?/g, 'sama dengan berapa?').replace(/…/g, ' berapa ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ').replace(/\s+/g, ' ').trim();
  }
  // Suara AI (ElevenLabs lewat /api/suara) bila tersedia; kalau gagal, pakai suara perangkat
  var audio = null, ai = true;
  function stopAudio() { if (audio) { try { audio.pause(); } catch (e) {} audio = null; } }
  if (synth) { var c0 = synth.cancel.bind(synth); synth.cancel = function () { stopAudio(); c0(); }; }
  function sayDevice(t) {
    if (!synth) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(words(t));
      u.lang = 'id-ID'; if (voice) u.voice = voice; u.rate = 0.95; u.pitch = 1.1;
      synth.speak(u);
    } catch (e) {}
  }
  function say(t) {
    if (!t) return;
    var w = words(t); if (!w) return;
    if (synth) synth.cancel(); else stopAudio();
    if (!ai || w.length > 300) return sayDevice(t);
    var a = new Audio('/api/suara?t=' + encodeURIComponent(w)); audio = a;
    var fell = false, fb = function () { if (fell || audio !== a) return; fell = true; ai = false; audio = null; sayDevice(t); };
    a.onerror = fb;
    var p = a.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === 'NotAllowedError') return; fb(); });
  }
  global.Suara = {
    supported: !!synth,
    enabled: enabled,
    toggle: function () { var v = !enabled(); try { localStorage.setItem('bgy_tts', v ? '1' : '0'); } catch (e) {} if (!v && synth) synth.cancel(); else say('Suara pembaca aktif'); return v; },
    read: function (t, o) { if (enabled() || (o && o.force)) say(t); },
    say: say,
    words: words
  };
})(window);
