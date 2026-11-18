import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, Icon } from '../components/ui';
import { UNITS } from '../data/units';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, recite } from '../lib/voice';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const COL = ['#F5A623', '#2FB383', '#E0609E', '#3A8FE0', '#7B5CE0', '#1F8FA6'];
const Head = ({ t, back, right }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
    <IconBtn icon={I.back} label="رجوع" onClick={back} />
    <h1 style={{ flex: 1, fontSize: 25, fontWeight: 800 }}>{t}</h1>{right}
  </div>
);
function Win({ text, again }) {
  const win = useStore((s) => s.win);
  useEffect(() => { sfx.good(); say(text); win('learn', 3); }, []);
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
      <Confetti n={30} />
      <Siraj pose="party" size={140} />
      <Bubble tail="b">{text} خدت +٣ نور</Bubble>
      <Btn className="block" tone="grape" sound="pop" onClick={again}>العب تاني</Btn>
    </motion.div>
  );
}

// ١) رتّب خطوات الوضوء
const WUDU = ['غسل الكفّين', 'المضمضة', 'الاستنشاق', 'غسل الوجه', 'غسل اليدين للمرفقين', 'مسح الرأس', 'مسح الأذنين', 'غسل القدمين'];
export function OrderGame({ back, age }) {
  const n = age === '4-6' ? 4 : age === '7-9' ? 6 : 8;
  const steps = WUDU.slice(0, n);
  const [seed, setSeed] = useState(0);
  const pool = useMemo(() => shuffle(steps.map((t, i) => ({ t, i }))), [seed, n]);
  const [got, setGot] = useState([]), [bad, setBad] = useState(null);
  useEffect(() => { say('رتّب الخطوات بالترتيب الصح'); }, [seed]);
  const tap = (x) => {
    if (got.includes(x.i)) return;
    if (x.i === got.length) { sfx.drop(); setGot([...got, x.i]); }
    else { sfx.soft(); setBad(x.i); setTimeout(() => setBad(null), 500); }
  };
  const won = got.length === steps.length;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <Head t="رتّب الوضوء" back={back} right={<span className="chip" style={{ paddingInline: 12 }}>{ar(got.length)}/{ar(steps.length)}</span>} />
      <Bubble style={{ position: 'relative' }}>{won ? 'برافو! الترتيب صح' : `إيه الخطوة رقم ${ar(got.length + 1)}؟ دوس عليها`}</Bubble>
      <div className="card" style={{ position: 'relative', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, background: '#F4FBF7' }}>
        {steps.map((t, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, borderRadius: 14, padding: '4px 8px', background: k < got.length ? '#fff' : 'transparent', border: k < got.length ? 0 : '2px dashed #CDE9DA' }}>
            <span className="num" style={{ '--c': k < got.length ? COL[k % 6] : '#CDE9DA', width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span>
            {k < got.length && <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ fontSize: 18, fontWeight: 800 }}>{t}</motion.span>}
          </div>
        ))}
      </div>
      {!won && (
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {pool.filter((x) => !got.includes(x.i)).map((x) => (
            <motion.button key={x.i} type="button" onClick={() => tap(x)} animate={bad === x.i ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
              style={{ border: 0, borderRadius: 20, padding: '10px 16px', fontFamily: 'inherit', fontSize: 18, fontWeight: 800, cursor: 'pointer', color: '#26336B', background: bad === x.i ? '#FFD9D2' : '#fff', boxShadow: '0 5px 0 #E2DACB' }}>{x.t}</motion.button>
          ))}
        </div>
      )}
      {won && <Win text="برافو! الترتيب صح" again={() => { setGot([]); setSeed(seed + 1); }} />}
    </div>
  );
}

// ٢) كمّل الآية: نشيل آخر كلمة من آية ونختار الصح
const VERSES = UNITS.find((u) => u.id === 'quran').cards.flatMap((c) => { const s = c.steps.find((x) => x.k === 'surah'); return s.verses.map(([v], k) => ({ v, sura: s.name, code: s.sura + String(k + 1).padStart(3, '0') })); }).filter((x) => x.v.split(' ').length >= 2);
export function FillGame({ back }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shuffle(VERSES).slice(0, 5).map((x) => {
    const w = x.v.split(' '); const ans = w[w.length - 1];
    const others = shuffle([...new Set(VERSES.map((y) => y.v.split(' ').pop()).filter((t) => t !== ans))]).slice(0, 2);
    return { ...x, head: w.slice(0, -1).join(' '), ans, opts: shuffle([ans, ...others]) };
  }), [seed]);
  const [r, setR] = useState(0), [pick, setPick] = useState(null), [score, setScore] = useState(0);
  useEffect(() => { say('اختار الكلمة الناقصة'); }, [seed]);
  const R = rounds[r];
  const done = r >= rounds.length;
  const choose = (o) => {
    if (pick === R.ans) return; setPick(o);
    if (o === R.ans) { sfx.good(); recite([R.code]); setScore(score + 1); setTimeout(() => { setPick(null); setR(r + 1); }, 2600); }
    else { sfx.soft(); setTimeout(() => setPick(null), 800); }
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="lilac" />
      <Head t="كمّل الآية" back={back} right={<span className="chip" style={{ paddingInline: 12 }}>{ar(Math.min(r + 1, 5))}/{ar(5)}</span>} />
      {!done ? (
        <>
          <div className="card dash" style={{ position: 'relative', '--c': '#C9B8F2', padding: '18px 14px', textAlign: 'center', background: '#FBF9FF' }}>
            <span className="ribbon" style={{ '--c': '#9B7BF2', fontSize: 15 }}>سورة {R.sura}</span>
            <div className="ayah" style={{ fontSize: 30, marginTop: 10, color: '#26336B' }}>
              {R.head} <span style={{ display: 'inline-block', minWidth: 90, borderBottom: '4px dashed #9B7BF2', color: pick === R.ans ? '#2FB383' : 'transparent' }}>{pick === R.ans ? R.ans : '؟'}</span>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {R.opts.map((o) => {
              const right = pick === o && o === R.ans, wrong = pick === o && o !== R.ans;
              return (
                <motion.button key={o} type="button" onClick={() => choose(o)} animate={wrong ? { x: [0, -10, 10, -6, 6, 0] } : {}} className="ayah"
                  style={{ border: 0, borderRadius: 22, minHeight: 64, fontSize: 28, cursor: 'pointer', color: right || wrong ? '#fff' : '#26336B', background: right ? '#2FB383' : wrong ? '#FF7E6B' : '#fff', boxShadow: `0 5px 0 ${right ? '#22946A' : wrong ? '#E0563F' : '#E6DEF6'}` }}>{o}</motion.button>
              );
            })}
          </div>
          {pick === R.ans && <div style={{ position: 'relative', textAlign: 'center', fontWeight: 800, color: '#6E4FD0' }}><Icon d={I.sound} size={18} color="#6E4FD0" /> اسمع الشيخ وكرّر وراه</div>}
        </>
      ) : <Win text={`برافو! عرفت ${ar(score)} آيات`} again={() => { setR(0); setScore(0); setSeed(seed + 1); }} />}
    </div>
  );
}

// ٣) وصّل الذكر بوقته
const PAIRS = [['لما أصحى', 'الحمد لله الذي أحيانا'], ['قبل الأكل', 'بسم الله'], ['وأنا خارج من البيت', 'توكلت على الله'], ['قبل النوم', 'باسمك اللهم أموت وأحيا'], ['لما أشوف حاجة حلوة', 'ما شاء الله']];
export function MatchGame({ back, age }) {
  const n = age === '4-6' ? 3 : 5;
  const [seed, setSeed] = useState(0);
  const set = useMemo(() => shuffle(PAIRS).slice(0, n), [seed, n]);
  const rightCol = useMemo(() => shuffle(set.map((p, i) => ({ t: p[1], i }))), [set]);
  const [sel, setSel] = useState(null), [ok, setOk] = useState([]), [bad, setBad] = useState(null);
  useEffect(() => { say('وصّل كل ذكر بوقته'); }, [seed]);
  const tapR = (x) => {
    if (sel === null || ok.includes(x.i)) return;
    if (x.i === sel) { sfx.sparkle(); setOk([...ok, x.i]); setSel(null); }
    else { sfx.soft(); setBad(x.i); setTimeout(() => setBad(null), 500); }
  };
  const won = ok.length === set.length;
  const cell = (on, done, c) => ({ minHeight: 62, border: 0, borderRadius: 20, padding: '6px 10px', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, lineHeight: 1.35, cursor: 'pointer', color: done ? '#fff' : '#26336B', background: done ? c : on ? '#FFF3D6' : '#fff', boxShadow: `0 5px 0 ${done ? '#0002' : on ? '#F5C46B' : '#E2DACB'}`, outline: on ? '3px solid #F5A623' : 'none' });
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t="وصّل الذكر بوقته" back={back} />
      <Bubble style={{ position: 'relative' }}>{won ? 'برافو!' : sel === null ? 'اختار الوقت الأول من اليمين' : 'دلوقتي اختار الذكر بتاعه'}</Bubble>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {set.map((p, i) => <button key={i} type="button" onClick={() => { if (!ok.includes(i)) { sfx.tap(); setSel(i); } }} style={cell(sel === i, ok.includes(i), COL[i])}>{p[0]}</button>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightCol.map((x) => (
            <motion.button key={x.i} type="button" onClick={() => tapR(x)} animate={bad === x.i ? { x: [0, -8, 8, -5, 5, 0] } : {}} style={cell(false, ok.includes(x.i), COL[x.i])}>{x.t}</motion.button>
          ))}
        </div>
      </div>
      {won && <Win text="برافو! وصّلت كل الأذكار" again={() => { setOk([]); setSel(null); setSeed(seed + 1); }} />}
    </div>
  );
}
