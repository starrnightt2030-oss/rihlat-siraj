// تحفة الأطفال: قائمة الأبواب، وكل باب: الأبيات بصوت سراج + الشرح بالعامية + الأمثلة من القرآن + لعبة «الحكم إيه؟» + «حفظت الأبيات»
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import { TUHFA, verseLine, TUHFA_INTRO, TUHFA_Q, tuhfaQuiz } from '../data/tuhfa';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';

const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
const firstVerse = (i) => TUHFA.slice(0, i).reduce((s, b) => s + b.v.length, 0);

function Game({ b }) {
  const [qs] = useState(() => shuffle(tuhfaQuiz(b)).slice(0, 5));
  const [i, setI] = useState(0), [bad, setBad] = useState(''), [win, setWin] = useState(false);
  const q = qs[i];
  useEffect(() => { if (q && !win) say(TUHFA_Q); }, [i]);
  if (!qs.length) return null;
  if (win) return <div className="card" style={{ position: 'relative', padding: 16, textAlign: 'center', fontSize: 20, fontWeight: 800, color: b.c }}><Confetti />🏆 برافو! جاوبت الخمسة صح</div>;
  const pick = (o) => { if (o !== q.a) { sfx.soft(); setBad(o); return; } sfx.star(); setBad(''); if (i + 1 >= qs.length) { setWin(true); say('برافو!'); } else setI(i + 1); };
  return (
    <div className="card" style={{ position: 'relative', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: b.bg }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: b.c }}>🎯 لعبة: الحكم إيه؟ ({ar(i + 1)} من {ar(qs.length)})</div>
      <div className="ayah" style={{ textAlign: 'center', fontSize: 34, color: '#26336B', background: '#fff', borderRadius: 16, padding: '4px 8px' }}>{q.w}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
        {q.opts.map((o) => <motion.button key={i + o} type="button" whileTap={{ scale: 0.94 }} animate={bad === o ? { x: [0, -7, 7, -4, 0] } : {}} onClick={() => pick(o)} style={{ borderRadius: 14, padding: '10px 6px', border: bad === o ? '3px solid #E5484D' : `3px solid ${b.c}33`, background: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, color: '#26336B', cursor: 'pointer' }}>{o}</motion.button>)}
      </div>
    </div>
  );
}

function Bab({ b, i, back, next }) {
  const hifz = useStore((s) => s.tuhfa) || [], toggle = useStore((s) => s.tuhfaToggle);
  const [on, setOn] = useState(-1);
  const run = useRef(0);
  const n0 = firstVerse(i);
  useEffect(() => { hubSay(b.sh[0]); return () => { run.current++; hush(); }; }, [b.id]);
  const playAll = async () => { const my = ++run.current; for (let k = 0; k < b.v.length; k++) { if (run.current !== my) return; setOn(k); await say(verseLine(b.v[k])); } setOn(-1); };
  const ok = hifz.includes(b.id);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 23, fontWeight: 800, color: b.c }}>{b.t}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>الأبيات {ar(n0 + 1)}{b.v.length > 1 ? ` – ${ar(n0 + b.v.length)}` : ''} من تحفة الأطفال</div></div>
      </div>
      <div className="card" style={{ position: 'relative', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, background: 'linear-gradient(180deg,#FFFDF5,#FFF6DD)' }}>
        <button type="button" onClick={playAll} style={{ alignSelf: 'center', borderRadius: 16, border: 0, background: b.c, color: '#fff', padding: '8px 18px', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>▶ اسمع الأبيات</button>
        {b.v.map((v, k) => (
          <motion.button key={k} type="button" onClick={() => { run.current++; setOn(k); say(verseLine(v)); }} animate={{ background: on === k ? b.bg : 'rgba(255,255,255,0)' }}
            style={{ border: 0, borderRadius: 12, padding: '4px 6px', cursor: 'pointer', fontFamily: 'inherit', display: 'grid', gridTemplateColumns: '22px 1fr', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: b.c }}>{ar(n0 + k + 1)}</span>
            <span className="ayah" style={{ fontSize: 'clamp(16px, 4.8vw, 20px)', color: '#3A2A12', lineHeight: 1.75, display: 'flex', flexDirection: 'column' }}><span style={{ textAlign: 'right' }}>{v[0]}</span><span style={{ textAlign: 'left' }}>{v[1]}</span></span>
          </motion.button>
        ))}
      </div>
      {b.sh.map((t, k) => <button key={k} type="button" onClick={() => say(t)} className="card" style={{ position: 'relative', border: 0, textAlign: 'right', padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, lineHeight: 1.8, color: '#26336B', background: b.bg, cursor: 'pointer' }}>🔊 {t}</button>)}
      {b.rules.map((r, k) => (
        <motion.button key={k} type="button" onClick={() => say(r.n + '. ' + r.d)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }} className="card"
          style={{ position: 'relative', border: 0, borderInlineStart: `6px solid ${b.c}`, textAlign: 'right', padding: 12, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, color: '#26336B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><b style={{ fontSize: 18, color: b.c }}>{r.n}</b>{r.l && <span style={{ fontSize: 13, fontWeight: 800, background: b.bg, color: b.c, borderRadius: 10, padding: '2px 10px' }}>{r.l}</span>}</span>
          <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.7 }}>{r.d}</span>
          {r.ex.length > 0 && <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{r.ex.map((w) => <span key={w} className="ayah" style={{ fontSize: 21, background: '#FFF6DD', borderRadius: 10, padding: '0 10px', color: '#3A2A12' }}>{w}</span>)}</span>}
        </motion.button>
      ))}
      <Game b={b} />
      <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => { toggle(b.id); if (!ok) { sfx.star(); say('برافو!'); } }} style={{ flex: 1, borderRadius: 18, padding: 12, border: ok ? 0 : `3px solid ${b.c}`, background: ok ? b.c : '#fff', color: ok ? '#fff' : b.c, fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{ok ? '✓ حفظت الأبيات' : 'حفظت الأبيات'}</button>
        {next && <button type="button" onClick={next} style={{ flex: 1, borderRadius: 18, padding: 12, border: 0, background: b.c, color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>الباب الجاي ◀</button>}
      </div>
    </div>
  );
}

export default function Tuhfa({ arg, back, go }) {
  const hifz = useStore((s) => s.tuhfa) || [];
  const i = TUHFA.findIndex((b) => b.id === arg);
  useEffect(() => { if (i < 0) hubSay(TUHFA_INTRO, true); return () => hush(); }, [i]);
  if (i >= 0) return <Bab key={arg} b={TUHFA[i]} i={i} back={() => go('tuhfa')} next={TUHFA[i + 1] ? () => go('tuhfa', TUHFA[i + 1].id) : null} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#8C5A1F' }}>تحفة الأطفال</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>منظومة التجويد للشيخ سليمان الجمزوري — ٦١ بيت</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#8C5A1F' }}>{ar(hifz.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من {ar(TUHFA.length)}</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(hifz.length / TUHFA.length) * 100}%`, background: 'linear-gradient(90deg,#E07F1E,#F5A623)' }} /></div>
      {TUHFA.map((b, k) => { const ok = hifz.includes(b.id);
        return (
          <motion.button key={b.id} type="button" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.03 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('tuhfa', b.id); }} className="card"
            style={{ position: 'relative', border: ok ? `3px solid ${b.c}` : '3px solid transparent', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B' }}>
            <span style={{ width: 50, height: 50, borderRadius: 16, background: b.bg, color: b.c, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>{ok ? '✓' : ar(k + 1)}</span>
            <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 17, fontWeight: 800 }}>{b.t}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6D7896' }}>{ar(b.v.length)} {b.v.length > 2 ? 'أبيات' : 'بيت'}{b.rules.length ? ` • ${ar(b.rules.length)} قواعد` : ''}</span></span>
            <span style={{ fontSize: 22, color: b.c }}>◀</span>
          </motion.button>
        ); })}
    </div>
  );
}
