// البازل: قطع بشكل البازل الحقيقي (سنّة وتجويف)، الطفل يسحب كل قطعة لمكانها وتلزق لوحدها.
// الصور من رسومات التطبيق، أو «صورتي»: صورة من الموبايل أو الكاميرا، بتتقصّ مربع وتتحفظ على الموبايل بس.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { Head, Chips, Win, SCENES, A, ar, shuffle, rnd, innerW } from './common';

const LEVELS = [{ id: 2, t: '٤', d: 'قطع' }, { id: 3, t: '٩', d: 'قطع' }, { id: 4, t: '١٦', d: 'قطعة' }, { id: 5, t: '٢٥', d: 'قطعة' }];
const PKEY = 'siraj-photos';
const loadPhotos = () => { try { return JSON.parse(localStorage.getItem(PKEY) || '[]'); } catch (e) { return []; } };
const savePhotos = (l) => { try { localStorage.setItem(PKEY, JSON.stringify(l)); return true; } catch (e) { return false; } };

// يقصّ الصورة مربع من النص ويصغّرها، عشان تتحفظ خفيفة
function squareImage(file, size) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const s = Math.min(im.width, im.height), cv = document.createElement('canvas'); cv.width = cv.height = size;
      cv.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.84));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(); };
    im.src = url;
  });
}

// شكل القطعة: كل ضلع يا مستقيم (على الحرف) يا سنّة لبرّه (+١) يا تجويف لجوّه (-١)
function edgePath(x0, y0, x1, y1, e, S) {
  if (!e) return `L${x1},${y1}`;
  const dx = (x1 - x0) / S, dy = (y1 - y0) / S, nx = dy, ny = -dx;
  const P = (t, h) => `${(x0 + dx * S * t + nx * S * h * e).toFixed(2)},${(y0 + dy * S * t + ny * S * h * e).toFixed(2)}`;
  return `L${P(0.34, 0)} C${P(0.41, 0)} ${P(0.43, 0.07)} ${P(0.39, 0.12)} C${P(0.32, 0.22)} ${P(0.41, 0.29)} ${P(0.5, 0.29)} C${P(0.59, 0.29)} ${P(0.68, 0.22)} ${P(0.61, 0.12)} C${P(0.57, 0.07)} ${P(0.59, 0)} ${P(0.66, 0)} L${x1},${y1}`;
}
const piecePath = (e, S) => `M0,0 ${edgePath(0, 0, S, 0, e.t, S)} ${edgePath(S, 0, S, S, e.r, S)} ${edgePath(S, S, 0, S, e.b, S)} ${edgePath(0, S, 0, 0, e.l, S)} Z`;
function makeEdges(N) {
  const h = [...Array(N)].map(() => [...Array(N)].map(() => (Math.random() < 0.5 ? 1 : -1))); // ضلع يمين كل قطعة
  const v = [...Array(N)].map(() => [...Array(N)].map(() => (Math.random() < 0.5 ? 1 : -1))); // ضلع تحت كل قطعة
  const E = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
    E.push({ t: r ? -v[r - 1][c] : 0, r: c < N - 1 ? h[r][c] : 0, b: r < N - 1 ? v[r][c] : 0, l: c ? -h[r][c - 1] : 0 });
  return E;
}

function Board({ img, N, back, onWin, nextLevel }) {
  const wrap = useRef(null);
  const [W, setW] = useState(340);
  // اللوحة والصينية لازم يبانوا الاتنين في الشاشة من غير سكرول، لأن السحب بيقفل السكرول
  useEffect(() => { const f = () => setW(Math.max(220, Math.min(420, innerW(wrap.current?.parentElement), (innerHeight - 245) / 1.8))); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const S = W / N, pad = S * 0.32, trayTop = W + 18 + pad * 0.6;
  // الصينية: القطع متوزّعة صفوف وأعمدة من غير ما تغطّي بعض كتير
  const tcols = Math.max(2, Math.min(N * N, Math.floor(W / (S * 0.74)))), trows = Math.ceil((N * N) / tcols), trayH = trows * S * 0.62 + S * 0.45 + pad;
  const [seed, setSeed] = useState(0);
  const edges = useMemo(() => makeEdges(N), [N, seed]);
  const paths = useMemo(() => edges.map((e) => piecePath(e, S)), [edges, S]);
  const [pos, setPos] = useState([]), [done, setDone] = useState([]), [z, setZ] = useState([]), [ghost, setGhost] = useState(true), [moves, setMoves] = useState(0);
  const t0 = useRef(Date.now()), [secs, setSecs] = useState(0);
  // القطع بتبدأ متلخبطة في الصينية تحت اللوحة
  useEffect(() => {
    const order = shuffle([...Array(N * N).keys()]);
    const cols = tcols, rows = trows;
    const cw = (W - S) / Math.max(1, cols - 1), rh = (trayH - pad - S) / Math.max(1, rows - 1);
    const p = []; order.forEach((k, i) => { p[k] = { x: Math.min(W - S, (i % cols) * cw + rnd(-4, 4)), y: trayTop + pad * 0.4 + Math.min(trayH - S - pad, Math.floor(i / cols) * rh + rnd(-4, 4)) }; });
    setPos(p.map((q) => ({ x: Math.max(0, q.x), y: q.y }))); setDone([]); setZ([...Array(N * N).keys()]); setMoves(0); t0.current = Date.now(); setSecs(0);
  }, [N, seed, W]);
  const won = done.length === N * N && N > 0 && pos.length > 0;
  useEffect(() => { if (won) return; const t = setInterval(() => setSecs(Math.floor((Date.now() - t0.current) / 1000)), 1000); return () => clearInterval(t); }, [won]);
  useEffect(() => { if (won) { sfx.good(); say('الصورة رجعت كاملة! شاطر'); onWin(); } }, [won]);

  const drag = useRef(null), live = useRef([]);
  live.current = pos;
  const down = (k) => (e) => {
    if (done.includes(k)) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    const box = wrap.current.getBoundingClientRect();
    drag.current = { k, ox: e.clientX - box.left - pos[k].x, oy: e.clientY - box.top - pos[k].y };
    setZ((zz) => [...zz.filter((x) => x !== k), k]); sfx.tap();
  };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const box = wrap.current.getBoundingClientRect();
    const x = Math.max(-S * 0.3, Math.min(W - S * 0.7, e.clientX - box.left - d.ox)), y = Math.max(-S * 0.3, Math.min(trayTop + trayH - S * 0.5, e.clientY - box.top - d.oy));
    const q = [...live.current]; q[d.k] = { x, y }; live.current = q; setPos(q);
  };
  const up = () => {
    const d = drag.current; if (!d) return; drag.current = null; setMoves((m) => m + 1);
    const k = d.k, tx = (k % N) * S, ty = Math.floor(k / N) * S, p = live.current[k];
    if (Math.hypot(p.x - tx, p.y - ty) < S * 0.3) { const a = [...live.current]; a[k] = { x: tx, y: ty }; live.current = a; setPos(a); setDone((l) => [...l, k]); sfx.drop(); }
  };
  const mm = Math.floor(secs / 60), ss = secs % 60;
  const href = img.startsWith('data:') ? img : A(img);
  return (
    <>
      <div style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#5D6CA0', fontSize: 14 }}>
        <span className="chip">⏱ {ar(mm)}:{ar(String(ss).padStart(2, '0'))}</span>
        <span className="chip">✋ {ar(moves)}</span>
        <span className="chip">🧩 {ar(done.length)}/{ar(N * N)}</span>
        <button type="button" onClick={() => setGhost(!ghost)} className="chip" style={{ border: 0, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, background: ghost ? '#7B5CE0' : '#fff', color: ghost ? '#fff' : '#7B5CE0' }}>👁 مساعدة</button>
      </div>
      <div ref={wrap} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ position: 'relative', width: W, maxWidth: '100%', alignSelf: 'center', height: won ? W + 10 : trayTop + trayH, transition: 'height .5s', touchAction: won ? 'auto' : 'none' }}>
        {/* اللوحة: إطار خشب، والصورة باهتة لو المساعدة شغّالة، وأماكن القطع منقّطة */}
        <div style={{ position: 'absolute', left: -6, top: -6, width: W + 12, height: W + 12, borderRadius: 18, background: 'linear-gradient(135deg,#E9C38B,#C98F4E)', boxShadow: '0 6px 0 #9C6A33, inset 0 2px 0 #F5DDB4' }} />
        <svg width={W} height={W} style={{ position: 'absolute', left: 0, top: 0, borderRadius: 12, background: '#FFF8EC' }}>
          {ghost && <image href={href} x={0} y={0} width={W} height={W} preserveAspectRatio="xMidYMid slice" opacity={0.22} />}
          {paths.map((d, k) => <path key={k} d={d} transform={`translate(${(k % N) * S},${Math.floor(k / N) * S})`} fill="none" stroke="#C9A06A" strokeWidth={1.2} strokeDasharray="4 4" />)}
        </svg>
        {!won && <div style={{ position: 'absolute', left: 0, right: 0, top: trayTop - 4, height: trayH + 8, borderRadius: 18, background: 'rgba(255,255,255,.55)', border: '2px dashed rgba(123,92,224,.25)' }} />}
        {pos.length === N * N && z.map((k) => {
          const ok = done.includes(k), c = k % N, r = Math.floor(k / N);
          return (
            <svg key={seed + '-' + k} width={S + pad * 2} height={S + pad * 2} onPointerDown={down(k)}
              style={{ position: 'absolute', left: pos[k].x - pad, top: pos[k].y - pad, overflow: 'visible', cursor: ok ? 'default' : 'grab', touchAction: 'none', pointerEvents: ok ? 'none' : 'auto', zIndex: ok ? 1 : 2, filter: ok ? 'none' : 'drop-shadow(0 3px 3px rgba(34,48,106,.35))', transition: drag.current?.k === k ? 'none' : 'left .18s, top .18s' }}>
              <defs><clipPath id={`jp${seed}-${N}-${k}`}><path d={paths[k]} transform={`translate(${pad},${pad})`} /></clipPath></defs>
              <image href={href} x={pad - c * S} y={pad - r * S} width={W} height={W} preserveAspectRatio="xMidYMid slice" clipPath={`url(#jp${seed}-${N}-${k})`} style={{ pointerEvents: 'none' }} />
              <path d={paths[k]} transform={`translate(${pad},${pad})`} fill="none" stroke={ok ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.85)'} strokeWidth={ok ? 0.8 : 1.6} />
            </svg>
          );
        })}
        {won && <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} transition={{ duration: 1.2 }} style={{ position: 'absolute', left: 0, top: 0, width: W, height: W, borderRadius: 12, background: 'radial-gradient(circle, #fff, transparent 70%)', pointerEvents: 'none', zIndex: 5 }} />}
      </div>
      {won && <Win text={`برافو! رجّعت الصورة في ${ar(mm)}:${ar(String(ss).padStart(2, '0'))} بـ ${ar(moves)} حركة`} again={() => setSeed(seed + 1)} more={nextLevel} />}
    </>
  );
}

export default function Jigsaw({ arg, back, go }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const [N, setN] = useState(age === '4-6' ? 2 : age === '7-9' ? 3 : 4);
  const [photos, setPhotos] = useState(loadPhotos), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const fileRef = useRef(null), camRef = useRef(null);
  const id = (arg || '').split('/')[1];
  const img = id ? (id.startsWith('p') ? photos.find((p) => p.id === id)?.src : SCENES.find((s) => s.id === id)?.src) : null;
  const addPhoto = async (e) => {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
    setBusy(true); setMsg('');
    try {
      let src = await squareImage(f, 900);
      const item = { id: 'p' + Date.now().toString(36), src };
      let l = [item, ...photos].slice(0, 8);
      if (!savePhotos(l)) { src = await squareImage(f, 600); item.src = src; l = [item, ...photos].slice(0, 5); if (!savePhotos(l)) { l = [item]; savePhotos(l); } }
      setPhotos(l); sfx.pop(); go('games', 'jigsaw/' + item.id);
    } catch (err) { setMsg('مقدرناش نفتح الصورة دي، جرّب صورة تانية'); }
    setBusy(false);
  };
  const del = (pid) => { const l = photos.filter((p) => p.id !== pid); setPhotos(l); savePhotos(l); sfx.back(); };

  if (img) return (
    <div className="screen" style={{ gap: 10 }}>
      <Head title="البازل" sub="اسحب كل قطعة لمكانها" back={back} />
      <Chips items={LEVELS} value={N} onPick={(v) => { sfx.tap(); setN(v); }} />
      <Board key={id + N} img={img} N={N} back={back} onWin={() => win('puzzle')} nextLevel={N < 5 ? () => setN(N + 1) : null} />
    </div>
  );
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title="البازل 🧩" sub="اختار صورة وعدد القطع" back={back} />
      <Chips items={LEVELS} value={N} onPick={(v) => { sfx.tap(); setN(v); }} />
      <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(120deg,#7B5CE0,#B59BFF 60%,#FF89B5)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 36 }}>📸</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 19, fontWeight: 800 }}>بازل من صورتك</div><div style={{ fontSize: 13, fontWeight: 700, opacity: 0.95 }}>صوّر أو اختار صورة، وإحنا نقطّعها بازل — الصورة بتفضل على موبايلك</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" disabled={busy} onClick={() => camRef.current?.click()} style={{ flex: 1, border: 0, borderRadius: 14, padding: 10, background: '#fff', color: '#7B5CE0', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>📷 صوّر</button>
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} style={{ flex: 1, border: 0, borderRadius: 14, padding: 10, background: '#fff', color: '#7B5CE0', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>🖼 من الصور</button>
        </div>
        {busy && <div style={{ fontWeight: 800, textAlign: 'center' }}>بنجهّز البازل…</div>}
        {msg && <div style={{ fontWeight: 800, textAlign: 'center', background: 'rgba(0,0,0,.2)', borderRadius: 10, padding: 4 }}>{msg}</div>}
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={addPhoto} style={{ display: 'none' }} />
        <input ref={fileRef} type="file" accept="image/*" onChange={addPhoto} style={{ display: 'none' }} />
      </div>
      {photos.length > 0 && <h2 style={{ position: 'relative', fontSize: 19, fontWeight: 800 }}>صوري</h2>}
      {photos.length > 0 && <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {photos.map((p) => (
          <div key={p.id} style={{ position: 'relative' }}>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => { sfx.pop(); go('games', 'jigsaw/' + p.id); }} className="card" style={{ padding: 3, border: 0, cursor: 'pointer', width: '100%', aspectRatio: '1' }}>
              <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
            </motion.button>
            <button type="button" onClick={() => del(p.id)} aria-label="امسح الصورة" style={{ position: 'absolute', top: -6, left: -6, width: 28, height: 28, borderRadius: 14, border: '2px solid #fff', background: '#E5484D', color: '#fff', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>))}
      </div>}
      <h2 style={{ position: 'relative', fontSize: 19, fontWeight: 800 }}>صور سراج</h2>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {SCENES.map((s, k) => (
          <motion.button key={s.id} type="button" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }} whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('games', 'jigsaw/' + s.id); }} className="card"
            style={{ padding: 4, border: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'inherit' }}>
            <span style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', display: 'block' }}>
              <img src={A(s.src)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}><path d="M50 0V100M0 50H100" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#26336B' }}>{s.t}</span>
          </motion.button>))}
      </div>
    </div>
  );
}
