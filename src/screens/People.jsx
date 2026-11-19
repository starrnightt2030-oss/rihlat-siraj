// موسوعة الأنبياء الـ٢٥ + الصحابة: شبكة كروت، وكل كارت بيفتح صفحة فيها مين هو، وحكايته، والدرس، والآية
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Btn, Bubble, IconBtn, I, HomeBtn } from '../components/ui';
import { ReciterChip } from '../components/Reciter';
import Practice from '../components/Practice';
import { PROPHETS, SAHABA } from '../data/people';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush } from '../lib/voice';

export const quizQ = (p, kind) => (kind === 'anbiya' ? 'مين النبي ده؟ ' : 'مين الصحابي ده؟ ') + p.who.split('،')[0].split('.')[0];
export const peopleLine = (p, kind) => (kind === 'anbiya' ? 'سيدنا ' + p.n.replace(' ﷺ', ' صلى الله عليه وسلم') + '. ' : p.n + '، ' + p.lq + '. ') + p.who + ' ' + p.story + ' الدرس: ' + p.lesson;
const KIND = {
  anbiya: { list: PROPHETS, t: 'الأنبياء الـ٢٥', sub: 'المذكورين في القرآن الكريم', c: '#3FA9F5', intro: 'ربنا ذكر في القرآن ٢٥ نبي بأسمائهم. اختار نبي وأنا أحكيلك عنه!' },
  sahaba: { list: SAHABA, t: 'الصحابة الكرام', sub: 'أصحاب النبي ﷺ', c: '#2FB383', intro: 'الصحابة هم اللي آمنوا بالنبي ﷺ وعاشوا معاه. تعالى نتعرّف على أشهرهم!' },
};
const Badge = ({ p, size = 64 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: `radial-gradient(circle at 35% 30%, #fff, ${p.c}33 60%, ${p.c}66)`, border: `3px solid ${p.c}`, display: 'grid', placeItems: 'center', fontSize: size * 0.5, flexShrink: 0 }} aria-hidden="true">{p.ic}</div>
);

export default function People({ arg, go, back, kind }) {
  const K = KIND[kind];
  const id = arg || '';
  if (id === 'quiz') return <PeopleQuiz kind={kind} back={back} />;
  const p = K.list.find((x) => x.id === id);
  if (p) return <Detail key={p.id} p={p} kind={kind} go={go} back={back} />;
  return <List kind={kind} go={go} back={back} />;
}

function List({ kind, go, back }) {
  const K = KIND[kind];
  useEffect(() => { say(K.intro); return () => hush(); }, []);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 26, fontWeight: 800, color: K.c, lineHeight: 1.1 }}>{K.t}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{K.sub}</div></div>
        <HomeBtn />
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="read" size={76} />
        <Bubble tail="r" style={{ flex: 1, fontSize: 16, marginBottom: 8 }}>{K.intro}</Bubble>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${kind === 'anbiya' ? 3 : 2}, minmax(0,1fr))`, gap: 8 }}>
        {K.list.map((p, k) => (
          <motion.button key={p.id} type="button" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: Math.min(k * 0.025, 0.5) }} whileTap={{ scale: 0.94 }} onClick={() => { sfx.pop(); go(kind === 'anbiya' ? 'anbiya25' : 'sahaba', p.id); }} className="card"
            style={{ position: 'relative', border: `3px solid ${p.c}55`, padding: '10px 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', background: '#fff' }}>
            {kind === 'anbiya' && <span className="num" style={{ '--c': p.c, position: 'absolute', top: 4, right: 4, width: 24, height: 24, fontSize: 12 }}>{ar(k + 1)}</span>}
            <Badge p={p} size={kind === 'anbiya' ? 54 : 60} />
            <span style={{ fontSize: kind === 'anbiya' ? 15 : 15, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>{kind === 'anbiya' ? p.n : p.n}</span>
            {kind === 'sahaba' && <span style={{ fontSize: 11, fontWeight: 800, color: p.c }}>{p.lq}</span>}
          </motion.button>
        ))}
      </div>
      <Btn className="block" onClick={() => go(kind === 'anbiya' ? 'anbiya25' : 'sahaba', 'quiz')} style={{ position: 'relative', '--c': K.c, '--d': '#26336B55', '--t': '#fff' }}>⭐ اختبر نفسك</Btn>
    </div>
  );
}

function Detail({ p, kind, go, back }) {
  const K = KIND[kind]; const L = K.list; const i = L.indexOf(p);
  const win = useStore((s) => s.win);
  useEffect(() => { say(peopleLine(p, kind), p.aud ? [].concat(p.aud) : []); win('seen_' + kind, 0); return () => hush(); }, [p.id]);
  const nav = (d) => { const q = L[(i + d + L.length) % L.length]; sfx.whoosh(); go(kind === 'anbiya' ? 'anbiya25' : 'sahaba', q.id); };
  const Sec = ({ t, c, children }) => (
    <div className="card" style={{ padding: '10px 14px', borderRight: `6px solid ${c}` }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{t}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 10 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <span className="chip" style={{ flex: 1, justifyContent: 'center' }}>{K.t} · <bdi>{ar(i + 1)}</bdi>/<bdi>{ar(L.length)}</bdi></span>
        <HomeBtn />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={p.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: `linear-gradient(180deg, ${p.c}22, #fff)` }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}><Badge p={p} size={96} /></motion.div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#26336B', textAlign: 'center' }}>{kind === 'anbiya' ? (p.id === 'muhammad' ? 'سيدنا محمد ﷺ' : `سيدنا ${p.n} عليه السلام`) : `${p.n} رضي الله ${['khadija', 'aisha', 'fatima'].includes(p.id) ? 'عنها' : 'عنه'}`}</div>
            {kind === 'sahaba' && <span style={{ background: p.c, color: '#fff', borderRadius: 14, padding: '0 12px', fontWeight: 800 }}>{p.lq}</span>}
          </div>
          <Sec t="مين هو؟" c={p.c}>{p.who}</Sec>
          <Sec t={kind === 'anbiya' ? 'حكايته باختصار' : 'موقف من حياته'} c="#F5A623">{p.story}</Sec>
          {p.ayah && (
            <div className="card dash" style={{ '--c': '#F2A5C2', padding: '12px 14px', textAlign: 'center', background: '#FFF6FA' }}>
              <div className="ayah" style={{ fontSize: p.ayah.length > 90 ? 20 : 24, color: '#B03A64', lineHeight: 1.9 }}>﴿{p.ayah}﴾</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A6A70' }}>{p.ref}</div>
              <div style={{ marginTop: 6 }}><ReciterChip codes={[].concat(p.aud)} /></div>
            </div>
          )}
          <Sec t="الدرس ليّا" c="#2FB383">{p.lesson}</Sec>
          {p.story_id && <Btn className="block" tone="white" onClick={() => go('stories', p.story_id)}>📖 اسمع حكايته كاملة</Btn>}
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 'auto' }}>
        <IconBtn icon={I.sound} label="اسمع تاني" sound="tap" onClick={() => say(peopleLine(p, kind), p.aud ? [].concat(p.aud) : [])} style={{ width: 56, height: 56, borderRadius: 28 }} />
        <Btn tone="white" onClick={() => nav(-1)} style={{ flex: 1 }}>السابق</Btn>
        <Btn className="block" onClick={() => nav(1)} style={{ flex: 1.4, '--c': p.c, '--d': '#26336B44', '--t': '#fff' }}>اللي بعده</Btn>
      </div>
    </div>
  );
}

// اختبر نفسك: الرمز أو المعلومة ← مين؟
function PeopleQuiz({ kind, back }) {
  const K = KIND[kind];
  const qs = useMemo(() => [...K.list].sort(() => Math.random() - 0.5).slice(0, 6).map((p) => {
    const others = K.list.filter((x) => x.id !== p.id).sort(() => Math.random() - 0.5).slice(0, 2);
    return { k: 'pick', q: quizQ(p, kind), opts: [p.n, ...others.map((o) => o.n)], c: 0, after: p.lesson };
  }), []);
  const [i, setI] = useState(0), [ok, setOk] = useState(false), [end, setEnd] = useState(false);
  const win = useStore((s) => s.win);
  useEffect(() => { setOk(false); if (!end) say(qs[i].q); }, [i, end]);
  if (end) return (
    <div className="screen" style={{ gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Sky /><Siraj pose="party" size={150} />
      <div style={{ position: 'relative', fontSize: 26, fontWeight: 800 }}>برافو! انت عارفهم كويس</div>
      <Btn className="block" onClick={back} style={{ position: 'relative' }}>رجوع</Btn>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <div className="progress" style={{ flex: 1, height: 14 }}><i style={{ width: `${((i + (ok ? 1 : 0)) / qs.length) * 100}%`, background: K.c }} /></div>
        <HomeBtn />
      </div>
      <motion.div key={i} data-step initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Practice s={qs[i]} u={{ color: K.c, dark: K.c, soft: '#fff' }} g="boy" onSolve={() => setOk(true)} />
      </motion.div>
      <Btn className="block" disabled={!ok} onClick={() => { if (!ok) return; if (i < qs.length - 1) setI(i + 1); else { win('people_' + kind, 3); setEnd(true); say('برافو! انت عارفهم كويس'); } }}
        style={{ position: 'relative', '--c': ok ? K.c : '#C9D1DE', '--d': ok ? '#26336B44' : '#AAB4C4', '--t': '#fff' }}>{ok ? (i < qs.length - 1 ? 'السؤال اللي بعده' : 'خلّصت!') : 'اختار الإجابة'}</Btn>
    </div>
  );
}
