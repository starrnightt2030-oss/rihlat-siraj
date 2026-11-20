// المتاهة: سراج لازم يوصل للمسجد، ويلمّ النجوم في السكة. كل متاهة بتتولّد جديدة.
// الطفل يسحب سراج بصباعه في الممرات، أو يستخدم الأسهم.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { SCENE_LINES } from '../../data/playData';
import { Head, Chips, Win, Img, ar, shuffle, innerW } from './common';

const LV = [{ id: 6, t: 'سهل', d: '٦×٦' }, { id: 9, t: 'متوسط', d: '٩×٩' }, { id: 12, t: 'صعب', d: '١٢×١٢' }];
const GOALS = [{ src: 'stickers/mosque', n: 'المسجد' }, { src: 'stickers/kaaba', n: 'الكعبة' }, { src: 'stickers/lighthouse', n: 'المنارة' }, { src: 'rewards/chest', n: 'الكنز' }];

// متاهة بخوارزمية الحفر بالرجوع (كل خانة ليها جدران: فوق، يمين، تحت، شمال)
function makeMaze(N) {
  const cells = [...Array(N * N)].map(() => ({ w: [1, 1, 1, 1], v: false }));
  const D = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
  const st = [0]; cells[0].v = true;
  while (st.length) {
    const c = st[st.length - 1], x = c % N, y = Math.floor(c / N);
    const nb = shuffle(D).filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < N && !cells[ny * N + nx].v; });
    if (!nb.length) { st.pop(); continue; }
    const [dx, dy, w, ow] = nb[0], n = (y + dy) * N + x + dx;
    cells[c].w[w] = 0; cells[n].w[ow] = 0; cells[n].v = true; st.push(n);
  }
  return cells;
}
const open = (cells, N, a, b) => { const ax = a % N, ay = Math.floor(a / N), bx = b % N, by = Math.floor(b / N);
  if (bx === ax + 1 && by === ay) return !cells[a].w[1]; if (bx === ax - 1 && by === ay) return !cells[a].w[3];
  if (by === ay + 1 && bx === ax) return !cells[a].w[2]; if (by === ay - 1 && bx === ax) return !cells[a].w[0]; return false; };

export default function Maze({ back }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const ref = useRef(null), board = useRef(null);
  const [W, setW] = useState(320);
  useEffect(() => { const f = () => setW(Math.max(240, Math.min(430, innerW(ref.current?.parentElement), innerHeight - 330))); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const [N, setN] = useState(age === '4-6' ? 6 : 9), [seed, setSeed] = useState(0);
  const cells = useMemo(() => makeMaze(N), [N, seed]);
  const goal = useMemo(() => GOALS[seed % GOALS.length], [seed]);
  const stars = useMemo(() => shuffle([...Array(N * N).keys()].filter((k) => k > N && k < N * N - N)).slice(0, 3), [N, seed]);
  const [at, setAt] = useState(0), [trail, setTrail] = useState([0]), [got, setGot] = useState([]);
  useEffect(() => { setAt(0); setTrail([0]); setGot([]); }, [N, seed]);
  useEffect(() => { const t = setTimeout(() => say(SCENE_LINES.maze), 400); return () => clearTimeout(t); }, []);
  const S = W / N, end = N * N - 1, won = at === end;
  useEffect(() => { if (won) { sfx.good(); win('maze'); } }, [won]);
  const step = (to) => {
    if (won || !open(cells, N, at, to)) return false;
    setAt(to); setTrail((t) => (t.length > 1 && t[t.length - 2] === to ? t.slice(0, -1) : [...t, to]));
    if (stars.includes(to) && !got.includes(to)) { setGot((g) => [...g, to]); sfx.sparkle(); } else sfx.tap();
    return true;
  };
  const dir = (dx, dy) => { const x = at % N, y = Math.floor(at / N), nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; if (!step(ny * N + nx)) sfx.soft(); };
  // السحب: لو صباعك دخل خانة جنب سراج والطريق مفتوح، سراج يتحرك لها
  const drag = useRef(false), cur = useRef(0); cur.current = at;
  const toward = (e) => {
    const b = board.current.getBoundingClientRect(), x = Math.floor((e.clientX - b.left) / S), y = Math.floor((e.clientY - b.top) / S);
    if (x < 0 || y < 0 || x >= N || y >= N) return; const c = y * N + x; if (c === cur.current) return;
    const ax = cur.current % N, ay = Math.floor(cur.current / N);
    if (Math.abs(x - ax) + Math.abs(y - ay) === 1 && open(cells, N, cur.current, c)) { cur.current = c; step(c); }
  };
  const walls = useMemo(() => { let d = ''; cells.forEach((c, i) => { const x = (i % N) * S, y = Math.floor(i / N) * S;
    if (c.w[0]) d += `M${x},${y}h${S}`; if (c.w[3]) d += `M${x},${y}v${S}`; if (i % N === N - 1 && c.w[1]) d += `M${x + S},${y}v${S}`; if (i >= N * (N - 1) && c.w[2]) d += `M${x},${y + S}h${S}`; }); return d; }, [cells, S]);
  const cx = (k) => (k % N) * S + S / 2, cy = (k) => Math.floor(k / N) * S + S / 2;
  const arrow = (t, dx, dy, area) => <button type="button" onClick={() => dir(dx, dy)} style={{ gridArea: area, width: 54, height: 54, borderRadius: 18, border: 0, background: '#fff', boxShadow: '0 4px 0 rgba(34,48,106,.15)', fontSize: 24, cursor: 'pointer', color: '#2C6BC4' }}>{t}</button>;
  return (
    <div className="screen" style={{ gap: 10 }}>
      <Head title="المتاهة 🌀" sub={`ساعد سراج يوصل لـ${goal.n} ويلمّ النجوم`} back={back} tone="mint" />
      <Chips items={LV} value={N} onPick={(v) => { sfx.tap(); setN(v); }} c="#2C6BC4" />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 8 }}><span className="chip">⭐ {ar(got.length)} من ٣</span><span className="chip">👣 {ar(trail.length - 1)}</span></div>
      <div ref={ref} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div ref={board} onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); toward(e); }} onPointerMove={(e) => drag.current && toward(e)} onPointerUp={() => { drag.current = false; }}
          style={{ position: 'relative', width: W, height: W, borderRadius: 18, background: 'linear-gradient(160deg,#E8F8EE,#CFEFDD)', boxShadow: '0 0 0 6px #fff, 0 8px 18px rgba(34,48,106,.18)', touchAction: 'none' }}>
          <svg width={W} height={W} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <polyline points={trail.map((k) => `${cx(k)},${cy(k)}`).join(' ')} fill="none" stroke="#F5A623" strokeWidth={Math.max(4, S * 0.18)} strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            <path d={walls} stroke="#1F8A61" strokeWidth={Math.max(4, S * 0.16)} strokeLinecap="round" fill="none" />
            <path d={walls} stroke="#7FD9A8" strokeWidth={Math.max(1.5, S * 0.05)} strokeLinecap="round" fill="none" transform="translate(-1,-1)" />
          </svg>
          {stars.filter((k) => !got.includes(k)).map((k) => <motion.div key={k} animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', left: cx(k) - S * 0.3, top: cy(k) - S * 0.3, width: S * 0.6, height: S * 0.6 }}><Img src="rewards/star" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></motion.div>)}
          <Img src={goal.src} style={{ position: 'absolute', left: cx(end) - S * 0.45, top: cy(end) - S * 0.45, width: S * 0.9, height: S * 0.9, objectFit: 'contain' }} />
          <motion.div animate={{ left: cx(at) - S * 0.42, top: cy(at) - S * 0.46 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} style={{ position: 'absolute', width: S * 0.84, height: S * 0.84, pointerEvents: 'none', zIndex: 3 }}>
            <Img src={won ? 'characters/siraj/celebrate' : 'characters/siraj/run'} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }} />
          </motion.div>
        </div>
      </div>
      {!won && <div style={{ position: 'relative', display: 'grid', gridTemplateAreas: '". u ." "r . l" ". d ."', gap: 4, justifyContent: 'center' }}>
        {arrow('▲', 0, -1, 'u')}{arrow('▶', 1, 0, 'r')}{arrow('◀', -1, 0, 'l')}{arrow('▼', 0, 1, 'd')}
      </div>}
      {won && <Win text={`وصلت لـ${goal.n}! ولمّيت ${ar(got.length)} نجوم`} again={() => setSeed(seed + 1)} more={N < 12 ? () => setN(N === 6 ? 9 : 12) : null} />}
    </div>
  );
}
