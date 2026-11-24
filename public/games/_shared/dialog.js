/* Main-yuk · Dialog konfirmasi bergaya game (pengganti confirm() bawaan browser).
   Dialog.ask(teks, onYa, { ya, batal, ikon }) */
(function (global) {
  'use strict';
  var css = document.createElement('style');
  css.textContent =
    '.dlg-back{position:fixed;inset:0;z-index:99990;background:rgba(27,26,58,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:dlgF .15s ease}' +
    '.dlg{width:min(100%,360px);background:#fff;border:3px solid #1b1a3a;box-shadow:6px 6px 0 #1b1a3a;border-radius:22px;padding:20px 18px 16px;text-align:center;font-family:Nunito,system-ui,sans-serif;color:#1b1a3a;animation:dlgIn .22s cubic-bezier(.2,1.3,.4,1)}' +
    '.dlg .ic{font-size:44px;line-height:1}.dlg p{margin:10px 0 16px;font-weight:900;font-size:19px;line-height:1.3}' +
    '.dlg .bt{display:flex;gap:10px}.dlg button{flex:1;min-height:48px;border:3px solid #1b1a3a;border-radius:14px;box-shadow:3px 3px 0 #1b1a3a;font:900 16px Nunito,system-ui,sans-serif;color:#1b1a3a;cursor:pointer}' +
    '.dlg button:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #1b1a3a}.dlg .no{background:#fff}.dlg .yes{background:#ff5d8f;color:#fff;text-shadow:1px 1px 0 #1b1a3a}' +
    '@keyframes dlgF{from{opacity:0}}@keyframes dlgIn{from{opacity:0;transform:scale(.85)}}' +
    '@media (prefers-reduced-motion:reduce){.dlg-back,.dlg{animation:none}}';
  document.head.appendChild(css);
  function ask(text, onYes, o) {
    o = o || {};
    var back = document.createElement('div'); back.className = 'dlg-back';
    back.innerHTML = '<div class="dlg" role="alertdialog" aria-modal="true"><div class="ic"></div><p></p><div class="bt"><button class="no" type="button"></button><button class="yes" type="button"></button></div></div>';
    back.querySelector('.ic').textContent = o.ikon || '🤔';
    back.querySelector('p').textContent = text;
    var no = back.querySelector('.no'), yes = back.querySelector('.yes');
    no.textContent = o.batal || 'Lanjut main'; yes.textContent = o.ya || 'Ya, selesai';
    function close() { back.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    no.onclick = close; yes.onclick = function () { close(); onYes && onYes(); };
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', key);
    document.body.appendChild(back); yes.focus();
  }
  global.Dialog = { ask: ask };
})(window);
