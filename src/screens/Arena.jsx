// ألعاب المسابقات: تحدّي اتنين على نفس الموبايل، صح ولا غلط، مين أنا؟، مسابقة الأبطال
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, Icon, HomeBtn } from '../components/ui';
import DIcon from '../art/Icons';
import { QB, CATS, TF, RIDDLES } from '../data/quizbank';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const maxL = (age) => (age === '4-6' ? 1 : age === '7-9' ? 2 : 3);
const pickQs = (n, lvl, cat) => shuffle(QB.filter((q) => q.l <= lvl && (!cat || q.cat === cat))).slice(0, n).map((q) => ({ ...q, opts: shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))) }));
const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch { /* */ } };
const Head = ({ t, back, right }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
    <IconBtn icon={I.back} label="رجوع" onClick={back} />
    <h1 style={{ flex: 1, fontSize: 24, fontWeight: 800 }}>{t}</h1>{right}<HomeBtn />
  </div>
);

// ===== تحدّي الاتنين: الموبايل على الترابيزة، وكل لاعب من ناحيته =====
const P = [{ n: 'الفريق الأزرق', c: '#3A8FE0', d: '#2A6FBB', face: 'characters/bashir/face_happy' }, { n: 'الفريق الأحمر', c: '#FF7E6B', d: '#E0563F', face: 'characters/mishmish/face_happy' }];
export function Duel({ back, age }) {
  const ROUNDS = 7;
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => pickQs(ROUNDS, Math.max(2, maxL(age))), [seed]);
  const [i, setI] = useState(-1); // -1 شاشة البداية
  const [score, setScore] = useState([0, 0]);
  const [lock, setLock] = useState([false, false]);
  const [win, setWin] = useState(null); // {p, k}
  const winFn = useStore((s) => s.win);
  const q = qs[i];
  const [left, setLeft] = useState(15);
  useEffect(() => { if (i >= 0 && i < ROUNDS) { setLock([false, false]); setWin(null); setLeft(15); say(qs[i].q); } }, [i]);
  // كل سؤال ليه ١٥ ثانية، عشان اللعبة متقفش لو محدش جاوب
  useEffect(() => {
    if (i < 0 || i >= ROUNDS || win) return;
    if (left <= 0) { sfx.soft(); setWin({ p: -1, k: q.opts.findIndex((o) => o.ok) }); setTimeout(() => setI((x) => x + 1), 1700); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(t);
  }, [left, i, win]);
  const tap = (p, k) => {
    if (win || lock[p]) return;
    if (q.opts[k].ok) {
      sfx.good(); buzz(60); setWin({ p, k }); setScore((s) => s.map((v, j) => (j === p ? v + 1 : v)));
      setTimeout(() => setI((x) => x + 1), 1500);
    } else {
      sfx.soft(); buzz(150); const nl = lock.map((v, j) => (j === p ? true : v)); setLock(nl);
      if (nl[0] && nl[1]) { setWin({ p: -1, k: q.opts.findIndex((o) => o.ok) }); setTimeout(() => setI((x) => x + 1), 1700); }
    }
  };
  useEffect(() => { if (i === ROUNDS) { sfx.good(); winFn('duel', 3); say(score[0] === score[1] ? 'تعادل! انتو الاتنين أبطال' : 'برافو للفريق الكسبان!'); } }, [i]);

  if (i === -1) return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="warm" />
      <Head t="تحدّي الأبطال" back={back} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="happy" size={90} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 12, fontSize: 17 }}>حطّوا الموبايل على الترابيزة بينكم. كل واحد يجاوب من ناحيته، واللي يدوس الإجابة الصح الأول ياخد النقطة!</Bubble>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {P.map((p) => (
          <div key={p.n} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: `4px solid ${p.c}`, background: p.c + '14' }}>
            <img src={A(p.face)} alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: p.d }}>{p.n}</span>
          </div>
        ))}
      </div>
      <div className="card" style={{ position: 'relative', padding: 12, fontSize: 16, fontWeight: 700, lineHeight: 1.7 }}>
        <div>• <bdi>{ar(ROUNDS)}</bdi> أسئلة متنوعة من الدين</div>
        <div>• اللي يغلط يستنى لحد السؤال اللي بعده</div>
        <div>• الأسرع والأصح يكسب!</div>
      </div>
      <Btn className="block pulse" onClick={() => setI(0)} sound="pop" style={{ position: 'relative', marginTop: 'auto', fontSize: 24, minHeight: 64, '--c': '#F5A623', '--d': '#D9822A', '--t': '#fff' }}>يلا نبدأ التحدّي!</Btn>
    </div>
  );

  if (i >= ROUNDS) {
    const w = score[0] === score[1] ? -1 : score[0] > score[1] ? 0 : 1;
    return (
      <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Sky tone="warm" /><Confetti n={50} />
        <div style={{ position: 'relative', fontSize: 30, fontWeight: 800 }}>{w === -1 ? 'تعادل! انتو الاتنين أبطال' : 'الكسبان: ' + P[w].n}</div>
        <div style={{ position: 'relative', display: 'flex', gap: 14 }}>
          {P.map((p, k) => (
            <motion.div key={k} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, scale: w === k ? 1.1 : 1 }} transition={{ delay: 0.2 + k * 0.15 }} className="card" style={{ padding: 12, width: 140, border: `4px solid ${p.c}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {w === k && <span style={{ fontSize: 30 }} aria-hidden>🏆</span>}
              <img src={A(p.face)} alt="" style={{ width: 70, height: 70, objectFit: 'contain' }} />
              <span style={{ fontWeight: 800, color: p.d }}>{p.n}</span>
              <span style={{ fontSize: 34, fontWeight: 800 }}><bdi>{ar(score[k])}</bdi></span>
            </motion.div>
          ))}
        </div>
        <Btn className="block" tone="grape" onClick={() => { setSeed(seed + 1); setScore([0, 0]); setI(0); }} style={{ position: 'relative' }}>تحدّي جديد</Btn>
        <Btn className="block" tone="white" onClick={back} style={{ position: 'relative' }}>رجوع للألعاب</Btn>
      </div>
    );
  }

  const Half = ({ p, flip }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 12, transform: flip ? 'rotate(180deg)' : 'none', background: P[p].c + '18', borderRadius: 26, border: `3px solid ${P[p].c}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={A(P[p].face)} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <span style={{ flex: 1, fontWeight: 800, color: P[p].d }}>{P[p].n}</span>
        <span style={{ background: P[p].c, color: '#fff', borderRadius: 14, padding: '0 12px', fontSize: 22, fontWeight: 800 }}><bdi>{ar(score[p])}</bdi></span>
      </div>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800, textAlign: 'center', lineHeight: 1.4 }}>{q.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.opts.map((o, k) => {
          const st = win && win.k === k ? 'ok' : lock[p] ? 'off' : null;
          return (
            <motion.button key={k} type="button" onClick={() => tap(p, k)} disabled={!!win || lock[p]} animate={win && win.p === p && win.k === k ? { scale: [1, 1.06, 1] } : {}}
              style={{ border: 0, borderRadius: 16, minHeight: 44, fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer', color: st === 'ok' ? '#fff' : '#26336B', background: st === 'ok' ? '#2FB383' : st === 'off' ? '#E5E9F0' : '#fff', boxShadow: st === 'off' ? 'none' : '0 4px 0 #0001', opacity: st === 'off' ? 0.6 : 1 }}>{o.t}</motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {win && win.p === p && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#2FB383cc', color: '#fff', fontSize: 30, fontWeight: 800 }}>+١ نقطة! 🎉</motion.div>}
        {lock[p] && !win && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', top: 56, left: 12, right: 12, textAlign: 'center', fontWeight: 800, color: '#fff', background: '#FF7E6B', borderRadius: 14, padding: '4px 8px' }}>غلط! استنى السؤال الجاي…</motion.div>}
      </AnimatePresence>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 8, padding: 10 }}>
      {Half({ p: 1, flip: true })}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="اقفل" onClick={back} style={{ width: 40, height: 40 }} />
        <span className="chip">السؤال <bdi>{ar(i + 1)}</bdi> من <bdi>{ar(ROUNDS)}</bdi></span>
        <span className="chip" style={{ color: left <= 5 ? '#E0563F' : '#26336B', minWidth: 54, justifyContent: 'center' }}>⏱ <bdi>{ar(Math.max(0, left))}</bdi></span>
      </div>
      {Half({ p: 0 })}
    </div>
  );
}

// ===== صح ولا غلط: سرعة وسلسلة =====
export function TrueFalse({ back }) {
  const [seed, setSeed] = useState(0);
  const list = useMemo(() => shuffle(TF).slice(0, 12), [seed]);
  const [i, setI] = useState(0), [score, setScore] = useState(0), [streak, setStreak] = useState(0), [fb, setFb] = useState(null), [t, setT] = useState(8);
  const winFn = useStore((s) => s.win);
  const done = i >= list.length;
  useEffect(() => { if (done) return; setT(8); setFb(null); say(list[i][0]); const id = setInterval(() => setT((x) => x - 1), 1000); return () => clearInterval(id); }, [i, done]);
  useEffect(() => { if (t <= 0 && !fb && !done) answer(null); }, [t]);
  useEffect(() => { if (done) { winFn('tf', 2); say('برافو!'); } }, [done]);
  function answer(v) {
    if (fb) return;
    const ok = v === list[i][1]; setFb(ok ? 'ok' : 'no');
    if (ok) { sfx.good(); setScore(score + 1 + Math.min(streak, 3)); setStreak(streak + 1); } else { sfx.soft(); setStreak(0); }
    setTimeout(() => setI(i + 1), 1100);
  }
  if (done) return (
    <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Sky tone="mint" /><Confetti />
      <Siraj pose="party" size={140} />
      <div style={{ position: 'relative', fontSize: 28, fontWeight: 800 }}>جمعت <bdi>{ar(score)}</bdi> نقطة!</div>
      <Btn className="block" tone="teal" onClick={() => { setSeed(seed + 1); setI(0); setScore(0); setStreak(0); }} style={{ position: 'relative' }}>العب تاني</Btn>
      <Btn className="block" tone="white" onClick={back} style={{ position: 'relative' }}>رجوع للألعاب</Btn>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="mint" />
      <Head t="صح ولا غلط؟" back={back} right={<span className="chip">⭐ <bdi>{ar(score)}</bdi></span>} />
      <div className="progress" style={{ position: 'relative', height: 12 }}><i style={{ width: `${(t / 8) * 100}%`, background: t <= 3 ? '#FF7E6B' : '#2FB383', transition: 'width 1s linear' }} /></div>
      {streak >= 2 && <div style={{ position: 'relative', textAlign: 'center', fontWeight: 800, color: '#E07F1E' }}>🔥 سلسلة <bdi>{ar(streak)}</bdi> — نقط زيادة!</div>}
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} className="card"
          style={{ position: 'relative', flex: 1, maxHeight: 300, display: 'grid', placeItems: 'center', padding: 20, fontSize: 26, fontWeight: 800, textAlign: 'center', lineHeight: 1.5, background: fb === 'ok' ? '#E3F7EE' : fb === 'no' ? '#FFEDE8' : '#fff', border: `4px solid ${fb === 'ok' ? '#2FB383' : fb === 'no' ? '#FF7E6B' : '#fff'}` }}>
          <div>{list[i][0]}{fb && <div style={{ fontSize: 18, marginTop: 10, color: fb === 'ok' ? '#1F8A61' : '#B85A2E' }}>{fb === 'ok' ? 'برافو! ✓' : 'الإجابة: ' + (list[i][1] ? 'صح' : 'غلط')}</div>}</div>
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
        <Btn className="block" onClick={() => answer(true)} style={{ minHeight: 80, fontSize: 28, '--c': '#2FB383', '--d': '#1F8A61', '--t': '#fff' }}>✓ صح</Btn>
        <Btn className="block" onClick={() => answer(false)} style={{ minHeight: 80, fontSize: 28, '--c': '#FF7E6B', '--d': '#E0563F', '--t': '#fff' }}>✗ غلط</Btn>
      </div>
    </div>
  );
}

// ===== مين أنا؟ تلميح ورا تلميح، وكل ما تعرف بدري تاخد نجوم أكتر =====
export function Riddle({ back }) {
  const [seed, setSeed] = useState(0);
  const list = useMemo(() => shuffle(RIDDLES).slice(0, 5), [seed]);
  const [i, setI] = useState(0), [h, setH] = useState(1), [score, setScore] = useState(0), [st, setSt] = useState({});
  const winFn = useStore((s) => s.win);
  const r = list[i]; const opts = useMemo(() => (r ? shuffle(r.o) : []), [i, seed]);
  const done = i >= list.length;
  useEffect(() => { if (!done) { setH(1); setSt({}); say('مين أنا؟ ' + r.h[0]); } else { winFn('riddle', 2); say('برافو!'); } }, [i, done]);
  const more = () => { if (h < 4) { sfx.pop(); say(r.h[h]); setH(h + 1); } };
  const tap = (o) => {
    if (st.ok) return;
    if (o === r.a) { sfx.good(); setSt({ ok: o }); setScore(score + (5 - h)); setTimeout(() => setI(i + 1), 1500); }
    else { sfx.soft(); setSt({ bad: o }); setTimeout(() => setSt({}), 600); if (h < 4) more(); }
  };
  if (done) return (
    <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Sky tone="lilac" /><Confetti />
      <Siraj pose="party" size={140} />
      <div style={{ position: 'relative', fontSize: 28, fontWeight: 800 }}>جمعت <bdi>{ar(score)}</bdi> نجمة!</div>
      <Btn className="block" tone="grape" onClick={() => { setSeed(seed + 1); setI(0); setScore(0); }} style={{ position: 'relative' }}>ألغاز جديدة</Btn>
      <Btn className="block" tone="white" onClick={back} style={{ position: 'relative' }}>رجوع للألعاب</Btn>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="lilac" />
      <Head t="مين أنا؟" back={back} right={<span className="chip">⭐ <bdi>{ar(score)}</bdi></span>} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ width: 90, height: 90, borderRadius: 45, background: '#7B5CE0', color: '#fff', fontSize: 56, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 6px 0 #5A3DBF' }}>؟</motion.div>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {r.h.slice(0, h).map((t, k) => (
          <motion.div key={k} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card" style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', fontSize: 18, fontWeight: 800 }}>
            <span className="num" style={{ '--c': '#7B5CE0', width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span>{t}
          </motion.div>
        ))}
      </div>
      {h < 4 && !st.ok && <button type="button" onClick={more} style={{ position: 'relative', alignSelf: 'center', border: 0, borderRadius: 16, padding: '6px 16px', background: '#fff', color: '#7B5CE0', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 0 #D9CBFF' }}>💡 تلميح كمان (النجوم بتقل)</button>}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        {opts.map((o) => (
          <motion.button key={o} type="button" onClick={() => tap(o)} animate={st.bad === o ? { x: [0, -10, 10, -6, 6, 0] } : st.ok === o ? { scale: [1, 1.05, 1] } : {}}
            style={{ border: 0, borderRadius: 20, minHeight: 58, fontFamily: 'inherit', fontSize: 21, fontWeight: 800, cursor: 'pointer', color: st.ok === o || st.bad === o ? '#fff' : '#26336B', background: st.ok === o ? '#2FB383' : st.bad === o ? '#FF7E6B' : '#fff', boxShadow: '0 5px 0 #E8E0D0' }}>{o}</motion.button>
        ))}
      </div>
    </div>
  );
}

// ===== مسابقة الأبطال: اختار القسم، ١٠ أسئلة، ونجوم =====
export function QuizChallenge({ back, age }) {
  const [cat, setCat] = useState(null);
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => (cat ? pickQs(10, maxL(age), cat === 'all' ? null : cat) : []), [cat, seed]);
  const [i, setI] = useState(0), [score, setScore] = useState(0), [pick, setPick] = useState(null);
  const best = useStore((s) => s.games?.['quiz_' + cat] || 0), gameScore = useStore((s) => s.gameScore), winFn = useStore((s) => s.win);
  const done = cat && i >= qs.length;
  useEffect(() => { if (cat && !done) { setPick(null); say(qs[i].q); } if (done) { gameScore('quiz_' + cat, score); winFn('quiz', 2); say('برافو!'); } }, [i, cat, done]);
  if (!cat) return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t="مسابقة الأبطال" back={back} />
      <div style={{ position: 'relative', fontSize: 17, fontWeight: 800, color: '#5D6CA0' }}>اختار القسم اللي تحب تتسابق فيه:</div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['all', { t: 'كل حاجة', c: '#F5A623', ic: 'star' }], ...Object.entries(CATS)].map(([id, c]) => (
          <motion.button key={id} type="button" whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); setCat(id); setI(0); setScore(0); }} className="card"
            style={{ border: `3px solid ${c.c}`, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', background: c.c + '12' }}>
            <DIcon id={c.ic} size={54} /><span style={{ fontSize: 18, fontWeight: 800 }}>{c.t}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
  if (done) return (
    <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Sky tone="warm" />{score >= 7 && <Confetti />}
      <Siraj pose={score >= 7 ? 'party' : 'happy'} size={140} />
      <div style={{ position: 'relative', fontSize: 28, fontWeight: 800 }}><bdi>{ar(score)}</bdi> من <bdi>{ar(10)}</bdi></div>
      <div style={{ position: 'relative', fontSize: 18, fontWeight: 700, color: '#5D6CA0' }}>{score >= 9 ? 'بطل خارق! ما شاء الله' : score >= 7 ? 'شاطر جدًا!' : 'كويس! جرّب تاني وهتبقى أحسن'} · أحسن نتيجة: <bdi>{ar(Math.max(best, score))}</bdi></div>
      <Btn className="block" onClick={() => { setSeed(seed + 1); setI(0); setScore(0); }} style={{ position: 'relative' }}>العب تاني</Btn>
      <Btn className="block" tone="white" onClick={() => setCat(null)} style={{ position: 'relative' }}>قسم تاني</Btn>
    </div>
  );
  const q = qs[i];
  const choose = (k) => {
    if (pick !== null) return; setPick(k);
    if (q.opts[k].ok) { sfx.good(); setScore(score + 1); } else sfx.soft();
    setTimeout(() => setI(i + 1), 1300);
  };
  const c = cat === 'all' ? CATS[q.cat] : CATS[cat];
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t={cat === 'all' ? 'كل حاجة' : CATS[cat].t} back={() => setCat(null)} right={<span className="chip">⭐ <bdi>{ar(score)}</bdi></span>} />
      <div style={{ position: 'relative', display: 'flex', gap: 4 }}>{qs.map((_, k) => <span key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: k < i ? '#2FB383' : k === i ? c.c : '#E5E9F0' }} />)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: `3px solid ${c.c}` }}>
            <DIcon id={c.ic} size={50} />
            <span style={{ fontSize: 13, fontWeight: 800, color: c.c }}>{c.t}</span>
            <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', lineHeight: 1.5 }}>{q.q}</div>
          </div>
          {q.opts.map((o, k) => {
            const s = pick === null ? null : o.ok ? 'ok' : pick === k ? 'no' : null;
            return (
              <motion.button key={k} type="button" onClick={() => choose(k)} animate={s === 'no' ? { x: [0, -10, 10, -6, 6, 0] } : s === 'ok' ? { scale: [1, 1.04, 1] } : {}}
                style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, borderRadius: 20, minHeight: 60, padding: '6px 14px', fontFamily: 'inherit', fontSize: 20, fontWeight: 800, cursor: 'pointer', textAlign: 'right', color: s ? '#fff' : '#26336B', background: s === 'ok' ? '#2FB383' : s === 'no' ? '#FF7E6B' : '#fff', boxShadow: '0 5px 0 #E8E0D0' }}>
                <span className="num" style={{ '--c': s ? '#fff' : c.c, color: s ? c.c : '#fff', width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span><span style={{ flex: 1 }}>{o.t}</span>{s === 'ok' && <Icon d={I.check} color="#fff" w={4} />}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
