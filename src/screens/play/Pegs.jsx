// لوحة «كل حاجة في مكانها» زي اللوح الخشب: الحروف والأرقام والأشكال، الطفل يسحب القطعة لمكانها وسراج ينطقها
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { QAIDA } from '../../data/qaida';
import { PEG_NUM_WORDS, PEG_SHAPES, PEG_DONE } from '../../data/pegs';
import { Head, Chips, Win, ar, shuffle, rnd, innerW } from './common';

const PAINT = ['#E5484D', '#F5A623', '#2FB383', '#3A8FE0', '#7B5CE0', '#E0609E', '#1F8FA6', '#E07F1E', '#4FCB6B', '#FF7E6B'];
const LETTERS = QAIDA[0].tiles;
const BOARDS = {
  letters: { t: 'لوحة الحروف', sets: [0, 7, 14, 21].map((a, k) => ({ id: k, t: LETTERS[a].t + ' – ' + LETTERS[a + 6].t, items: LETTERS.slice(a, a + 7).map((x, i) => ({ id: a + i, label: x.t, s: x.s })) })), cols: 4 },
  numbers: { t: 'لوحة الأرقام', sets: [{ id: 0, t: '١ – ١٠', a: 1 }, { id: 1, t: '١١ – ٢٠', a: 11 }].map((x) => ({ ...x, items: [...Array(10)].map((_, i) => ({ id: x.a + i, label: ar(x.a + i), s: PEG_NUM_WORDS[x.a + i - 1] })) })), cols: 5 },
  shapes: { t: 'لوحة الأشكال', sets: [{ id: 0, t: 'الأشكال', items: PEG_SHAPES.map((x, i) => ({ id: i, shape: x.id, s: x.n })) }], cols: 4 },
};

// الأشكال مرسومة SVG في مربع ١٠٠×١٠٠
const SHAPE = {
  circle: <circle cx="50" cy="50" r="40" />, square: <rect x="14" y="14" width="72" height="72" rx="6" />,
  triangle: <polygon points="50,10 92,86 8,86" />, star: <polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" />,
  heart: <path d="M50 88 C20 64 6 46 16 28 C26 12 44 16 50 30 C56 16 74 12 84 28 C94 46 80 64 50 88Z" />, moon: <path d="M62 8 A42 42 0 1 0 92 66 A34 34 0 1 1 62 8Z" />,
  hexagon: <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" />, diamond: <polygon points="50,4 92,50 50,96 8,50" />,
};

function Piece({ it, size, color, font, hole }) {
  if (it.shape) return (
    <svg viewBox="0 0 100 100" width={size * 0.82} height={size * 0.82} style={{ overflow: 'visible', filter: hole ? 'none' : 'drop-shadow(0 4px 0 rgba(0,0,0,.22))' }}>
      <g fill={hole ? '#8A5A2B' : color} stroke={hole ? '#6B4220' : 'rgba(255,255,255,.55)'} strokeWidth={hole ? 3 : 4} style={hole ? { filter: 'url(#inset)' } : null}>{SHAPE[it.shape]}</g>
      {!hole && <circle cx="50" cy="50" r="8" fill="#F4E3C3" stroke="#B98A52" strokeWidth="3" />}
    </svg>
  );
  return (
    <span style={{ fontSize: size * (it.label.length > 1 ? 0.5 : 0.66), fontWeight: 800, lineHeight: 1, color: hole ? '#8A5A2B' : color, position: 'relative', display: 'inline-block',
      WebkitTextStroke: hole ? '0' : '2px rgba(255,255,255,.75)', paintOrder: 'stroke fill',
      textShadow: hole ? '0 2px 0 rgba(255,255,255,.45), 0 -2px 2px rgba(60,30,5,.55)' : '0 4px 0 rgba(0,0,0,.2)' }}>
      {it.label}
    </span>
  );
}

function Board({ kind, set, onWin, next }) {
  const B = BOARDS[kind], items = set.items, cols = B.cols;
  const wrap = useRef(null);
  const [W, setW] = useState(340);
  useEffect(() => { const f = () => setW(Math.min(430, innerW(wrap.current?.parentElement))); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const rows = Math.ceil(items.length / cols), cell = W / cols, boardH = rows * cell + 24, trayTop = boardH + 16;
  const [seed, setSeed] = useState(0);
  const colors = useMemo(() => shuffle(PAINT), [seed, set.id]);
  const slots = useMemo(() => shuffle(items.map((_, i) => i)), [seed, set.id]); // مكان كل قطعة في اللوحة متلخبط عشان مش يحفظ الترتيب
  const slotXY = (i) => { const p = slots.indexOf(i); return { x: (p % cols) * cell, y: 12 + Math.floor(p / cols) * cell }; };
  const tcols = Math.min(items.length, Math.floor(W / (cell * 0.86))), trows = Math.ceil(items.length / tcols), trayH = trows * cell * 0.92 + 10;
  const home = useMemo(() => { const o = shuffle(items.map((_, i) => i)), h = []; o.forEach((k, i) => { h[k] = { x: Math.min(W - cell, (i % tcols) * ((W - cell) / Math.max(1, tcols - 1)) + rnd(-4, 4)), y: trayTop + Math.floor(i / tcols) * cell * 0.92 + rnd(-3, 3) }; }); return h; }, [seed, set.id, W]);
  const [pos, setPos] = useState(home), [done, setDone] = useState([]), [bad, setBad] = useState(-1), [z, setZ] = useState([]);
  useEffect(() => { setPos(home); setDone([]); setZ(items.map((_, i) => i)); }, [home]);
  const live = useRef(home); live.current = pos;
  const drag = useRef(null);
  const won = done.length === items.length;
  useEffect(() => { if (won) { sfx.good(); setTimeout(() => say(PEG_DONE), 500); onWin(); } }, [won]);
  const down = (k) => (e) => {
    if (done.includes(k)) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId);
    const b = wrap.current.getBoundingClientRect(); drag.current = { k, ox: e.clientX - b.left - live.current[k].x, oy: e.clientY - b.top - live.current[k].y };
    setZ((zz) => [...zz.filter((x) => x !== k), k]); sfx.tap(); setBad(-1);
  };
  const move = (e) => {
    const d = drag.current; if (!d) return; const b = wrap.current.getBoundingClientRect();
    const q = [...live.current]; q[d.k] = { x: Math.max(-cell * 0.2, Math.min(W - cell * 0.8, e.clientX - b.left - d.ox)), y: Math.max(0, Math.min(trayTop + trayH - cell * 0.6, e.clientY - b.top - d.oy)) }; live.current = q; setPos(q);
  };
  const up = () => {
    const d = drag.current; if (!d) return; drag.current = null;
    const k = d.k, p = live.current[k], t = slotXY(k);
    if (Math.hypot(p.x - t.x, p.y - t.y) < cell * 0.42) {
      const q = [...live.current]; q[k] = t; live.current = q; setPos(q); setDone((l) => [...l, k]); sfx.drop(); say(items[k].s);
    } else if (p.y < boardH) { // حطها على مكان غلط: ترجع للصينية
      setBad(k); sfx.soft(); const q = [...live.current]; q[k] = home[k]; live.current = q; setPos(q);
    }
  };
  return (
    <>
      <div ref={wrap} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ position: 'relative', width: W, maxWidth: '100%', alignSelf: 'center', height: won ? boardH : trayTop + trayH, transition: 'height .5s', touchAction: won ? 'auto' : 'none' }}>
        <svg width="0" height="0" style={{ position: 'absolute' }}><filter id="inset"><feOffset dx="0" dy="3" /><feGaussianBlur stdDeviation="2" result="b" /><feComposite operator="out" in="SourceGraphic" in2="b" result="s" /><feFlood floodColor="#3B2410" floodOpacity=".7" /><feComposite operator="in" in2="s" /><feComposite operator="over" in2="SourceGraphic" /></filter></svg>
        {/* اللوح الخشب */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: boardH, borderRadius: 20, background: 'repeating-linear-gradient(92deg, rgba(120,72,30,.07) 0 3px, transparent 3px 11px), linear-gradient(160deg,#F3D7A8,#E2B477 55%,#D9A55F)', boxShadow: '0 7px 0 #A8733A, inset 0 2px 0 rgba(255,255,255,.5), inset 0 -3px 6px rgba(120,70,20,.25)' }} />
        {[[14, 14], [W - 22, 14], [14, boardH - 22], [W - 22, boardH - 22]].map(([x, y], i) => <span key={i} style={{ position: 'absolute', left: x, top: y, width: 8, height: 8, borderRadius: 4, background: '#9C6A33', boxShadow: 'inset 0 1px 1px rgba(0,0,0,.5)' }} />)}
        {items.map((it, i) => { const s = slotXY(i);
          return <div key={'h' + i} data-slot={i} style={{ position: 'absolute', left: s.x, top: s.y, width: cell, height: cell, display: 'grid', placeItems: 'center', opacity: done.includes(i) ? 0 : 1, transition: 'opacity .2s' }}><Piece it={it} size={cell} hole font={B.font} /></div>; })}
        {!won && <div style={{ position: 'absolute', left: 0, right: 0, top: trayTop - 6, height: trayH + 6, borderRadius: 18, background: 'rgba(255,255,255,.6)', border: '2px dashed rgba(169,115,58,.35)' }} />}
        {z.map((k) => { const it = items[k], ok = done.includes(k), p = pos[k] || home[k];
          return (
            <motion.div key={seed + '-' + set.id + '-' + k} data-piece={k} onPointerDown={down(k)} animate={bad === k ? { x: [0, -8, 8, -4, 0] } : ok ? { scale: [1, 1.18, 1] } : {}} transition={{ duration: 0.35 }}
              style={{ position: 'absolute', left: p.x, top: p.y, width: cell, height: cell, display: 'grid', placeItems: 'center', cursor: ok ? 'default' : 'grab', touchAction: 'none', zIndex: ok ? 1 : 3, pointerEvents: ok ? 'none' : 'auto', transition: drag.current?.k === k ? 'none' : 'left .22s, top .22s' }}>
              <Piece it={it} size={cell} color={colors[k % colors.length]} font={B.font} />
            </motion.div>
          ); })}
      </div>
      {won && <Win text={`برافو! كل حاجة رجعت مكانها`} again={() => setSeed(seed + 1)} more={next} moreText="اللوحة اللي بعدها ◀" />}
    </>
  );
}

export default function Pegs({ kind, back }) {
  const win = useStore((s) => s.win);
  const B = BOARDS[kind];
  const [si, setSi] = useState(0);
  const set = B.sets[si];
  useEffect(() => { const t = setTimeout(() => say(kind === 'letters' ? 'حط كل حرف في مكانه' : kind === 'numbers' ? 'حط كل رقم في مكانه' : 'حط كل شكل في مكانه'), 400); return () => clearTimeout(t); }, [kind]);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title={B.t} sub="اسحب كل قطعة لمكانها في اللوحة" back={back} tone="warm" />
      {B.sets.length > 1 && <Chips items={B.sets.map((x) => ({ id: x.id, t: x.t }))} value={si} onPick={(v) => { sfx.tap(); setSi(v); }} c="#A8733A" />}
      <Board key={kind + si} kind={kind} set={set} onWin={() => win('pegs')} next={si < B.sets.length - 1 ? () => setSi(si + 1) : null} />
    </div>
  );
}
