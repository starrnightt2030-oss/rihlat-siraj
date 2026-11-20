// القاعدة النورانية: قائمة دروس متدرّجة، وكل درس: شرح سراج + بلاطات بالصوت + «اسمع الكل» + اختبار «دوس على…»
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import { QAIDA, QAIDA_INTRO, QAIDA_ASK, QAIDA_DONE } from '../data/qaida';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';

const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

function Lesson({ l, back, next }) {
  const markDone = useStore((s) => s.qaidaDone);
  const [on, setOn] = useState(-1);
  const [mode, setMode] = useState('learn'); // learn | quiz | done
  const [q, setQ] = useState(null), [qi, setQi] = useState(0), [bad, setBad] = useState(-1);
  const playing = useRef(0);
  useEffect(() => { hubSay(l.intro); return () => { playing.current++; hush(); }; }, [l.id]);
  const tap = (k) => { sfx.tap(); setOn(k); say(l.tiles[k].s); };
  const playAll = async () => {
    const my = ++playing.current;
    for (let k = 0; k < l.tiles.length; k++) { if (playing.current !== my) return; setOn(k); await say(l.tiles[k].s); await new Promise((r) => setTimeout(r, 250)); }
    setOn(-1);
  };
  const quizRound = (n) => {
    const pick = shuffle(l.tiles.map((_, k) => k)).slice(0, 4);
    const ans = pick[0];
    setQ({ opts: shuffle(pick), ans }); setBad(-1); setQi(n);
    say(QAIDA_ASK).then(() => say(l.tiles[ans].s));
  };
  const startQuiz = () => { playing.current++; hush(); setMode('quiz'); quizRound(0); };
  const answer = (k) => {
    if (k !== q.ans) { sfx.soft(); setBad(k); return; }
    sfx.star();
    if (qi + 1 >= 5) { setMode('done'); markDone(l.id); say(QAIDA_DONE); } else setTimeout(() => quizRound(qi + 1), 500);
  };
  const cols = l.cols || (l.wide ? 2 : 4);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      {mode === 'done' && <Confetti />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: l.c }}>{l.e} {l.t}</h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{l.d}</div>
        </div>
      </div>
      <button type="button" onClick={() => say(l.intro)} className="card" style={{ position: 'relative', border: 0, textAlign: 'right', padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, lineHeight: 1.8, color: '#26336B', background: l.bg, cursor: 'pointer' }}>🔊 {l.intro}</button>
      {mode === 'learn' && (<>
        <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
          <button type="button" onClick={playAll} className="btn" style={{ flex: 1, background: l.c, color: '#fff', border: 0, borderRadius: 18, padding: 12, fontFamily: 'inherit', fontSize: 16, fontWeight: 800 }}>▶ اسمع الكل</button>
          <button type="button" onClick={startQuiz} className="btn" style={{ flex: 1, background: '#fff', color: l.c, border: `3px solid ${l.c}`, borderRadius: 18, padding: 10, fontFamily: 'inherit', fontSize: 16, fontWeight: 800 }}>⭐ اختبرني</button>
        </div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 8 }}>
          {l.tiles.map((x, k) => (
            <motion.button key={k} type="button" whileTap={{ scale: 0.9 }} animate={on === k ? { scale: [1, 1.12, 1] } : { scale: 1 }} onClick={() => tap(k)} className="card"
              style={{ border: on === k ? `3px solid ${l.c}` : '3px solid transparent', background: on === k ? l.bg : '#fff', padding: '6px 2px', minHeight: l.wide ? 76 : 70, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <span className={l.quran ? 'hafs' : 'ayah'} dir="rtl" style={{ fontSize: l.wide ? 28 : 34, lineHeight: 1.7, color: on === k ? l.c : '#26336B', whiteSpace: 'pre' }}>{x.t}</span>
            </motion.button>
          ))}
        </div>
      </>)}
      {mode === 'quiz' && q && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>سؤال {ar(qi + 1)} من ٥ — اسمع ودوس على الصح</div>
          <button type="button" onClick={() => say(l.tiles[q.ans].s)} style={{ width: 84, height: 84, borderRadius: 42, border: 0, background: l.c, color: '#fff', fontSize: 34, cursor: 'pointer' }} aria-label="اسمع تاني">🔊</button>
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            {q.opts.map((k) => (
              <motion.button key={qi + '-' + k} type="button" whileTap={{ scale: 0.92 }} animate={bad === k ? { x: [0, -8, 8, -5, 0] } : {}} onClick={() => answer(k)} className="card"
                style={{ border: bad === k ? '3px solid #E5484D' : '3px solid transparent', background: '#fff', minHeight: 96, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <span className={l.quran ? 'hafs' : 'ayah'} dir="rtl" style={{ fontSize: 36, color: '#26336B', whiteSpace: 'pre' }}>{l.tiles[k].t}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      {mode === 'done' && (
        <div className="card" style={{ position: 'relative', padding: 18, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 48 }}>🏅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: l.c }}>برافو! خلّصت درس {l.t}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setMode('learn')} className="btn" style={{ flex: 1, borderRadius: 18, padding: 12, border: `3px solid ${l.c}`, background: '#fff', color: l.c, fontFamily: 'inherit', fontSize: 16, fontWeight: 800 }}>راجع تاني</button>
            {next && <button type="button" onClick={next} className="btn" style={{ flex: 1, borderRadius: 18, padding: 12, border: 0, background: l.c, color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 800 }}>الدرس الجاي ◀</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Qaida({ arg, back, go }) {
  const done = useStore((s) => s.qaida) || [];
  const idx = QAIDA.findIndex((l) => l.id === arg);
  useEffect(() => { if (idx < 0) hubSay(QAIDA_INTRO, true); return () => hush(); }, [idx]);
  if (idx >= 0) return <Lesson key={arg} l={QAIDA[idx]} back={() => go('qaida')} next={QAIDA[idx + 1] ? () => go('qaida', QAIDA[idx + 1].id) : null} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#2C6BC4' }}>القاعدة النورانية</h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>من الحروف لحد ما تقرا القرآن بنفسك</div>
        </div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#2C6BC4' }}>{ar(done.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من {ar(QAIDA.length)}</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(done.length / QAIDA.length) * 100}%`, background: 'linear-gradient(90deg,#4A8FE0,#2FB383)' }} /></div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QAIDA.map((l, k) => { const ok = done.includes(l.id);
          return (
            <motion.button key={l.id} type="button" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.03 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('qaida', l.id); }} className="card"
              style={{ border: ok ? `3px solid ${l.c}` : '3px solid transparent', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B' }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, background: l.bg, color: l.c, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>{ok ? '✓' : ar(k + 1)}</span>
              <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{l.t}</span><span className="ayah" style={{ display: 'block', fontSize: 15, color: '#6D7896', lineHeight: 1.6 }}>{l.d}</span></span>
              <span style={{ fontSize: 22, color: l.c }}>◀</span>
            </motion.button>
          ); })}
      </div>
    </div>
  );
}
