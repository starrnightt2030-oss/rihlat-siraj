// ألعاب المشاهد: «أوجد الاختلافات» و«دوّر وانت تلاقي». كل مرة بتتعمل جديدة بالكود من رسومات التطبيق.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { SCENE_LINES } from '../../data/playData';
import { Head, Chips, Win, Img, SCENES, THINGS, A, ar, shuffle, rnd, pick, innerW } from './common';

// أماكن عشوائية متباعدة جوه المربع (من ٠ لـ١)
function spots(n, gap = 0.2, m = 0.1) {
  const out = []; let tries = 0;
  while (out.length < n && tries++ < 3000) { const p = { x: rnd(m, 1 - m), y: rnd(m, 1 - m) }; if (out.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > gap)) out.push(p); }
  return out;
}
const useSize = (ref, fit) => {
  const [W, setW] = useState(320);
  useEffect(() => { const f = () => setW(Math.max(220, Math.min(430, innerW(ref.current?.parentElement), fit()))); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  return W;
};
const Ring = ({ x, y, r, c = '#2FB383' }) => <motion.span initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `4px solid ${c}`, boxShadow: '0 0 0 3px #fff, 0 0 12px rgba(0,0,0,.25)', pointerEvents: 'none', zIndex: 4 }} />;

// ---------- أوجد الاختلافات ----------
const DIFF_LV = [{ id: 3, t: 'سهل', d: '٣ اختلافات' }, { id: 5, t: 'متوسط', d: '٥ اختلافات' }, { id: 7, t: 'صعب', d: '٧ اختلافات' }];
function makeDiffs(n) {
  const kinds = shuffle(['add', 'remove', 'color', 'swap', 'add', 'color', 'remove', 'swap']).slice(0, n);
  return spots(n, 0.22, 0.12).map((p, i) => {
    const k = kinds[i], [a, b] = shuffle(THINGS);
    return { ...p, k, a, b, s: rnd(0.11, 0.15), rot: rnd(-15, 15), hue: rnd(110, 230), r: rnd(0.07, 0.09) };
  });
}
function Layer({ img, W, diffs, side }) {
  return (
    <>
      <img src={A(img)} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: W, height: W, objectFit: 'cover', borderRadius: 14 }} />
      {diffs.map((d, i) => {
        const x = d.x * W, y = d.y * W;
        if (d.k === 'color') return side === 'b' ? <span key={i} style={{ position: 'absolute', left: x - d.r * W, top: y - d.r * W, width: d.r * W * 2, height: d.r * W * 2, borderRadius: '50%', backgroundImage: `url(${A(img)})`, backgroundSize: `${W}px ${W}px`, backgroundPosition: `${-(x - d.r * W)}px ${-(y - d.r * W)}px`, filter: `hue-rotate(${d.hue}deg) saturate(1.6)`, WebkitMaskImage: 'radial-gradient(circle, #000 62%, transparent 72%)', maskImage: 'radial-gradient(circle, #000 62%, transparent 72%)' }} /> : null;
        const show = d.k === 'swap' ? (side === 'a' ? d.a : d.b) : (d.k === 'add' ? side === 'b' : side === 'a') ? d.a : null;
        return show ? <Img key={i} src={show.src} style={{ position: 'absolute', left: x - d.s * W / 2, top: y - d.s * W / 2, width: d.s * W, height: d.s * W, objectFit: 'contain', transform: `rotate(${d.rot}deg)`, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.25))' }} /> : null;
      })}
    </>
  );
}
export function SpotDiff({ back }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const ref = useRef(null);
  const W = useSize(ref, () => (innerHeight - 250) / 2);
  const [n, setN] = useState(age === '4-6' ? 3 : 5), [seed, setSeed] = useState(0);
  const img = useMemo(() => pick(SCENES.filter((s) => s.id !== 'kids')).src, [seed, n]);
  const diffs = useMemo(() => makeDiffs(n), [seed, n]);
  const [found, setFound] = useState([]), [miss, setMiss] = useState(null), [hint, setHint] = useState(null), [hints, setHints] = useState(2);
  useEffect(() => { setFound([]); setHint(null); setHints(2); }, [seed, n]);
  useEffect(() => { const t = setTimeout(() => say(SCENE_LINES.diff), 400); return () => clearTimeout(t); }, []);
  const won = found.length === n;
  useEffect(() => { if (won) { sfx.good(); win('diff'); } }, [won]);
  const tap = (e) => {
    if (won) return; const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / W, y = (e.clientY - b.top) / W;
    const i = diffs.findIndex((d, k) => !found.includes(k) && Math.hypot(d.x - x, d.y - y) < Math.max(0.09, d.r + 0.03, d.s * 0.6));
    if (i >= 0) { setFound((f) => [...f, i]); setHint(null); sfx.sparkle(); }
    else { setMiss({ x: x * W, y: y * W, side: e.currentTarget.dataset.side, t: Date.now() }); sfx.soft(); }
  };
  const useHint = () => { const i = diffs.findIndex((_, k) => !found.includes(k)); if (i < 0 || !hints) return; setHint(i); setHints(hints - 1); sfx.reveal(); };
  const pane = (side) => (
    <div data-side={side} onPointerDown={tap} style={{ position: 'relative', width: W, height: W, borderRadius: 16, boxShadow: '0 0 0 4px #fff, 0 6px 14px rgba(34,48,106,.18)', cursor: 'crosshair', touchAction: 'manipulation', overflow: 'hidden' }}>
      <Layer img={img} W={W} diffs={diffs} side={side} />
      {found.map((i) => <Ring key={i} x={diffs[i].x * W} y={diffs[i].y * W} r={Math.max(0.09, diffs[i].r + 0.02, diffs[i].s * 0.62) * W} />)}
      {hint !== null && <motion.span animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.4, 0.9] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', left: diffs[hint].x * W - 0.13 * W, top: diffs[hint].y * W - 0.13 * W, width: 0.26 * W, height: 0.26 * W, borderRadius: '50%', border: '4px dashed #F5A623', pointerEvents: 'none' }} />}
      <AnimatePresence>{miss && miss.side === side && <motion.span key={miss.t} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: miss.x - 16, top: miss.y - 16, fontSize: 28, color: '#E5484D', fontWeight: 800, pointerEvents: 'none' }}>✕</motion.span>}</AnimatePresence>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 10 }}>
      <Head title="أوجد الاختلافات 🔍" sub="دوس على أي حاجة مختلفة في أي صورة" back={back} tone="mint" />
      <Chips items={DIFF_LV} value={n} onPick={(v) => { sfx.tap(); setN(v); }} c="#1F8A61" />
      <div style={{ position: 'relative', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <span className="chip">✅ {ar(found.length)} من {ar(n)}</span>
        <button type="button" disabled={!hints || won} onClick={useHint} className="chip" style={{ border: 0, cursor: hints ? 'pointer' : 'default', fontFamily: 'inherit', fontWeight: 800, background: hints ? '#F5A623' : '#eee', color: hints ? '#fff' : '#999' }}>💡 تلميح ({ar(hints)})</button>
      </div>
      <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>{pane('a')}{pane('b')}</div>
      {won && <Win text={`برافو! لقيت الـ${ar(n)} اختلافات`} again={() => setSeed(seed + 1)} more={n < 7 ? () => setN(n === 3 ? 5 : 7) : null} />}
    </div>
  );
}

// ---------- دوّر وانت تلاقي ----------
const HID_LV = [{ id: 5, t: 'سهل', d: '٥ حاجات' }, { id: 7, t: 'متوسط', d: '٧ حاجات' }, { id: 9, t: 'صعب', d: '٩ حاجات' }];
export function Hidden({ back }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const ref = useRef(null);
  const W = useSize(ref, () => innerHeight - 330);
  const [n, setN] = useState(age === '4-6' ? 5 : 7), [seed, setSeed] = useState(0);
  const img = useMemo(() => pick(SCENES).src, [seed, n]);
  // الحاجات المستخبية: صغيرة ومايلة وشفافة شوية، والأصعب أصغر وأشفّ
  const items = useMemo(() => { const hard = n >= 9 ? 1 : n >= 7 ? 0.5 : 0, ts = shuffle(THINGS); return spots(n, 0.17, 0.08).map((p, i) => ({ ...p, t: ts[i % ts.length], s: rnd(0.095, 0.12) - hard * 0.02, rot: rnd(-35, 35), op: 0.97 - hard * rnd(0.05, 0.18), blend: hard >= 1 ? true : Math.random() < (hard ? 0.45 : 0.2) })); }, [seed, n]);
  const [found, setFound] = useState([]), [miss, setMiss] = useState(null);
  useEffect(() => setFound([]), [seed, n]);
  useEffect(() => { const t = setTimeout(() => say(SCENE_LINES.hidden), 400); return () => clearTimeout(t); }, []);
  const won = found.length === n;
  useEffect(() => { if (won) { sfx.good(); win('hidden'); } }, [won]);
  const tap = (e) => {
    if (won) return; const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / W, y = (e.clientY - b.top) / W;
    const i = items.findIndex((d, k) => !found.includes(k) && Math.hypot(d.x - x, d.y - y) < d.s * 0.7);
    if (i >= 0) { setFound((f) => [...f, i]); sfx.sparkle(); say(items[i].t.n); } else { setMiss({ x: x * W, y: y * W, t: Date.now() }); sfx.soft(); }
  };
  return (
    <div className="screen" style={{ gap: 10 }}>
      <Head title="دوّر وانت تلاقي 🔎" sub="الحاجات اللي تحت مستخبية في الصورة" back={back} tone="warm" />
      <Chips items={HID_LV} value={n} onPick={(v) => { sfx.tap(); setN(v); }} c="#E07F1E" />
      <div ref={ref} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div onPointerDown={tap} style={{ position: 'relative', width: W, height: W, borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 4px #fff, 0 6px 14px rgba(34,48,106,.18)', touchAction: 'manipulation' }}>
          <img src={A(img)} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {items.map((d, i) => (
            <motion.div key={seed + '-' + i} animate={found.includes(i) ? { scale: [1, 1.6, 0], opacity: [1, 1, 0] } : {}} transition={{ duration: 0.6 }}
              style={{ position: 'absolute', left: (d.x - d.s / 2) * W, top: (d.y - d.s / 2) * W, width: d.s * W, height: d.s * W, transform: `rotate(${d.rot}deg)`, opacity: d.op, mixBlendMode: d.blend ? 'multiply' : 'normal', pointerEvents: 'none' }}>
              <Img src={d.t.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>))}
          {found.map((i) => <Ring key={'r' + i} x={items[i].x * W} y={items[i].y * W} r={items[i].s * 0.62 * W} c="#F5A623" />)}
          <AnimatePresence>{miss && <motion.span key={miss.t} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: miss.x - 16, top: miss.y - 16, fontSize: 28, color: '#E5484D', fontWeight: 800, pointerEvents: 'none' }}>✕</motion.span>}</AnimatePresence>
        </div>
      </div>
      <div className="card" style={{ position: 'relative', padding: 8, display: 'grid', gridTemplateColumns: `repeat(${Math.min(n, 5)}, minmax(0,1fr))`, gap: 6 }}>
        {items.map((d, i) => { const ok = found.includes(i);
          return <motion.div key={i} animate={ok ? { scale: [1, 1.15, 1] } : {}} style={{ position: 'relative', borderRadius: 12, background: ok ? '#E3F7EE' : '#FFF6E8', padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: ok ? 0.75 : 1 }}>
            <Img src={d.t.src} style={{ height: 38, maxWidth: '100%', objectFit: 'contain' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#6D7896', textAlign: 'center', lineHeight: 1.2 }}>{d.t.n}</span>
            {ok && <span style={{ position: 'absolute', top: -4, left: -4, width: 20, height: 20, borderRadius: 10, background: '#2FB383', color: '#fff', fontSize: 12, display: 'grid', placeItems: 'center', fontWeight: 800 }}>✓</span>}
          </motion.div>; })}
      </div>
      {won && <Win text="برافو! لقيت كل الحاجات المستخبية" again={() => setSeed(seed + 1)} more={n < 9 ? () => setN(n + 2) : null} />}
    </div>
  );
}
