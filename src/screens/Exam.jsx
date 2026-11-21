// «اختبرني»: اختبارات بالصوت لفروع التطبيق. كل فرع ليه ٣ مستويات (سهل ٥ أسئلة، متوسط ١٠، صعب ١٥).
// سراج يقرا السؤال، والطفل يقرا الاختيارات ويقول الإجابة بصوته (أو يدوس عليها)، والتطبيق بيعرف قال أنهي واحدة.
// لما يعدّي كل الفروع (٦٠٪ أو أكتر في أي مستوى) بتطلعله شهادة شاملة بنتايجه.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import DIcon from '../art/Icons';
import { Confetti } from '../components/Reward';
import { HomeBtn } from '../components/ui';
import Certificate from '../components/Certificate';
import { useStore } from '../store';
import { ALL_CATS, LEVELS, pickQs, matchOption, EXAM_INTRO, EXAM_AGAIN } from '../data/questions';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, leave } from '../lib/voice';
import { micReady, hear, warmMic } from '../lib/listen';

const PASS = 60;
const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const bestOf = (e) => Math.max(0, ...Object.values(e || {}));
const grade = (p) => (p >= 90 ? ['ممتاز', '#1F8A61'] : p >= 75 ? ['جيد جدًا', '#2C6BC4'] : p >= PASS ? ['جيد', '#B07A12'] : ['محتاج مراجعة', '#E5484D']);

function Quiz({ cat, lv, back, done }) {
  const C = ALL_CATS[cat], L = LEVELS[lv - 1];
  const qs = useMemo(() => pickQs(cat, lv, L.n), []);
  const [i, setI] = useState(0), [score, setScore] = useState(0), [pick, setPick] = useState(null), [heard, setHeard] = useState(''), [listening, setListening] = useState(false), [msg, setMsg] = useState('');
  const run = useRef({ n: 0, ear: null }), mic = useRef('unk'), picked = useRef(false), scoreR = useRef(0), qR = useRef(null);
  const q = qs[i]; qR.current = q;
  useEffect(() => { micReady().then((m) => { mic.current = m; if (m === 'ok') warmMic(); }); return () => { run.current.n++; run.current.ear?.stop(); leave(); }; }, []);
  const stopEar = () => { run.current.ear?.stop(); run.current.ear = null; setListening(false); };
  const choose = (k) => {
    // refs مش state: الدالة دي بتتنادي من السماع اللي بدأ في render قديم
    if (picked.current) return; picked.current = true; stopEar(); run.current.n++; setPick(k);
    const ok = qR.current.opts[k].ok; if (ok) { sfx.good(); scoreR.current++; setScore(scoreR.current); say('شاطر! إجابة صح'); } else { sfx.soft(); say('قربت! فكّر تاني'); }
    setTimeout(() => { if (i + 1 >= qs.length) done(Math.round((scoreR.current / qs.length) * 100)); else { setI(i + 1); } }, ok ? 1300 : 2200);
  };
  // يسمع الإجابة: لحد محاولتين، ولو مفهمش يطلب منه يعيد
  const listen = async (my) => {
    for (let tries = 0; tries < 2 && run.current.n === my; tries++) {
      setListening(true); setHeard('');
      const ear = hear({ waitMs: 7000, maxMs: 12000, onText: (t) => { setHeard(t); if (matchOption(qR.current.opts, t) >= 0) ear.stop(); } });
      run.current.ear = ear; const t = await ear.promise; run.current.ear = null; setListening(false);
      if (run.current.n !== my) return;
      const k = matchOption(qR.current.opts, t || '');
      if (k >= 0) { choose(k); return; }
      if (t) { setMsg(EXAM_AGAIN); await say(EXAM_AGAIN); } else return;
    }
  };
  useEffect(() => {
    if (!q) return;
    const my = ++run.current.n; picked.current = false; setPick(null); setHeard(''); setMsg('');
    (async () => {
      await say(q.q); if (run.current.n !== my) return;
      if (mic.current === 'unk') mic.current = await Promise.race([micReady(), new Promise((r) => setTimeout(() => r('unk'), 1500))]);
      if (mic.current === 'ok' && run.current.n === my) listen(my);
    })();
  }, [i]);
  if (!q) return null;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 21, fontWeight: 800, color: C.c }}>{C.t} • {L.e} {L.t}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>سؤال {ar(i + 1)} من {ar(qs.length)}</div></div>
        <span className="chip">⭐ <bdi>{ar(score)}</bdi></span>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 3 }}>{qs.map((_, k) => <span key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: k < i ? '#2FB383' : k === i ? C.c : '#E5E9F0' }} />)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: `3px solid ${C.c}` }}>
            <DIcon id={C.ic} size={46} />
            <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', lineHeight: 1.5 }}>{q.q}</div>
          </div>
          {q.opts.map((o, k) => {
            const s = pick === null ? null : o.ok ? 'ok' : pick === k ? 'no' : null;
            return (
              <motion.button key={k} type="button" onClick={() => choose(k)} animate={s === 'no' ? { x: [0, -10, 10, -6, 6, 0] } : s === 'ok' ? { scale: [1, 1.05, 1] } : {}}
                style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, borderRadius: 20, minHeight: 58, padding: '6px 14px', fontFamily: 'inherit', fontSize: 20, fontWeight: 800, cursor: 'pointer', textAlign: 'right', color: s ? '#fff' : '#26336B', background: s === 'ok' ? '#2FB383' : s === 'no' ? '#FF7E6B' : '#fff', boxShadow: '0 5px 0 #E8E0D0' }}>
                <span className="num" style={{ '--c': s ? '#fff' : C.c, color: s ? C.c : '#fff', width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span><span style={{ flex: 1 }}>{o.t}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
      {pick === null && <div className="card" style={{ position: 'relative', padding: 10, textAlign: 'center', background: listening ? '#FFF3D6' : '#F4F6FB', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {listening ? <div style={{ fontSize: 17, fontWeight: 800, color: '#B07A12' }}><motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block' }}>🎤</motion.span> قول الإجابة… أنا سامعك</div>
          : <button type="button" onClick={() => { const my = ++run.current.n; hush(); listen(my); }} style={{ border: 0, borderRadius: 16, padding: '8px 18px', background: C.c, color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>🎤 قول الإجابة بصوتك</button>}
        {heard && <div style={{ fontSize: 16, fontWeight: 700, color: '#26336B' }}>«{heard}»</div>}
        {msg && !listening && <div style={{ fontSize: 14, fontWeight: 800, color: '#B4531A' }}>{msg}</div>}
      </div>}
    </div>
  );
}

export default function Exam({ back }) {
  const exam = useStore((s) => s.exam) || {}, examScore = useStore((s) => s.examScore), profile = useStore((s) => s.profile);
  const [cat, setCat] = useState(null), [lv, setLv] = useState(null), [res, setRes] = useState(null), [cert, setCert] = useState(false), [key, setKey] = useState(0);
  const cats = Object.keys(ALL_CATS), passed = cats.filter((c) => bestOf(exam[c]) >= PASS);
  const all = passed.length === cats.length, avg = Math.round(cats.reduce((s, c) => s + bestOf(exam[c]), 0) / cats.length);
  useEffect(() => { if (!cat) say(EXAM_INTRO); return () => leave(); }, []);
  if (cat && lv && !res) return <Quiz key={key} cat={cat} lv={lv} back={() => { hush(); setLv(null); }} done={(p) => { examScore(cat, lv, p); setRes(p); }} />;
  if (res !== null) {
    const [g, gc] = grade(res), nowAll = Object.keys(ALL_CATS).every((c) => (c === cat ? Math.max(res, bestOf(exam[c])) : bestOf(exam[c])) >= PASS);
    return (
      <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Sky tone="warm" />{res >= PASS && <Confetti />}
        <Siraj pose={res >= PASS ? 'party' : 'happy'} size={130} />
        <div style={{ position: 'relative', fontSize: 40, fontWeight: 800, color: gc }}><bdi>{ar(res)}٪</bdi></div>
        <div style={{ position: 'relative', fontSize: 22, fontWeight: 800, color: gc }}>{g}</div>
        <div style={{ position: 'relative', fontSize: 15, fontWeight: 700, color: '#5D6CA0' }}>{ALL_CATS[cat].t} • مستوى {LEVELS[lv - 1].t}</div>
        {nowAll && <button type="button" onClick={() => { setRes(null); setCat(null); setLv(null); setCert(true); }} style={{ position: 'relative', border: '3px solid #E8C77A', borderRadius: 18, padding: 12, background: 'linear-gradient(135deg,#FFF8E1,#FFE9B0)', color: '#8C5A1F', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>📜 نجحت في كل الفروع! شوف شهادتك</button>}
        <div style={{ position: 'relative', display: 'flex', gap: 8, width: '100%' }}>
          <button type="button" onClick={() => { setRes(null); setKey(key + 1); }} style={{ flex: 1, border: 0, borderRadius: 18, padding: 14, background: '#2FB383', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>جرّب تاني</button>
          {lv < 3 && res >= PASS && <button type="button" onClick={() => { setRes(null); setLv(lv + 1); setKey(key + 1); }} style={{ flex: 1, border: 0, borderRadius: 18, padding: 14, background: '#F5A623', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>المستوى الأصعب ◀</button>}
        </div>
        <button type="button" onClick={() => { setRes(null); setLv(null); setCat(null); }} style={{ position: 'relative', border: 0, background: 'transparent', color: '#5D6CA0', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>فرع تاني</button>
      </div>
    );
  }
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      {cert && <Certificate c={{ title: 'شهادة التفوّق', name: profile?.name || 'بطل', gender: profile?.gender, verb: profile?.gender === 'girl' ? 'اجتازت بنجاح اختبارات' : 'اجتاز بنجاح اختبارات', main: 'رحلة سراج', sub: `في ${ar(cats.length)} فروع • المعدّل ${ar(avg)}٪`, lines: cats.map((c) => [ALL_CATS[c].t, `${ar(bestOf(exam[c]))}٪ • ${grade(bestOf(exam[c]))[0]}`, grade(bestOf(exam[c]))[1]]) }} onClose={() => setCert(false)} />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={cat ? () => setCat(null) : back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#B07A12' }}>🎓 اختبرني</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{cat ? 'اختار المستوى' : `نجحت في ${ar(passed.length)} من ${ar(cats.length)} فروع`}</div></div>
        <HomeBtn />
      </div>
      {!cat && <>
        <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(passed.length / cats.length) * 100}%`, background: 'linear-gradient(90deg,#FFC93C,#E07F1E)' }} /></div>
        {all && <button type="button" onClick={() => setCert(true)} style={{ position: 'relative', border: '3px solid #E8C77A', borderRadius: 18, padding: 12, background: 'linear-gradient(135deg,#FFF8E1,#FFE9B0)', color: '#8C5A1F', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>📜 شهادة التفوّق • المعدّل {ar(avg)}٪</button>}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          {cats.map((c) => { const C = ALL_CATS[c], b = bestOf(exam[c]), ok = b >= PASS;
            return (
              <motion.button key={c} type="button" whileTap={{ scale: 0.94 }} onClick={() => { sfx.pop(); setCat(c); }} className="card"
                style={{ border: `3px solid ${ok ? C.c : 'transparent'}`, padding: '10px 4px', cursor: 'pointer', fontFamily: 'inherit', background: ok ? C.c + '14' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#26336B' }}>
                <DIcon id={C.ic} size={40} /><span style={{ fontSize: 15, fontWeight: 800 }}>{C.t}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: b ? grade(b)[1] : '#A3AAC0' }}>{b ? `${ok ? '✓ ' : ''}${ar(b)}٪` : 'لسه'}</span>
              </motion.button>
            ); })}
        </div>
      </>}
      {cat && <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map((L) => { const b = exam[cat]?.[L.id];
          return (
            <motion.button key={L.id} type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); setLv(L.id); setKey(key + 1); }} className="card"
              style={{ border: 0, padding: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', boxShadow: `0 5px 0 ${L.c}55`, textAlign: 'right' }}>
              <span style={{ fontSize: 36 }}>{L.e}</span>
              <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 20, fontWeight: 800, color: L.c }}>{L.t}</span><span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(L.n)} أسئلة في {ALL_CATS[cat].t}</span></span>
              {b != null && <span style={{ fontSize: 15, fontWeight: 800, color: grade(b)[1] }}>{ar(b)}٪</span>}
            </motion.button>
          ); })}
      </div>}
    </div>
  );
}
