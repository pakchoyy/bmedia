/* Main-yuk · Pembaca suara (Web Speech API, bahasa Indonesia). Gratis, tanpa server.
   Suara.enabled()  Suara.toggle()  Suara.read(teks, {force})  Suara.say(teks) */
(function (global) {
  'use strict';
  var synth = global.speechSynthesis, voice = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices() || [];
    voice = vs.filter(function (v) { return /^id/i.test(v.lang); })[0] || vs.filter(function (v) { return /indonesia/i.test(v.name); })[0] || null;
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
  function say(t) {
    if (!synth || !t) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(words(t));
      u.lang = 'id-ID'; if (voice) u.voice = voice; u.rate = 0.95; u.pitch = 1.1;
      synth.speak(u);
    } catch (e) {}
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
