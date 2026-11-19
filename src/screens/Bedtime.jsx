// حكايات قبل النوم: سراج بيحكي المشاهد ورا بعض لوحده (من غير ضغط)، والحكاية ورا الحكاية،
// والشاشة بتهدى شوية بشوية، ومؤقت نوم، وفي الآخر «تصبح على خير»
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, I } from '../components/ui';
import { BEDTIME, BED_INTRO, BED_MORAL, BED_END } from '../data/bedtime';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush } from '../lib/voice';

const STARS = Array.from({ length: 40 }, (_, i) => { const r = (n) => { const v = Math.sin(n * 91.7 + i * 13.3) * 43758.5; return v - Math.floor(v); }; return { x: r(1) * 100, y: r(2) * 70, s: 1.5 + r(3) * 2.5, d: r(4) * 3 }; });
const BG = 'linear-gradient(180deg, #2E2A6E 0%, #4B3F99 55%, #7A63B8 100%)';
const TIMERS = [0, 10, 20, 30];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function Night({ children }) {
  return (
    <div className="screen" style={{ background: BG, color: '#fff', gap: 12 }}>
      {STARS.map((s, i) => <motion.span key={i} aria-hidden="true" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 2.5 + s.d, repeat: Infinity, delay: s.d }} style={{ position: 'absolute', left: s.x + '%', top: s.y + '%', width: s.s, height: s.s, borderRadius: 4, background: '#fff', boxShadow: '0 0 6px #fff' }} />)}
      <div aria-hidden="true" style={{ position: 'absolute', top: 8, left: 64, width: 44, height: 44, borderRadius: 22, boxShadow: '-10px 6px 0 0 #FFE9A8', transform: 'rotate(-20deg)', opacity: 0.9 }} />
      {children}
    </div>
  );
}

export default function Bedtime({ back }) {
  const [play, setPlay] = useState(null); // رقم الحكاية اللي بتبدأ منها
  const [timer, setTimer] = useState(20);
  if (play !== null) return <Player start={play} timer={timer} back={() => setPlay(null)} />;
  return (
    <Night>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back} style={{ background: '#ffffff22' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 27, fontWeight: 800 }}>حكايات قبل النوم 🌙</h1><div style={{ fontSize: 14, fontWeight: 700, opacity: 0.85 }}>سراج يحكي، وانت تغمّض عينيك وتسمع</div></div>
      </div>
      <div style={{ position: 'relative', background: '#ffffff18', borderRadius: 22, padding: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>⏰ مؤقت النوم</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TIMERS.map((t) => <button key={t} type="button" onClick={() => { sfx.tap(); setTimer(t); }} style={{ flex: 1, border: 0, borderRadius: 16, padding: '8px 0', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer', background: timer === t ? '#FFE9A8' : '#ffffff22', color: timer === t ? '#3B2F80' : '#fff' }}>{t ? `${ar(t)} دقيقة` : 'من غير'}</button>)}
        </div>
      </div>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.soft?.(); setPlay(0); }}
        style={{ position: 'relative', border: 0, borderRadius: 26, padding: '16px', fontFamily: 'inherit', fontSize: 22, fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(90deg,#FFD66B,#FFB86B)', color: '#3B2F80', boxShadow: '0 6px 0 #D9963F', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon d={I.play} size={24} color="#3B2F80" /> احكيلي الحكايات ورا بعض
      </motion.button>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {BEDTIME.map((st, k) => (
          <motion.button key={st.id} type="button" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfx.soft?.(); setPlay(k); }}
            style={{ border: 0, borderRadius: 22, padding: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', color: '#fff', background: '#ffffff1c', boxShadow: `inset 0 0 0 2px ${st.c}88`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 46, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.25))' }}>{st.e}</span>
            <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{st.t}</span>
          </motion.button>
        ))}
      </div>
    </Night>
  );
}

function Player({ start, timer, back }) {
  const g = useStore((s) => s.profile?.gender) === 'girl' ? 'girl' : 'boy';
  const [si, setSi] = useState(start), [k, setK] = useState(-1), [paused, setPaused] = useState(false), [end, setEnd] = useState(false);
  const run = useRef(0), t0 = useRef(Date.now()), pos = useRef({ si: start, k: -1 });
  const st = BEDTIME[si];
  const dim = Math.min(0.55, ((Date.now() - t0.current) / 60000) * 0.03);
  // بتحكي من مكان معيّن لحد آخر الحكايات (أو لحد المؤقت)
  const go = async (s0, k0) => {
    const my = ++run.current;
    const live = () => my === run.current;
    const speak = async (text) => { const t1 = Date.now(); await say(text); const min = 1200 + text.length * 60; const left = min - (Date.now() - t1); if (left > 0) await wait(left); };
    if (s0 === start && k0 < 0) { await speak(BED_INTRO); if (!live()) return; }
    for (let s = s0; s < BEDTIME.length; s++) {
      for (let j = s === s0 ? Math.max(0, k0) : 0; j < BEDTIME[s].s.length; j++) {
        if (!live()) return;
        pos.current = { si: s, k: j }; setSi(s); setK(j);
        await speak(BEDTIME[s].s[j][1]); if (!live()) return; await wait(900);
      }
      if (!live()) return;
      pos.current = { si: s, k: BEDTIME[s].s.length }; setK(BEDTIME[s].s.length);
      await speak(BED_MORAL(BEDTIME[s])); if (!live()) return;
      if (timer && Date.now() - t0.current > timer * 60000) break;
      await wait(2500);
    }
    if (!live()) return;
    setEnd(true); await speak(BED_END[g]);
  };
  useEffect(() => { go(start, -1); return () => { run.current++; hush(); }; }, []);
  const pause = () => { if (paused) { setPaused(false); go(pos.current.si, pos.current.k); } else { run.current++; hush(); setPaused(true); } };
  const nextStory = () => { const n = (si + 1) % BEDTIME.length; run.current++; hush(); setPaused(false); setSi(n); setK(0); go(n, 0); };
  const scene = st.s[Math.min(Math.max(k, 0), st.s.length - 1)];
  return (
    <Night>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="خروج" onClick={() => { run.current++; hush(); back(); }} style={{ background: '#ffffff22' }}><Icon d={I.close} color="#fff" /></button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18 }}>{st.t}</div>
        <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.8, minWidth: 46 }}>{ar(si + 1)}/{ar(BEDTIME.length)}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {end ? (
            <motion.div key="end" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ fontSize: 96 }}>🌙</motion.span>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.5 }}>{BED_END[g]}</div>
            </motion.div>
          ) : (
            <motion.div key={si + '-' + k} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                style={{ width: 210, height: 210, borderRadius: 105, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle, #ffffff33, #ffffff08 70%)', fontSize: k >= st.s.length ? 90 : 76, letterSpacing: -6 }}>
                {k >= st.s.length ? '⭐' : k < 0 ? st.e : scene[0]}
              </motion.div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.7, maxWidth: 340, minHeight: 120 }}>
                {k < 0 ? BED_INTRO : k >= st.s.length ? BED_MORAL(st) : scene[1]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 6 }}>
        {st.s.map((_, j) => <span key={j} style={{ width: j === k ? 22 : 8, height: 8, borderRadius: 4, background: j <= k ? '#FFE9A8' : '#ffffff40', transition: 'all .4s' }} />)}
      </div>
      {!end && <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 16, paddingBottom: 8 }}>
        <button type="button" onClick={pause} aria-label={paused ? 'كمّل' : 'وقف'} style={{ width: 70, height: 70, borderRadius: 35, border: 0, background: '#FFE9A8', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon d={paused ? I.play : I.pause} size={30} color="#3B2F80" /></button>
        <button type="button" onClick={nextStory} style={{ height: 70, borderRadius: 35, border: 0, padding: '0 22px', background: '#ffffff22', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>الحكاية اللي بعدها ◀</button>
      </div>}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#000', opacity: end ? 0.35 : dim, pointerEvents: 'none', transition: 'opacity 4s' }} />
    </Night>
  );
}
