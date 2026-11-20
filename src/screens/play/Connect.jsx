// ألعاب «وصّل»: عمودين، الطفل يسحب خط من كارت للكارت اللي يناسبه (أو يدوس على الاتنين ورا بعض).
// وصّل الظل بصاحبه، ووصّل النبي بمعجزته.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { PROPHETS } from '../../data/people';
import { MIRACLES, CONNECT_LINES } from '../../data/playData';
import { Head, Chips, Win, Img, THINGS, shuffle, ar } from './common';

const LINE = ['#2FB383', '#3A8FE0', '#E07F1E', '#7B5CE0', '#E0609E', '#1F8FA6'];

function Connect({ pairs, renderA, renderB, onPair, onWin, again, more, moreText, done: doneText }) {
  const wrap = useRef(null), refs = useRef({});
  const right = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const [ok, setOk] = useState([]), [sel, setSel] = useState(null), [pen, setPen] = useState(null), [bad, setBad] = useState(null), [, tick] = useState(0);
  const won = ok.length === pairs.length;
  useEffect(() => { setOk([]); setSel(null); setPen(null); }, [pairs]);
  useEffect(() => { if (won) { sfx.good(); onWin?.(); } }, [won]);
  useLayoutEffect(() => { const f = () => tick((x) => x + 1); addEventListener('resize', f); const t = setTimeout(f, 60); return () => { removeEventListener('resize', f); clearTimeout(t); }; }, [pairs]);
  const c = (key) => { const el = refs.current[key], w = wrap.current; if (!el || !w) return null; const a = el.getBoundingClientRect(), b = w.getBoundingClientRect(); return { l: a.left - b.left, r: a.right - b.left, y: a.top - b.top + a.height / 2 }; };
  // الخط بيطلع من حافة الكارت اللي ناحية العمود التاني
  const end = (side, i) => { const p = c(side + i); if (!p) return null; return { x: side === 'a' ? p.l : p.r, y: p.y }; };
  const tryPair = (A, B) => {
    if (A === B) { setOk((l) => [...l, A]); setSel(null); sfx.sparkle(); onPair?.(pairs[A]); }
    else { setBad([A, B]); sfx.soft(); setSel(null); setTimeout(() => setBad(null), 650); }
  };
  const keyAt = (x, y) => { const el = document.elementFromPoint(x, y)?.closest('[data-k]'); return el ? el.getAttribute('data-k') : null; };
  const down = (side, i) => (e) => {
    if (ok.includes(i)) return; e.preventDefault(); wrap.current.setPointerCapture?.(e.pointerId);
    if (sel && sel.side !== side) { side === 'a' ? tryPair(i, sel.i) : tryPair(sel.i, i); return; }
    setSel({ side, i }); sfx.tap();
    const b = wrap.current.getBoundingClientRect(); setPen({ x: e.clientX - b.left, y: e.clientY - b.top, drag: false });
  };
  const move = (e) => { if (!pen || !sel) return; const b = wrap.current.getBoundingClientRect(); setPen({ x: e.clientX - b.left, y: e.clientY - b.top, drag: true }); };
  const up = (e) => {
    if (!pen || !sel) return; const k = keyAt(e.clientX, e.clientY); const wasDrag = pen.drag; setPen(null);
    if (!k) { if (wasDrag) setSel(null); return; }
    const side = k[0], i = +k.slice(1);
    if (side !== sel.side && !ok.includes(i)) { sel.side === 'a' ? tryPair(sel.i, i) : tryPair(i, sel.i); }
  };
  const curve = (p, q) => { const mx = (p.x + q.x) / 2; return `M${p.x},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`; };
  const from = sel && end(sel.side, sel.i);
  return (
    <>
      <div ref={wrap} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setPen(null)} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '22%', rowGap: 10, touchAction: 'none', userSelect: 'none' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 2 }}>
          {ok.map((i, n) => { const p = end('a', i), q = end('b', i); return p && q ? <motion.path key={i} d={curve(p, q)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} fill="none" stroke={LINE[i % LINE.length]} strokeWidth={6} strokeLinecap="round" /> : null; })}
          {bad && (() => { const p = end('a', bad[0]), q = end('b', bad[1]); return p && q ? <path d={curve(p, q)} fill="none" stroke="#E5484D" strokeWidth={5} strokeDasharray="8 7" strokeLinecap="round" /> : null; })()}
          {from && pen && pen.drag && <path d={curve(from, pen)} fill="none" stroke="#9AA3BD" strokeWidth={5} strokeDasharray="2 9" strokeLinecap="round" />}
        </svg>
        {pairs.map((_, row) => [0, 1].map((col) => {
          const side = col ? 'b' : 'a', i = col ? right[row] : row, on = ok.includes(i), picked = sel?.side === side && sel.i === i, wrong = bad && bad[col] === i;
          return (
            <motion.div key={side + i} data-k={side + i} ref={(el) => { refs.current[side + i] = el; }} onPointerDown={down(side, i)}
              animate={wrong ? { x: [0, -7, 7, -4, 0] } : on ? { scale: [1, 1.06, 1] } : { scale: picked ? 1.05 : 1 }} transition={{ duration: 0.35 }}
              className="card" style={{ position: 'relative', gridColumn: col + 1, gridRow: row + 1, minHeight: 78, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: on ? 'default' : 'pointer',
                outline: on ? `3px solid ${LINE[i % LINE.length]}` : picked ? '3px solid #7B5CE0' : 'none', background: on ? '#F3FFF8' : '#fff', opacity: on ? 0.92 : 1 }}>
              {col ? renderB(pairs[i], on) : renderA(pairs[i], on)}
              <span style={{ position: 'absolute', [col ? 'right' : 'left']: -7, top: '50%', marginTop: -7, width: 14, height: 14, borderRadius: 7, background: on ? LINE[i % LINE.length] : '#26336B', border: '3px solid #fff' }} />
            </motion.div>
          ); }))}
      </div>
      {won && <Win text={doneText} again={again} more={more} moreText={moreText} />}
    </>
  );
}

// وصّل الظل بصاحبه: سهل = حاجات مختلفة، صعب = نفس الشخصية في أوضاع مختلفة
const POSES = {
  siraj: ['wave', 'jump', 'run', 'fly', 'read', 'point', 'celebrate', 'pray'].map((p) => ({ id: 's' + p, src: 'characters/siraj/' + p })),
  bashir: ['fly', 'glide', 'land', 'point', 'read', 'run', 'walk', 'wave'].map((p) => ({ id: 'b' + p, src: 'characters/bashir/' + p })),
  mishmish: ['jump', 'play', 'run', 'sit', 'sleep', 'sneak', 'stretch', 'walk'].map((p) => ({ id: 'm' + p, src: 'characters/mishmish/' + p })),
};
const SH_LEVELS = [{ id: 'easy', t: 'سهل', d: 'حاجات مختلفة' }, { id: 'mid', t: 'متوسط', d: 'أكتر' }, { id: 'hard', t: 'صعب', d: 'نفس الشخصية' }];
export function Shadows({ back }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const [lv, setLv] = useState(age === '4-6' ? 'easy' : 'mid'), [seed, setSeed] = useState(0);
  const pairs = useMemo(() => {
    if (lv === 'hard') { const who = shuffle(Object.keys(POSES))[0]; return shuffle(POSES[who]).slice(0, 4); }
    return shuffle(THINGS).slice(0, lv === 'easy' ? 4 : 6);
  }, [lv, seed]);
  useEffect(() => { const t = setTimeout(() => say(CONNECT_LINES.shadow), 400); return () => clearTimeout(t); }, []);
  const pic = (p, dark) => <Img src={p.src} style={{ maxWidth: '100%', height: 64, objectFit: 'contain', filter: dark ? 'brightness(0) opacity(.82)' : 'drop-shadow(0 2px 2px rgba(0,0,0,.15))' }} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title="وصّل الظل بصاحبه 🌑" sub="اسحب خط من الظل للصورة بتاعته" back={back} tone="lilac" />
      <Chips items={SH_LEVELS} value={lv} onPick={(v) => { sfx.tap(); setLv(v); }} c="#26336B" />
      <Connect key={lv + seed} pairs={pairs} renderA={(p, on) => pic(p, !on)} renderB={(p) => pic(p, false)} onPair={(p) => p.n && say(p.n)}
        onWin={() => win('shadows')} again={() => setSeed(seed + 1)} done="برافو! عينك قوية — عرفت كل الظلال"
        more={lv !== 'hard' ? () => setLv(lv === 'easy' ? 'mid' : 'hard') : null} />
    </div>
  );
}

// وصّل النبي بمعجزته
export function Prophets({ back }) {
  const win = useStore((s) => s.win);
  const [seed, setSeed] = useState(0);
  const pairs = useMemo(() => shuffle(MIRACLES).slice(0, 5).map((m) => ({ ...m, p: PROPHETS.find((x) => x.id === m.id) })), [seed]);
  useEffect(() => { const t = setTimeout(() => say(CONNECT_LINES.prophets), 400); return () => clearTimeout(t); }, []);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title="وصّل النبي بمعجزته ✨" sub="كل نبي وحاجة ربنا كرّمه بيها" back={back} tone="mint" />
      <Connect key={seed} pairs={pairs}
        renderA={(m) => <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}><span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 17, background: 'linear-gradient(135deg,#FFE38A,#F2A93B)', color: '#7A4A0A', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 800, boxShadow: '0 2px 0 #C98A2B' }}>{m.p.n[0]}</span><span style={{ fontSize: 15, fontWeight: 800, color: '#1F8A61', lineHeight: 1.3 }}>{m.id === 'muhammad' ? 'سيدنا محمد ﷺ' : 'سيدنا ' + m.p.n}</span></div>}
        renderB={(m) => <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>{m.img ? <Img src={m.img} style={{ height: 46, objectFit: 'contain' }} /> : <span style={{ fontSize: 30 }}>{m.e}</span>}<span style={{ fontSize: 12, fontWeight: 800, color: '#26336B', lineHeight: 1.35 }}>{m.t}</span></div>}
        onPair={(m) => say(m.say)} onWin={() => win('prophets')} again={() => setSeed(seed + 1)} done="ما شاء الله! انت عارف معجزات الأنبياء" more={() => setSeed(seed + 1)} moreText="أنبياء تانيين ◀" />
    </div>
  );
}
