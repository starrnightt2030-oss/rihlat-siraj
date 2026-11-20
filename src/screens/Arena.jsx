// ألعاب المسابقات: تحدّي اتنين على نفس الموبايل، صح ولا غلط، مين أنا؟، مسابقة الأبطال
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ALLQ, ALL_CATS } from '../data/questions';
import Q30 from '../data/quran30.json';
import { reciterById, ayahUrl } from '../data/reciters';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const maxL = (age) => (age === '4-6' ? 1 : age === '7-9' ? 2 : 3);
const pickQs = (n, lvl, cat) => shuffle(ALLQ.filter((q) => q.l <= lvl && (!cat || q.cat === cat))).slice(0, n).map((q) => ({ ...q, opts: shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))) }));
const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch { /* */ } };
const Head = ({ t, back, right }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
    <IconBtn icon={I.back} label="رجوع" onClick={back} />
    <h1 style={{ flex: 1, fontSize: 24, fontWeight: 800 }}>{t}</h1>{right}<HomeBtn />
  </div>
);

// ===== تحدّي الاتنين: الموبايل على الترابيزة، وكل لاعب من ناحيته =====
const P = [{ n: 'الفريق الأزرق', c: '#3A8FE0', d: '#2A6FBB', face: 'characters/bashir/face_happy' }, { n: 'الفريق الأحمر', c: '#FF7E6B', d: '#E0563F', face: 'characters/mishmish/face_happy' }];
// ===== تحدّي الأبطال: اتنين على نفس الموبايل =====
// ٣ أوضاع: تحدّي سريع (٧ أسئلة)، بطولة (٣ جولات وكل جولة نوع، والجولة الأخيرة النقطة باتنين)، سباق القرآن (كمّل الآية واسمع الشيخ)
// ٤ أنواع أسئلة: اختيار من متعدد (من بنك الـ٢٢٠ سؤال)، صح ولا غلط، كمّل الآية، اسمع الشيخ وقول اسم السورة. و٣ إجابات صح ورا بعض = نقطة زيادة
const AYQ = (() => { const out = []; for (const [s, v] of Object.entries(Q30)) v.ayat.forEach((t, k) => { const w = t.split(' '); if (w.length >= 4 && w.length <= 12) out.push({ s: +s, k, t, name: v.name }); }); return out; })();
function genQ(kind, lvl) {
  if (kind === 'mcq') { const [q] = pickAll(1, lvl); return { ...q, kind }; }
  if (kind === 'tf') { const [t, v] = TF[Math.floor(Math.random() * TF.length)]; return { kind, q: 'صح ولا غلط؟ ' + t, opts: [{ t: 'صح ✓', ok: v }, { t: 'غلط ✗', ok: !v }] }; }
  if (kind === 'ayah') {
    const a = AYQ[Math.floor(Math.random() * AYQ.length)], w = a.t.split(' '), cut = Math.ceil(w.length / 2);
    const end = (x) => x.t.split(' ').slice(Math.ceil(x.t.split(' ').length / 2)).join(' ');
    const others = shuffle(AYQ.filter((x) => x !== a && end(x) !== end(a))).slice(0, 2).map(end);
    return { kind, q: 'كمّل الآية: ' + w.slice(0, cut).join(' ') + ' …', uth: true, opts: shuffle([{ t: end(a), ok: true }, ...others.map((t) => ({ t, ok: false }))]), s: a.s, k: a.k };
  }
  // اسمع الشيخ: أنهي سورة؟
  const a = AYQ[Math.floor(Math.random() * AYQ.length)];
  const names = shuffle([...new Set(AYQ.map((x) => x.name))].filter((n) => n !== a.name)).slice(0, 2);
  return { kind: 'listen', q: '🔊 اسمع الشيخ… الآية دي من أنهي سورة؟', opts: shuffle([{ t: a.name, ok: true }, ...names.map((t) => ({ t, ok: false }))]), s: a.s, k: a.k };
}
const pickAll = (n, lvl) => shuffle(ALLQ.filter((q) => q.l <= lvl)).slice(0, n).map((q) => ({ ...q, opts: shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))) }));
const MODES = [
  { id: 'quick', t: 'تحدّي سريع', d: '٧ أسئلة متنوعة', e: '⚡', c: '#F5A623', rounds: [{ n: 7, kinds: ['mcq', 'mcq', 'tf', 'ayah', 'listen'] }] },
  { id: 'cup', t: 'البطولة', d: '٣ جولات • الأخيرة النقطة باتنين', e: '🏆', c: '#7B5CE0', rounds: [{ n: 5, kinds: ['mcq'], t: 'جولة المعلومات' }, { n: 5, kinds: ['tf'], t: 'جولة صح ولا غلط' }, { n: 5, kinds: ['ayah', 'listen'], t: 'الجولة النهائية', x2: true }] },
  { id: 'quran', t: 'سباق القرآن', d: 'كمّل الآية واسمع الشيخ', e: '📖', c: '#1F8A61', rounds: [{ n: 10, kinds: ['ayah', 'listen'] }] },
];
export function Duel({ back, age }) {
  const lvl = Math.max(2, maxL(age));
  const [mode, setMode] = useState(null), [seed, setSeed] = useState(0);
  const plan = useMemo(() => (mode ? mode.rounds.flatMap((r, ri) => Array.from({ length: r.n }, (_, k) => ({ ...genQ(r.kinds[k % r.kinds.length], lvl), round: ri, x2: !!r.x2 }))) : []), [mode, seed]);
  const total = plan.length;
  const [i, setI] = useState(-1); // -1 شاشة البداية
  const [score, setScore] = useState([0, 0]), [streak, setStreak] = useState([0, 0]), [bonus, setBonus] = useState(null);
  const [lock, setLock] = useState([false, false]);
  const [win, setWin] = useState(null); // {p, k}
  const [roundCard, setRoundCard] = useState(null);
  const winFn = useStore((s) => s.win), rec = useStore((s) => s.games?.duel_rounds || 0), gameScore = useStore((s) => s.gameScore);
  const reciter = reciterById(useStore((s) => s.settings.reciter));
  const audio = useRef(null);
  const q = plan[i];
  const [left, setLeft] = useState(15);
  const playAyah = (qq) => { try { audio.current?.pause(); } catch (e) {} if (!qq || qq.s == null) return; const a = new Audio(ayahUrl(reciter, String(qq.s).padStart(3, '0') + String(qq.k + 1).padStart(3, '0'), import.meta.env.BASE_URL)); audio.current = a; a.play().catch(() => {}); };
  useEffect(() => () => { try { audio.current?.pause(); } catch (e) {} }, []);
  useEffect(() => {
    if (i < 0 || i >= total) return;
    // بداية جولة جديدة في البطولة: كارت باسم الجولة
    if (mode.rounds.length > 1 && (i === 0 || plan[i - 1].round !== q.round)) { const r = mode.rounds[q.round]; setRoundCard(r); setTimeout(() => setRoundCard(null), 1800); }
    setLock([false, false]); setWin(null); setLeft(q.kind === 'listen' || q.kind === 'ayah' ? 20 : 15);
    if (q.kind === 'listen') playAyah(q); else if (q.kind === 'mcq') say(q.q);
  }, [i]);
  // كل سؤال ليه وقت، عشان اللعبة متقفش لو محدش جاوب
  useEffect(() => {
    if (i < 0 || i >= total || win || roundCard) return;
    if (left <= 0) { sfx.soft(); setStreak([0, 0]); setWin({ p: -1, k: q.opts.findIndex((o) => o.ok) }); setTimeout(() => setI((x) => x + 1), 1700); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(t);
  }, [left, i, win, roundCard]);
  const tap = (p, k) => {
    if (win || lock[p] || roundCard) return;
    if (q.opts[k].ok) {
      const st = streak.map((v, j) => (j === p ? v + 1 : 0)), extra = st[p] > 0 && st[p] % 3 === 0 ? 1 : 0, pts = (q.x2 ? 2 : 1) + extra;
      sfx.good(); buzz(60); setWin({ p, k, pts }); setStreak(st); setScore((s) => s.map((v, j) => (j === p ? v + pts : v)));
      if (extra) { setBonus(p); setTimeout(() => setBonus(null), 1400); }
      if (q.kind === 'ayah') playAyah(q);
      setTimeout(() => setI((x) => x + 1), q.kind === 'ayah' ? 2600 : 1500);
    } else {
      sfx.soft(); buzz(150); const nl = lock.map((v, j) => (j === p ? true : v)); setLock(nl); setStreak((s) => s.map((v, j) => (j === p ? 0 : v)));
      if (nl[0] && nl[1]) { setWin({ p: -1, k: q.opts.findIndex((o) => o.ok) }); setTimeout(() => setI((x) => x + 1), 1700); }
    }
  };
  useEffect(() => { if (mode && i === total && total) { sfx.good(); winFn('duel', 3); gameScore('duel_rounds', rec + 1); say(score[0] === score[1] ? 'تعادل! انتو الاتنين أبطال' : 'برافو للفريق الكسبان!'); } }, [i]);
  const restart = () => { setSeed(seed + 1); setScore([0, 0]); setStreak([0, 0]); setI(0); };

  if (i === -1) return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t="تحدّي الأبطال" back={back} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="happy" size={84} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 12, fontSize: 16 }}>حطّوا الموبايل على الترابيزة بينكم. كل واحد يجاوب من ناحيته، واللي يدوس الإجابة الصح الأول ياخد النقطة!</Bubble>
      </div>
      <div style={{ position: 'relative', fontSize: 17, fontWeight: 800, color: '#5D6CA0' }}>اختاروا نوع التحدّي:</div>
      {MODES.map((m) => (
        <motion.button key={m.id} type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); setMode(m); setSeed(seed + 1); setScore([0, 0]); setStreak([0, 0]); setI(0); }} className="card"
          style={{ position: 'relative', border: `3px solid ${m.c}`, padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', background: m.c + '12', color: '#26336B' }}>
          <span style={{ fontSize: 38 }}>{m.e}</span>
          <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 20, fontWeight: 800, color: m.c }}>{m.t}</span><span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{m.d}</span></span>
        </motion.button>
      ))}
      <div className="card" style={{ position: 'relative', padding: 10, fontSize: 14, fontWeight: 700, lineHeight: 1.7 }}>
        <div>• ٣ إجابات صح ورا بعض = 🔥 نقطة زيادة</div>
        <div>• اللي يغلط يستنى لحد السؤال اللي بعده</div>
        {rec > 0 && <div>• لعبتوا <bdi>{ar(rec)}</bdi> تحدّي لحد دلوقتي 💪</div>}
      </div>
    </div>
  );

  if (i >= total) {
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
        <Btn className="block" tone="grape" onClick={restart} style={{ position: 'relative' }}>نفس التحدّي تاني</Btn>
        <Btn className="block" tone="white" onClick={() => { setMode(null); setI(-1); }} style={{ position: 'relative' }}>تحدّي من نوع تاني</Btn>
      </div>
    );
  }

  const Half = ({ p, flip }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 12, transform: flip ? 'rotate(180deg)' : 'none', background: P[p].c + '18', borderRadius: 26, border: `3px solid ${P[p].c}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={A(P[p].face)} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <span style={{ flex: 1, fontWeight: 800, color: P[p].d }}>{P[p].n}{streak[p] >= 2 ? ' 🔥' : ''}</span>
        <span style={{ background: P[p].c, color: '#fff', borderRadius: 14, padding: '0 12px', fontSize: 22, fontWeight: 800 }}><bdi>{ar(score[p])}</bdi></span>
      </div>
      <div className={q.uth ? 'hafs' : ''} style={{ flex: 1, display: 'grid', placeItems: 'center', fontSize: q.uth ? 22 : 19, fontWeight: q.uth ? 400 : 800, textAlign: 'center', lineHeight: q.uth ? 1.9 : 1.4 }}>{q.q}</div>
      {q.kind === 'listen' && <button type="button" onClick={() => playAyah(q)} style={{ alignSelf: 'center', border: 0, borderRadius: 14, padding: '4px 14px', background: '#fff', color: P[p].d, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>🔊 اسمع تاني</button>}
      <div style={{ display: 'flex', flexDirection: q.opts.length === 2 ? 'row' : 'column', gap: 6 }}>
        {q.opts.map((o, k) => {
          const st = win && win.k === k ? 'ok' : lock[p] ? 'off' : null;
          return (
            <motion.button key={k} type="button" onClick={() => tap(p, k)} disabled={!!win || lock[p]} animate={win && win.p === p && win.k === k ? { scale: [1, 1.06, 1] } : {}} className={q.uth ? 'hafs' : ''}
              style={{ flex: 1, border: 0, borderRadius: 16, minHeight: 44, fontFamily: q.uth ? undefined : 'inherit', fontSize: q.uth ? 19 : 17, fontWeight: q.uth ? 400 : 800, cursor: 'pointer', color: st === 'ok' ? '#fff' : '#26336B', background: st === 'ok' ? '#2FB383' : st === 'off' ? '#E5E9F0' : '#fff', boxShadow: st === 'off' ? 'none' : '0 4px 0 #0001', opacity: st === 'off' ? 0.6 : 1 }}>{o.t}</motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {win && win.p === p && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#2FB383cc', color: '#fff', fontSize: 30, fontWeight: 800, textAlign: 'center' }}>+{ar(win.pts || 1)} {(win.pts || 1) > 1 ? 'نقط' : 'نقطة'}! 🎉{bonus === p && <div style={{ fontSize: 20 }}>🔥 ٣ صح ورا بعض!</div>}</motion.div>}
        {lock[p] && !win && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', top: 56, left: 12, right: 12, textAlign: 'center', fontWeight: 800, color: '#fff', background: '#FF7E6B', borderRadius: 14, padding: '4px 8px' }}>غلط! استنى السؤال الجاي…</motion.div>}
      </AnimatePresence>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 8, padding: 10 }}>
      <AnimatePresence>{roundCard && <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 20, display: 'grid', placeItems: 'center', background: '#26336Bcc', color: '#fff', textAlign: 'center' }}><div><div style={{ fontSize: 60 }}>{roundCard.x2 ? '💥' : '🎯'}</div><div style={{ fontSize: 32, fontWeight: 800 }}>{roundCard.t}</div>{roundCard.x2 && <div style={{ fontSize: 20, fontWeight: 800, color: '#FFC93C' }}>كل إجابة صح = نقطتين!</div>}</div></motion.div>}</AnimatePresence>
      {Half({ p: 1, flip: true })}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="اقفل" onClick={back} style={{ width: 40, height: 40 }} />
        <span className="chip">السؤال <bdi>{ar(i + 1)}</bdi> من <bdi>{ar(total)}</bdi>{q.x2 ? ' • ×٢' : ''}</span>
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
        {[['all', { t: 'كل حاجة', c: '#F5A623', ic: 'star' }], ...Object.entries(ALL_CATS)].map(([id, c]) => (
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
  const c = cat === 'all' ? ALL_CATS[q.cat] : ALL_CATS[cat];
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t={cat === 'all' ? 'كل حاجة' : ALL_CATS[cat].t} back={() => setCat(null)} right={<span className="chip">⭐ <bdi>{ar(score)}</bdi></span>} />
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
