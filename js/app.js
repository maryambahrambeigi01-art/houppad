/* Houppad — v9 app. Plain JS, no build step. */
(() => {
'use strict';
const D = window.DATA, J = D.jokes;
const $ = s => document.querySelector(s);
const fa = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pick = a => a[Math.random() * a.length | 0];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEY = 'jabe9:';
const store = { get(k, d) { try { const v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} } };
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const DECKS = { General: 'کلی', Relation: 'رابطه' };
const POSES = Object.keys(D.poses);
const who = p => p.split('-')[0];
const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M9 5.5c2.5 2 4.6 4.3 6.3 6.6-1.8 2.2-3.9 4.3-6.4 6.3"/></svg>',
  mark: '<svg viewBox="0 0 24 24"><path d="M7 3.6c3.4-.4 6.6-.3 10 .2.3 5.4.2 11-.2 16.6-1.7-1.6-3.3-3-4.9-4.3-1.7 1.4-3.3 2.9-5 4.4C6.6 15 6.6 9.3 7 3.6z"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" style="stroke:#4a3a33;fill:none;stroke-width:2;stroke-linecap:round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15.2l5 5M8 10.6h5M10.5 8v5"/></svg>'
};

/* ---------------- scenes + per-scene motion ---------------- */
// positions are fractions of the scene bitmap (1170x2532); helper f(x,y,w,h) with w,h as fractions of width/height
const f = (cls, x, y, w, h, extra = '') => `<div class="fx ${cls}" style="left:${(x - w / 2) * 100}%;top:${(y - h / 2) * 100}%;width:${w * 100}%;height:${h * 100}%;${extra}">${cls.includes('hand') ? '<i></i>' : ''}</div>`;
const cut = (src, poly, ox, oy, cls = 'sway-cut') => `<div class="fx ${cls}" style="inset:0;transform-origin:${ox * 100}% ${oy * 100}%;clip-path:polygon(${poly.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(',')})"><img src="${src}" alt=""></div>`;
const motes = (x, y, w, h, n) => Array.from({ length: n }, (_, i) => f('mote', x + (Math.sin(i * 7.3) * .5) * w, y + (Math.cos(i * 3.1) * .5) * h, .006, .0028, `animation-delay:${-i * 1.7}s;animation-duration:${8 + i % 4}s`)).join('');
const clockHand = (x, y, r, dly = 0) => `<div class="fx hand" style="left:${(x - .002) * 100}%;top:${(y - r * 1170 / 2532) * 100}%;width:.4%;height:${r * 1170 / 2532 * 100}%;animation-delay:${dly}s"><i></i></div>`;
const FX = {
  'her-busstop': s => f('glow', .45, .12, .42, .17) + motes(.45, .14, .2, .05, 5),
  'her-clockroom': s => cut(s, [[.2, .09], [.4, .09], [.4, .215], [.2, .215]], .3, .205) + clockHand(.743, .115, .062, -17) + f('glow pulse', .12, .1, .3, .1, 'opacity:.4'),
  'her-greenhouse': s => f('rain', .5, .17, 1, .34) + cut(s, [[.0, .07], [.2, .07], [.2, .215], [0, .215]], .1, .21),
  'her-museum': s => f('sheen', .177, .266, .272, .120) + motes(.82, .17, .14, .08, 6) + f('glow pulse', .82, .19, .3, .14, 'opacity:.5'),
  'her-rooftop': s => f('cloud', .1, .07, .3, .04) + f('cloud', .1, .14, .22, .03, 'animation-delay:-18s;animation-duration:52s') + f('blink', .26, .095, .025, .012) + f('blink', .8, .14, .02, .009, 'animation-delay:-1.1s'),
  'her-theater': s => cut(s, [[0, 0], [.42, 0], [.42, .2], [0, .2]], .2, 0) + f('glow', .44, .18, .36, .15) + f('beam', .44, .1, .34, .16) + motes(.44, .15, .2, .07, 6),
  'new-cafe': s => `<div class="fx swing" style="inset:0;transform-origin:20% 0">${cut(s, [[.06, 0], [.34, 0], [.34, .135], [.06, .135]], .2, 0, 'still')}${f('glow', .2, .135, .4, .14)}</div>`,
  'new-laundromat': s => f('drum', .17, .253, .13, .06) + f('drum d2', .42, .245, .13, .06) + f('twinkle', .66, .19, .008, .0037) + f('twinkle', .76, .21, .006, .0028, 'animation-delay:-1.4s') + f('twinkle', .84, .175, .007, .0032, 'animation-delay:-2.2s'),
  'new-lighthouse': s => `<div class="fx swing" style="inset:0;transform-origin:18% 7%">${cut(s, [[.08, .07], [.28, .07], [.28, .22], [.08, .22]], .18, .07, 'still')}${f('glow', .175, .17, .4, .18)}</div>` + f('shimmer', .51, .212, .2, .085),
  'new-platform': s => f('glow', .42, .11, .4, .16) + f('fog', .5, .27, 1.1, .16) + f('fog f2', .55, .36, 1.2, .14) + f('glow pulse', .68, .245, .06, .03),
  'new-pool': s => f('glow pulse', .8, .2, .3, .12) + f('fog', .5, .25, 1.2, .07, 'opacity:.5') + f('shimmer', .6, .33, .6, .06, 'border-radius:0;opacity:.35'),
  'new-waitingroom': s => clockHand(.62, .113, .055, -40) + f('bubble', .73, .175, .012, .0055) + f('bubble', .735, .18, .008, .0037, 'animation-delay:-2s')
};
let sceneName = null;
function setScene(name, instant) {
  if (name === sceneName) return;
  sceneName = name;
  const src = `img/scenes/${name}.webp`;
  const el = document.createElement('div'); el.className = 'scene'; el.dataset.name = name;
  el.innerHTML = `<img class="bg" src="${src}" alt="">${RM.matches ? '' : (FX[name] ? FX[name](src) : '')}`;
  sizeScene(el);
  const host = $('#scenes'); host.appendChild(el);
  const img = el.querySelector('img.bg');
  const show = () => requestAnimationFrame(() => { el.classList.add('on'); setTimeout(() => { [...host.children].forEach(c => c !== el && c.remove()); }, instant ? 0 : 700); });
  img.complete ? show() : (img.onload = show, img.onerror = show);
}
function sizeScene(el) {
  const W = innerWidth, H = innerHeight, r = 1170 / 2532;
  let w = W, h = W / r; if (h < H) { h = H; w = H * r; }
  el.style.width = w + 'px'; el.style.height = h + 'px';
}

/* ---------------- figure (creature + overhead sign) ---------------- */
const SL = { t: .26, r: .19, b: .26, l: .19 }; // border-image slice fractions of the sign bitmap
let seed = 1; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function buildText(el, lines) {
  // lines: [{t, cls}] ; words wrapped in spans so we can jitter them like hand lettering afterwards
  el.innerHTML = lines.map(l => `<span class="p ${l.cls || ''}">${String(l.t).split(/\s+/).filter(Boolean).map(w => `<span class="w">${esc(fa(w))}</span>`).join(' ')}</span>`).join('');
}
function jitter(el, s) {
  seed = s || 7;
  const ws = [...el.querySelectorAll('.w')]; if (!ws.length) return;
  const rows = new Map();
  ws.forEach(w => { w.style.transform = ''; const k = Math.round(w.offsetTop / 4); (rows.get(k) || rows.set(k, []).get(k)).push(w); });
  const box = el.getBoundingClientRect(); const cx = box.width / 2;
  rows.forEach(row => {
    const a = (R() - .5) * 4.2 * Math.PI / 180, dx = (R() - .5) * 7;
    row.forEach(w => { const x = w.offsetLeft + w.offsetWidth / 2 - cx;
      w.style.transform = `translate(${dx.toFixed(1)}px,${(-Math.tan(a) * x + (R() - .5) * 3.2).toFixed(1)}px) rotate(${((R() - .5) * 4 - a * 180 / Math.PI).toFixed(1)}deg) scale(${(1 + (R() - .5) * .08).toFixed(3)})`; });
  });
}
const meas = document.createElement('div');
meas.className = 'fig'; meas.style.cssText = 'visibility:hidden;left:0;top:0;width:0;height:0;overflow:hidden;position:fixed;contain:layout';
function measure(lines, width, fs) {
  if (!meas.parentNode) document.body.appendChild(meas);
  meas.innerHTML = '<div class="txt" style="position:static;display:block"></div>';
  const t = meas.firstChild; t.style.width = width + 'px'; t.style.fontSize = fs + 'px';
  buildText(t, lines); return t.scrollHeight;
}
/* place: {cx, feet, cw (creature css width), top (min y for sign top), maxW (max sign width), minFs, maxFs} */
function layoutFigure(pname, lines, place, sid) {
  const P = D.poses[pname], S = D.signs[(sid || P.sid) - 1];
  const tries = [];
  const k0 = place.cw / P.crw;
  for (let k = k0; k >= k0 * .55 - 1e-6; k -= k0 * .075) tries.push(k);
  const fit = (k, Ws, fs) => {
    const figTop = place.feet - P.feet * k, by = figTop + P.b[1] * k;
    const base = P.sw * k, ins = { l: S.tb[0] * base, r: (1 - S.tb[2]) * base, t: S.tb[1] * P.sh * k, b: (1 - S.tb[3]) * P.sh * k };
    const h = measure(lines, Ws - ins.l - ins.r, fs);
    const Hs = Math.max(P.sh * k, h + ins.t + ins.b);
    return { k, Ws, Hs, fs, ins, ok: by - Hs >= place.top, by, figTop };
  };
  const maxW = place.maxW, minFs = place.minFs || 20, maxFs = place.maxFs || 27;
  for (const pass of [[maxFs, Math.max(minFs, 22)], [21, minFs]]) {
    for (const k of tries) {
      const base = P.sw * k, pref = place.prefW || base, Wopts = [Math.max(base, Math.min(maxW, pref)), maxW].filter((w, i, a) => a.indexOf(w) === i);
      for (const Ws of Wopts) for (let fs = pass[0]; fs >= pass[1]; fs--) { const r = fit(k, Ws, fs); if (r.ok) return Object.assign(r, { P, S, small: false }); }
    }
  }
  const k = tries[tries.length - 1];
  for (let fs = minFs - 1; fs >= 13; fs--) { const r = fit(k, maxW, fs); if (r.ok || fs === 13) return Object.assign(r, { P, S, small: true }); }
}
function makeFigure(pname, lines, place, opts = {}) {
  const sid = opts.sid || D.poses[pname].sid;
  const L = layoutFigure(pname, lines, place, sid); const { P, S, k } = L;
  const W = P.size[0] * k, H = P.size[1] * k, left = place.cx - P.cx * k, top = L.figTop;
  const el = document.createElement('div'); el.className = 'fig';
  Object.assign(el.style, { left: left + 'px', top: top + 'px', width: W + 'px', height: H + 'px' });
  el.style.setProperty('--fx', (P.cx * k) + 'px'); el.style.setProperty('--fy', (P.feet * k) + 'px');
  const src = n => `img/poses/${pname}.${n}.webp`;
  // sign box in figure coords; bottom-centre pinned where the hands grip
  let bx = P.b[0] * k; const by = P.b[1] * k;
  const vw = innerWidth, absL = left + bx - L.Ws / 2, absR = left + bx + L.Ws / 2;
  if (absL < 8) bx += 8 - absL; else if (absR > vw - 8) bx -= absR - (vw - 8);
  const sc = (P.sw * k) / S.w; // bitmap px -> css px at the baked size
  const bt = S.h * SL.t * sc, bb = S.h * SL.b * sc, bl = S.w * SL.l * sc, br = S.w * SL.r * sc;
  const signCss = `left:${bx - L.Ws / 2}px;top:${by - L.Hs}px;width:${L.Ws}px;height:${L.Hs}px;transform:rotate(${-P.rot}deg);` +
    `border-width:${bt}px ${br}px ${bb}px ${bl}px;border-image:url(img/signs/sign-${sid}.webp) ${S.h * SL.t | 0} ${S.w * SL.r | 0} ${S.h * SL.b | 0} ${S.w * SL.l | 0} fill / ${bt}px ${br}px ${bb}px ${bl}px stretch;`;
  const ti = L.ins; // text box inside the sign (relative to its padding box => subtract border widths)
  el.innerHTML = `<div class="walk"><div class="sway">
    <img class="l arms" src="${src('arms-under')}" alt="">
    <img class="l cr" src="${src('creature')}" alt="">
    <div class="sign" style="${signCss}"><div class="txt" style="left:${ti.l - bl}px;right:${ti.r - br}px;top:${ti.t - bt}px;bottom:${ti.b - bb}px;font-size:${L.fs}px"></div>${L.small ? `<span class="enlarge">${ICON.zoom}</span>` : ''}</div>
    <img class="l fing" src="${src('fingers-over')}" alt="">
  </div></div>`;
  const txt = el.querySelector('.txt'); buildText(txt, lines);
  el._layout = L; el._txt = txt; el._seed = opts.seed || (Math.random() * 1e6 | 0);
  return el;
}
function mountFigure(el, anim, dir = 1) {
  $('#figs').appendChild(el);
  jitter(el._txt, el._seed);
  if (RM.matches || !anim) return;
  el.style.setProperty('--from', (dir > 0 ? '-' : '') + '110vw');
  el.classList.add(anim); el.addEventListener('animationend', e => { if (e.target.classList.contains('walk')) el.classList.remove(anim); });
}
function dismissFigures(dir = 1) {
  const figs = [...$('#figs').children];
  if (RM.matches) { figs.forEach(f => f.remove()); return 0; }
  figs.forEach(f => { f.style.setProperty('--to', (dir > 0 ? '' : '-') + '110vw'); f.classList.remove('enter', 'pop'); f.classList.add('leave'); setTimeout(() => f.remove(), 600); });
  return figs.length ? 380 : 0;
}
function loadImgs(pname) { return Promise.all(['arms-under', 'creature', 'fingers-over'].map(n => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = `img/poses/${pname}.${n}.webp`; }))); }

/* ---------------- shake ---------------- */
const shake = { status: 'off', last: 0, hits: [], prev: null };
const THRESH = 14, WIN = 600, COOL = 1300;
function onMotion(e) {
  let mag = null; const a = e.acceleration;
  if (a && a.x != null) mag = Math.hypot(a.x, a.y, a.z);
  else { const g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
    if (shake.prev) mag = Math.hypot(g.x - shake.prev.x, g.y - shake.prev.y, g.z - shake.prev.z);
    shake.prev = { x: g.x, y: g.y, z: g.z }; if (mag == null) return; }
  const now = Date.now(); if (mag < THRESH) return;
  shake.hits = shake.hits.filter(t => now - t < WIN); shake.hits.push(now);
  if (shake.hits.length >= 2 && now - shake.last > COOL && state.screen === 'play') { shake.last = now; shake.hits = []; draw('shake'); }
}
function listen() { if (shake.status !== 'on') { addEventListener('devicemotion', onMotion); shake.status = 'on'; } }
function initShake() {
  if (!('DeviceMotionEvent' in window)) shake.status = 'unsupported';
  else if (typeof DeviceMotionEvent.requestPermission === 'function') shake.status = 'needs';
  else listen();
}
async function enableShake() { // must run inside a tap (iOS)
  if (shake.status !== 'needs' && shake.status !== 'denied') return shake.status;
  try { const r = await DeviceMotionEvent.requestPermission(); r === 'granted' ? listen() : (shake.status = 'denied'); } catch (e) { shake.status = 'denied'; }
  return shake.status;
}

/* ---------------- state / navigation ---------------- */
let state = { screen: 'loading' };
function go(s, replace) { state = s; try { history[replace ? 'replaceState' : 'pushState'](s, ''); } catch (e) {} render(); }
addEventListener('popstate', e => { const s = e.state; if (s && s.screen && s.screen !== 'loading') { state = s; render(); } });
const ui = () => $('#ui');
function render() { document.body.dataset.screen = state.screen; closeZoom(); ({ home, perm, play: playScreen, favs: favScreen })[state.screen](); }
function layoutBox() {
  const cs = getComputedStyle(document.documentElement);
  const sat = parseFloat(cs.getPropertyValue('--sat-px')) || 0;
  return { W: innerWidth, H: innerHeight };
}
function safe() { const p = document.createElement('div'); p.style.cssText = 'position:fixed;top:0;height:var(--sat);bottom:auto;visibility:hidden'; document.body.appendChild(p); const t = p.offsetHeight; p.style.height = 'var(--sab)'; const b = p.offsetHeight; p.remove(); return { t, b }; }

/* ---------------- home ---------------- */
function home() {
  setScene('her-museum');
  const n = D.decks.General.length + D.decks.Relation.length, favN = store.get('fav', []).length;
  ui().innerHTML = `<div class="titlebox"><h1 class="title" dir="ltr">Houppad</h1><p class="tag">${esc(J.home_tagline[0])}</p></div>
    <div class="foot">${fa(n)} کارت · بی‌نهایت سکوت معذب${favN ? ` · <button class="link" id="favLink">نشان‌شده‌ها (${fa(favN)})</button>` : ''}</div>`;
  const fl = $('#favLink'); if (fl) fl.onclick = () => go({ screen: 'favs' });
  $('#figs').innerHTML = '';
  const { W, H } = { W: innerWidth, H: innerHeight }, sf = safe();
  const titleBottom = ui().querySelector('.titlebox').getBoundingClientRect().bottom + 14;
  const feet = H - sf.b - 40, cw = Math.min(W * .4, 190, (feet - titleBottom) * .4);
  const mk = (pname, deck, cx, sid, s) => {
    const el = makeFigure(pname, [{ t: DECKS[deck] }, { t: `${D.decks[deck].length} کارت`, cls: 'small' }], { cx, feet, cw, top: titleBottom, maxW: W * .47, prefW: W * .44, minFs: 30, maxFs: 46 }, { sid, seed: s });
    const sg = el.querySelector('.sign'); sg.setAttribute('role', 'button'); sg.setAttribute('aria-label', 'دسته‌ی ' + DECKS[deck]);
    sg.onclick = () => chooseDeck(deck);
    return el;
  };
  mountFigure(mk('morrow-proud-but-hiding-it', 'General', W * .27, 1, 11), 'pop');
  const right = mk('vesper-plotting', 'Relation', W * .73, 2, 23); setTimeout(() => mountFigure(right, 'pop'), RM.matches ? 0 : 140);
}
function chooseDeck(deck) {
  const seen = store.get('permSeen', false);
  if (!seen && shake.status !== 'unsupported') return go({ screen: 'perm', deck });
  if (shake.status === 'needs' && store.get('permOK', false)) enableShake(); // this tap is a user gesture: re-ask silently-ish on iOS
  go({ screen: 'play', deck });
}

/* ---------------- shake permission ---------------- */
function perm() {
  setScene('her-clockroom');
  $('#figs').innerHTML = '';
  const W = innerWidth, H = innerHeight, sf = safe();
  ui().innerHTML = `<div class="top"><button class="ib" id="back" aria-label="بازگشت">${ICON.back}</button><span></span></div>
    <div class="panel"><p>${esc(J.shake_permission[1])}</p>
      <button class="btn" id="yes">${esc(J.shake_permission[2].replace(/[\[\]]/g, '').trim())}</button>
      <button class="btn ghost" id="no">${esc(J.shake_permission[3].replace(/[\[\]]/g, '').trim())}</button></div>`;
  const panelTop = ui().querySelector('.panel').getBoundingClientRect().top - 10;
  const el = makeFigure('serein-listening', [{ t: J.shake_permission[0] }], { cx: W / 2, feet: panelTop, cw: Math.min(W * .58, 240), top: sf.t + 64, maxW: W - 30, prefW: W * .78, minFs: 22, maxFs: 28 }, { seed: 5 });
  mountFigure(el, 'enter');
  $('#back').onclick = () => history.back();
  const deck = state.deck;
  $('#yes').onclick = async () => { store.set('permSeen', true); const st = await enableShake(); store.set('permOK', st === 'on'); go({ screen: 'play', deck }, true); };
  $('#no').onclick = () => { store.set('permSeen', true); if (shake.status === 'needs') shake.status = 'declined'; go({ screen: 'play', deck }, true); };
}

/* ---------------- play ---------------- */
let play = null, busy = false, lastScene = null, lastWho = null;
const saveP = () => store.set('deck:' + play.deck, { order: play.order, pos: play.pos });
function loadP(deck, fresh) {
  const ids = D.decks[deck].map(c => c[0]);
  if (!fresh) { const s = store.get('deck:' + deck, null); if (s && s.order && s.order.length === ids.length && s.order.every(id => ids.includes(id))) return { deck, ...s }; }
  return { deck, order: shuffle(ids), pos: -1 };
}
const qById = (deck, id) => D.decks[deck].find(c => c[0] === id);
function playScreen() {
  if (!play || play.deck !== state.deck) play = loadP(state.deck);
  ui().innerHTML = `<div class="top"><button class="ib" id="back" aria-label="بازگشت">${ICON.back}</button>
      <button class="ib" id="mark" aria-label="نشان کردن">${ICON.mark}</button></div>
    <div class="pill" id="pill"></div>
    <div class="bottom"><div class="hint" id="hint"></div><button class="btn next" id="next">${esc(J.next_button)}</button></div>`;
  $('#back').onclick = () => go({ screen: 'home' });
  $('#next').onclick = () => { if (shake.status === 'needs') enableShake(); draw('tap'); };
  $('#mark').onclick = toggleMark;
  updateHint();
  $('#figs').innerHTML = ''; sceneName = sceneName; // keep current scene until first card picks one
  if (play.pos < 0) draw('first');
  else if (play.pos >= play.order.length) showEnd(false);
  else showCard('pop');
}
function updateHint() {
  const h = $('#hint'); if (!h) return;
  if (shake.status === 'on') h.innerHTML = `${esc(J.shake_hint[0])}<small>${esc(J.shake_hint[1])}</small>`;
  else if (shake.status === 'needs' || shake.status === 'declined') { h.innerHTML = `<button id="en">${esc(J.shake_hint[0])}</button><small>(یه ضربه این‌جا، تا تکون‌دادن روشن شه)</small>`;
    $('#en').onclick = async () => { await enableShake(); updateHint(); }; }
  else h.innerHTML = `<small style="font-size:13px">${esc(J.empty_tap_hint)}</small>`;
}
function updateTop() {
  const n = play.order.length, p = $('#pill'); if (!p) return;
  p.textContent = play.pos >= n ? `${DECKS[play.deck]} · تموم شد` : `${DECKS[play.deck]}  —  ${fa(Math.max(1, play.pos + 1))} از ${fa(n)}`;
  const m = $('#mark'), id = play.order[play.pos];
  if (m) { m.classList.toggle('on', play.pos < n && store.get('fav', []).includes(id)); m.style.visibility = play.pos < n ? '' : 'hidden'; }
}
function toggleMark() {
  const id = play.order[play.pos]; if (!id) return; let fv = store.get('fav', []);
  fv = fv.includes(id) ? fv.filter(x => x !== id) : [...fv, id]; store.set('fav', fv); updateTop();
  if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
}
function draw(how) {
  if (busy || state.screen !== 'play') return;
  const n = play.order.length;
  if (play.pos >= n) return;
  busy = true;
  if (navigator.vibrate && how === 'shake') try { navigator.vibrate([30, 40, 30]); } catch (e) {}
  const wait = how === 'first' ? 0 : dismissFigures(1);
  play.pos++; saveP();
  setTimeout(() => { (play.pos >= n ? showEnd(true) : showCard('enter')).then(() => { busy = false; }); }, wait);
}
function pickScene() { let s; do { s = pick(D.scenes); } while (s === lastScene && D.scenes.length > 1); lastScene = s; return s; }
function pickPose() { let p; do { p = pick(POSES); } while (who(p) === lastWho); lastWho = who(p); return p; }
function cardPlace(sf) {
  const W = innerWidth, H = innerHeight;
  const bottomUI = (ui().querySelector('.bottom') || { getBoundingClientRect: () => ({ top: H - sf.b - 70 }) }).getBoundingClientRect().top;
  const feet = Math.min(bottomUI + 6, H * .93);
  return { cx: W / 2, feet, cw: Math.min(W * .66, 270, (feet - sf.t - 60) * .42), top: sf.t + 62, maxW: W - 24, prefW: W * .8 };
}
async function showCard(anim) {
  const [id, text] = qById(play.deck, play.order[play.pos]);
  const sf = safe();
  const pname = play.posePos === play.pos && play.pose ? play.pose : pickPose();
  const scene = play.posePos === play.pos && play.scene ? play.scene : pickScene();
  play.pose = pname; play.scene = scene; play.posePos = play.pos;
  updateTop();
  await loadImgs(pname);
  setScene(scene);
  const paras = text.split('\n').filter(Boolean);
  const lines = paras.map((t, i) => ({ t, cls: paras.length > 2 && i > 0 ? 'opt' : '' }));
  const el = makeFigure(pname, lines, cardPlace(sf), { seed: id.charCodeAt(0) * 1000 + parseInt(id.slice(1)) });
  el.querySelector('.sign').onclick = e => { e.stopPropagation(); openZoom(text); };
  mountFigure(el, anim, 1);
}
function showEnd(anim) {
  updateTop(); const sf = safe(), W = innerWidth;
  const b = ui().querySelector('.bottom'); b.innerHTML = '';
  const panel = document.createElement('div'); panel.className = 'panel';
  panel.innerHTML = `<p>${esc(J.deck_end[1])}</p><button class="btn" id="again">از اول، با یه بُر تازه</button><button class="btn ghost" id="other">یه لیوان چای و یه دسته‌ی دیگه</button>`;
  ui().appendChild(panel);
  $('#again').onclick = () => { play = loadP(play.deck, true); saveP(); panel.remove(); playScreen(); };
  $('#other').onclick = () => go({ screen: 'home' });
  setScene('her-busstop');
  const top = panel.getBoundingClientRect().top - 8;
  return loadImgs('morrow-waiting').then(() => { const el = makeFigure('morrow-waiting', [{ t: J.deck_end[0] }], { cx: W / 2, feet: top, cw: Math.min(W * .58, 240), top: sf.t + 62, maxW: W - 30, prefW: W * .78, minFs: 22, maxFs: 28 }, { seed: 99 });
    mountFigure(el, anim ? 'enter' : null); });
}

/* ---------------- zoomed question ---------------- */
function openZoom(text) {
  closeZoom(); const z = document.createElement('div'); z.className = 'zoom'; z.id = 'zoom';
  z.innerHTML = `<div class="sheet">${esc(fa(text))}</div>`; z.onclick = closeZoom; document.body.appendChild(z);
}
function closeZoom() { const z = $('#zoom'); if (z) z.remove(); }

/* ---------------- favourites ---------------- */
function favScreen() {
  $('#figs').innerHTML = ''; setScene('her-theater');
  const fv = store.get('fav', []); const all = [...D.decks.General, ...D.decks.Relation];
  ui().innerHTML = `<div class="top"><button class="ib" id="back" aria-label="بازگشت">${ICON.back}</button><span></span></div>
    <div class="pill">نشان‌شده‌ها</div><div class="favs" id="favs"></div>`;
  const box = $('#favs');
  const items = fv.map(id => all.find(c => c[0] === id)).filter(Boolean);
  box.innerHTML = items.length ? items.map(([id, t]) => `<div class="fav" data-id="${id}">${esc(fa(t))}<button aria-label="حذف">×</button></div>`).join('') : `<p class="empty">هنوز هیچی نشان نکردی.</p>`;
  box.querySelectorAll('.fav button').forEach(b => b.onclick = () => { store.set('fav', store.get('fav', []).filter(x => x !== b.parentNode.dataset.id)); favScreen(); });
  $('#back').onclick = () => go({ screen: 'home' });
}

/* ---------------- boot ---------------- */
document.addEventListener('keydown', e => { if (state.screen !== 'play') return;
  if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'Enter') draw('tap'); if (e.key === 's') draw('shake'); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { document.querySelectorAll('.scene').forEach(sizeScene); if (state.screen !== 'loading') render(); }, 200); });
window.APP = { draw, go, get state() { return state; }, get play() { return play; }, shake, D };
initShake();
const lj = $('#loadJoke'); lj.textContent = pick(J.loading);
const t0 = Date.now();
const pre = [document.fonts.load('20px Marhey', 'سلام'), document.fonts.load('15px Playpen', 'سلام'), loadImgs('morrow-proud-but-hiding-it'), loadImgs('vesper-plotting'),
  new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = 'img/scenes/her-museum.webp'; })];
Promise.race([Promise.all(pre), new Promise(r => setTimeout(r, 6000))]).then(() => {
  setTimeout(() => { history.replaceState({ screen: 'home' }, ''); state = { screen: 'home' }; render(); $('#loading').classList.add('gone'); setTimeout(() => $('#loading').remove(), 600); },
    Math.max(0, (RM.matches ? 300 : 1400) - (Date.now() - t0)));
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js');
})();
