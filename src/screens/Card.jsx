import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import Reward from '../components/Reward';
import { Btn, Bubble, IconBtn, Icon, I, HomeBtn } from '../components/ui';
import { cardById, ALL_CARDS } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, recite, onAyah, leave } from '../lib/voice';
import { stepLine, stepPost } from '../data/speech';
import Q30 from '../data/quran30.json';
import Art from '../art';
import Practice, { PRACTICE } from '../components/Practice';
import { ReciterChip } from '../components/Reciter';
import { RAKAT } from '../data/units';

const tashkeel = (t) => (t.match(/[\u064B-\u0652]/g) || []).length >= 3;
const TILE = ['#FFF3D6', '#E6F6EE', '#FFEAF2', '#E6F0FF', '#F1ECFF', '#E3F6FA'];
const TILE_C = ['#F5A623', '#2FB383', '#E0609E', '#3A8FE0', '#7B5CE0', '#1F8FA6'];
const codeOf = (s, k) => s.sura + String((s.from || 1) + k).padStart(3, '0');
const audOf = (s) => s.k === 'ayah' && s.aud ? [].concat(s.aud) : s.k === 'surah' ? s.verses.map((_, k) => codeOf(s, k)) : [];
// نص المصحف (حفص) للسور اللي عندنا، عشان الكتابة تبقى مطابقة للمصحف
const uth = (s, k, v) => Q30[+s.sura]?.ayat[(s.from || 1) - 1 + k] || v;
const speak = (s) => say(stepLine(s), audOf(s), stepPost(s));
// السور الطويلة متقسّمة على كذا درس: الجزء اللي بعد ده (نفس السورة، والآيات اللي بعدها على طول)
const nextPart = (s) => ALL_CARDS.find((c) => c.steps?.some((t) => t.k === 'surah' && t.sura === s.sura && (t.from || 1) === (s.from || 1) + s.verses.length));
// لما الشيخ يخلّص جزء ويكمّل على اللي بعده، الدرس الجديد يبدأ بالتلاوة على طول من غير مقدمة
let contId = null;

export default function Card({ arg, go, back, swap }) {
  const c = cardById(arg) || ALL_CARDS[0];
  const u = c.unit;
  const complete = useStore((s) => s.complete);
  const [cont] = useState(() => { const v = contId === c.id; contId = null; return v; });
  const [i, setI] = useState(() => (cont ? Math.max(0, c.steps.findIndex((s) => s.k === 'surah')) : 0));
  const [phase, setPhase] = useState('learn');
  const [pick, setPick] = useState(null), [miss, setMiss] = useState(0), [res, setRes] = useState(null);
  const step = c.steps[i];
  const g = useStore((st) => st.profile?.gender) === 'girl' ? 'girl' : 'boy';
  const [solved, setSolved] = useState(false);
  useEffect(() => setSolved(false), [i]);
  const locked = phase === 'learn' && PRACTICE.has(step.k) && !solved;
  const total = c.steps.length + 1;
  const pos = phase === 'learn' ? i + 1 : total;
  useEffect(() => () => leave(), []);
  const first = useRef(true);
  useEffect(() => { const c0 = cont && first.current && step.k === 'surah'; first.current = false; if (c0) recite(audOf(step)); else if (phase === 'learn') speak(step); else if (phase === 'quiz') say(c.quiz.uth ? 'كمّل الآية دي!' : c.quiz.q); }, [i, phase]);

  const next = () => { sfx.whoosh(); if (i < c.steps.length - 1) setI(i + 1); else setPhase('quiz'); };
  const answer = (k) => {
    if (pick === c.quiz.c) return;
    setPick(k);
    if (k === c.quiz.c) {
      sfx.good(); say('شاطر!');
      setTimeout(() => {
        const last = u.cards[u.cards.length - 1].id === c.id;
        setRes({ stars: Math.max(1, 3 - miss), ...complete(c.id, Math.max(1, 3 - miss), { light: 5, spark: c.spark, sticker: last ? u.sticker : null }) });
        setPhase('reward');
      }, 1100);
    } else { sfx.soft(); setMiss(miss + 1); say('قربت! فكّر تاني'); setTimeout(() => setPick(null), 1000); }
  };

  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone={u.sky} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="اقفل" onClick={back} />
        <div style={{ flex: 1, height: 16, borderRadius: 8, background: '#fff', overflow: 'hidden', boxShadow: 'inset 0 2px 0 #EEE7D8' }} aria-label={`الخطوة ${pos} من ${total}`}>
          <div style={{ height: '100%', width: `${(pos / total) * 100}%`, borderRadius: 8, background: `linear-gradient(90deg, ${u.color}, ${u.dark})`, transition: 'width .4s' }} />
        </div>
        <HomeBtn />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'learn' && (
          <motion.div data-step key={i} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRACTICE.has(step.k) ? <Practice s={step} u={u} g={g} onSolve={() => setSolved(true)} /> : <Step s={step} u={u} g={g} onMore={(id) => { contId = id; swap('card', id); }} />}
          </motion.div>
        )}
        {phase === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <img src={A('characters/bashir/hero')} alt="بشير" className="float" style={{ width: 100, height: 112, objectFit: 'contain', flexShrink: 0 }} />
              <Bubble tail="r" style={{ flex: 1, marginBottom: 10 }}><div style={{ fontSize: 14, fontWeight: 800, color: '#7B5CE0' }}>بشير بيسألك</div><div style={{ fontSize: 20, fontWeight: 800 }}>{c.quiz.uth ? <>كمّل الآية: <span className="hafs" style={{ fontSize: 23, fontWeight: 400 }}>{c.quiz.q.replace(/^كمّل: /, '')}</span></> : c.quiz.q}</div></Bubble>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {c.quiz.a.map((t, k) => {
                const right = pick === k && k === c.quiz.c, wrong = pick === k && !right;
                const col = ['#FF9A7A', '#4ED7A3', '#FFB0CC'][k % 3];
                return (
                  <motion.button key={k} type="button" onClick={() => answer(k)} animate={wrong ? { x: [0, -12, 12, -8, 8, 0] } : right ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.4 }}
                    className={c.quiz.uth ? 'hafs' : c.quiz.a[k].length < 40 && /[ً-ْ]/.test(t) ? 'ayah' : ''}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 68, padding: '8px 14px', border: 0, borderRadius: 24, cursor: 'pointer', fontFamily: /[ً-ْ]/.test(t) ? "'Amiri', serif" : 'inherit', fontSize: /[ً-ْ]/.test(t) ? 24 : 20, fontWeight: 800, textAlign: 'right',
                      color: right || wrong ? '#fff' : '#26336B', background: right ? '#2FB383' : wrong ? '#FF7E6B' : '#fff', boxShadow: `0 6px 0 ${right ? '#22946A' : wrong ? '#E0563F' : '#E8E0D0'}` }}>
                    <span className="num" style={{ '--c': right || wrong ? '#fff' : col, color: right ? '#22946A' : wrong ? '#E0563F' : '#fff', fontFamily: "'Baloo Bhaijaan 2'" }}>{ar(k + 1)}</span>
                    <span style={{ flex: 1 }}>{t}</span>
                    {right && <Icon d={I.check} color="#fff" w={4} />}
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {pick !== null && (
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 24, padding: '8px 12px', boxShadow: '0 6px 0 #EEE7D8' }}>
                  <Siraj pose={pick === c.quiz.c ? 'party' : 'think'} size={74} still />
                  <span style={{ flex: 1, fontSize: 19, fontWeight: 800, color: pick === c.quiz.c ? '#1F8A61' : '#B85A2E' }}>{pick === c.quiz.c ? 'شاطر! إجابة صح' : 'قربت! فكّر تاني'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'learn' && (
        <div style={{ position: 'relative', display: 'flex', gap: 10, alignItems: 'center' }}>
          <IconBtn icon={I.sound} label="اسمع تاني" sound="tap" color={u.dark} onClick={() => speak(step)} style={{ width: 60, height: 60, borderRadius: 30 }} />
          {i > 0 && <IconBtn icon={I.back} label="اللي قبله" onClick={() => setI(i - 1)} style={{ width: 60, height: 60, borderRadius: 30, transform: 'scaleX(-1)' }} />}
          <Btn className="block" sound="" disabled={locked} onClick={() => !locked && next()} style={{ flex: 1, '--c': locked ? '#C9D1DE' : u.color, '--d': locked ? '#AAB4C4' : u.dark, '--t': '#fff', minHeight: 62 }}>{locked ? 'حلّ التمرين الأول' : i < c.steps.length - 1 ? 'التالي' : 'يلا نجرّب!'}</Btn>
        </div>
      )}

      {phase === 'reward' && res && <Reward result={res} chest={u.cards[u.cards.length - 1].id === c.id} region={{ name: u.title }} onHome={() => go('island')} onRegion={() => go('unit', u.id)} />}
    </div>
  );
}

function Step({ s, u, g, onMore }) {
  if (s.k === 'pose' || s.k === 'wudu' || s.k === 'scene') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="card" style={{ position: 'relative', padding: '14px 10px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: u.soft }}>
        {s.n && <span className="num" style={{ '--c': u.color, position: 'absolute', top: 10, right: 10 }}>{ar(s.n)}</span>}
        {s.count && <span style={{ position: 'absolute', top: 12, left: 12, background: '#2E9BC9', color: '#fff', borderRadius: 14, padding: '2px 12px', fontSize: 15, fontWeight: 800 }}>{s.count}</span>}
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Art a={s.k === 'pose' ? { kid: s.pose } : s.k === 'wudu' ? { wudu: s.step } : { scene: s.scene }} g={g} size={s.k === 'scene' ? 270 : s.k === 'wudu' ? 250 : 240} />
        </motion.div>
        {s.name && <span className="ribbon" style={{ '--c': u.color, fontSize: 19, marginTop: 6 }}>{s.name}</span>}
      </div>
      {s.girl && g === 'girl' && <div className="card" style={{ padding: '8px 12px', fontSize: 16, fontWeight: 800, color: '#B8437C', background: '#FFF0F6' }}>{s.girl}</div>}
      {s.dhikr && <div className="card dash" style={{ '--c': '#9FD3B6', padding: '8px 12px', textAlign: 'center', background: '#F4FBF7' }}><div style={{ fontSize: 13, fontWeight: 800, color: '#2FB383' }}>نقول</div><div className="ayah" style={{ fontSize: 23, color: '#1F7A55' }}>{s.dhikr}</div></div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="wave" size={80} />
        <Bubble tail="r" style={{ flex: 1, fontSize: 18, marginBottom: 8, lineHeight: 1.5 }}>{s.t}</Bubble>
      </div>
    </div>
  );
  if (s.k === 'rakat') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ textAlign: 'center' }}><span className="ribbon" style={{ '--c': u.color, fontSize: 18 }}>كل صلاة كام ركعة؟</span></div>
      {RAKAT.map(([name, n, time, ic], k) => (
        <motion.div key={name} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + k * 0.12 }} className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: TILE[k % 6], boxShadow: `0 5px 0 ${TILE_C[k % 6]}33` }}>
          <span style={{ fontSize: 26 }} aria-hidden>{ic}</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 21, fontWeight: 800 }}>{name}</div><div style={{ fontSize: 13, fontWeight: 700, color: TILE_C[k % 6] }}>{time}</div></div>
          <div style={{ display: 'flex', gap: 4 }} aria-label={`${n} ركعات`}>{Array.from({ length: n }).map((_, j) => <motion.span key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + k * 0.12 + j * 0.08 }} style={{ width: 20, height: 26, borderRadius: '10px 10px 6px 6px', background: TILE_C[k % 6] }} />)}</div>
          <span className="num" style={{ '--c': TILE_C[k % 6] }}>{ar(n)}</span>
        </motion.div>
      ))}
      <div className="card" style={{ padding: '8px 12px', textAlign: 'center', fontSize: 16, fontWeight: 800, color: u.dark }}>المجموع <bdi>{ar(17)}</bdi> ركعة كل يوم</div>
    </div>
  );
  if (s.k === 'say') return (
    <>
      <div className="card" style={{ padding: 6, overflow: 'hidden', flexShrink: 0 }}>
        <img src={A(s.img)} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1.35', objectFit: s.img.startsWith('games/memory') || s.img.startsWith('characters') ? 'contain' : 'cover', borderRadius: 20, background: u.soft }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="wave" size={92} />
        <Bubble tail="r" style={{ flex: 1, fontSize: 20, marginBottom: 12 }}>{s.t}</Bubble>
      </div>
    </>
  );
  if (s.k === 'ayah' || s.k === 'hadith') {
    const ay = s.k === 'ayah';
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
        <div className="card dash" style={{ '--c': ay ? '#F2A5C2' : '#9FD3B6', padding: '18px 16px 14px', textAlign: 'center', background: ay ? '#FFF6FA' : '#F4FBF7' }}>
          <span className="ribbon" style={{ '--c': ay ? '#FF89B5' : '#2FB383', fontSize: 15 }}>{ay ? 'ربنا قال في القرآن' : 'النبي ﷺ علّمنا'}</span>
          <div className="ayah" style={{ fontSize: ay ? 32 : 26, color: ay ? '#B03A64' : '#1F7A55', margin: '10px 0 4px' }}>{ay ? `﴿${s.t}﴾` : `«${s.t}»`}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7A6A70' }}>{s.ref}</div>
          {s.aud && <div style={{ marginTop: 8 }}><ReciterChip codes={[].concat(s.aud)} /></div>}
        </div>
        {s.mean && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <Siraj pose="happy" size={78} />
            <Bubble tail="r" style={{ flex: 1, fontSize: 19, marginBottom: 8 }}><span style={{ color: u.dark, fontWeight: 800 }}>يعني: </span>{s.mean}</Bubble>
          </div>
        )}
      </div>
    );
  }
  if (s.k === 'tips') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ textAlign: 'center' }}><span className="ribbon" style={{ '--c': u.color, fontSize: 18 }}>أعمل إيه في حياتي؟</span></div>
      {s.items.map((t, k) => (
        <motion.div key={k} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + k * 0.15 }} className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', background: TILE[k % 6], boxShadow: `0 5px 0 ${TILE_C[k % 6]}33` }}>
          <span className="num" style={{ '--c': TILE_C[k % 6] }}>{ar(k + 1)}</span>
          <span style={{ flex: 1, fontSize: 20, fontWeight: 800, lineHeight: 1.4 }}>{t}</span>
          <Icon d={I.heart} color={TILE_C[k % 6]} />
        </motion.div>
      ))}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}><Siraj pose="jump" size={110} /></div>
    </div>
  );
  if (s.k === 'grid') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ textAlign: 'center' }}><span className="ribbon" style={{ '--c': u.color, fontSize: 18 }}>{s.title}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {s.items.map(([t, sub], k) => (
          <motion.div key={k} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: k * 0.06 }} className="tile"
            style={{ '--bg': TILE[k % 6], '--c': TILE_C[k % 6] + '88', gridColumn: s.items.length % 2 && k === s.items.length - 1 ? 'span 2' : undefined }}>
            <span className="num" style={{ '--c': TILE_C[k % 6], position: 'absolute', top: -10, right: -6, width: 30, height: 30, fontSize: 16 }}>{ar(k + 1)}</span>
            <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{t}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: TILE_C[k % 6], background: '#fff', borderRadius: 10, padding: '0 8px' }}>{sub}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
  if (s.k === 'surah') return <Surah s={s} u={u} onMore={onMore} />;
  return null;
}

function Surah({ s, u, onMore }) {
  const [now, setNow] = useState(null), [auto, setAuto] = useState(false);
  const from = s.from || 1, total = Q30[+s.sura]?.ayat.length || from + s.verses.length - 1, to = from + s.verses.length - 1;
  const more = to < total ? nextPart(s) : null, last = codeOf(s, s.verses.length - 1);
  // لو الشيخ قرا الجزء ده لآخره، يكمّل باقي السورة لوحده في الجزء اللي بعده
  useEffect(() => {
    let prev = null; const seen = new Set();
    const off = onAyah((c) => {
      setNow(c);
      if (c) { seen.add(c); setAuto(false); }
      else if (prev === last && seen.size > 1 && more) setAuto(true);
      prev = c;
    });
    return () => { off(); };
  }, []);
  useEffect(() => { if (!auto) return; const t = setTimeout(() => onMore?.(more.id), 1800); return () => clearTimeout(t); }, [auto]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ textAlign: 'center' }}><span className="ribbon" style={{ '--c': u.color, fontSize: 18 }}>سورة {s.name}</span><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896', margin: '4px 0' }}>دوس على أي آية تسمعها وكرّرها</div><ReciterChip codes={s.verses.map((_, k) => codeOf(s, k))} color={u.dark} />{total > s.verses.length && <div style={{ fontSize: 13, fontWeight: 800, color: u.dark, marginTop: 4 }}>الآيات {ar(from)}–{ar(to)} من {ar(total)}</div>}</div>
      {s.sura !== '001' && from === 1 && <div className="hafs" style={{ textAlign: 'center', fontSize: 22, color: '#6E4FD0' }}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>}
      {s.verses.map(([v, m], k) => (
        <motion.button type="button" key={k} onClick={() => { sfx.tap(); recite([codeOf(s, k)]); }} data-now={now === codeOf(s, k) || undefined} aria-label={'اسمع الآية ' + (from + k)} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: Math.min(k, 8) * 0.06 }} className="card"
          style={{ border: now === codeOf(s, k) ? `3px solid ${TILE_C[k % 6]}` : '3px solid transparent', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, background: TILE[k % 6], boxShadow: `0 4px 0 ${TILE_C[k % 6]}33`, transform: now === codeOf(s, k) ? 'scale(1.03)' : 'none', transition: 'transform .2s' }}>
          <span className="num" style={{ '--c': TILE_C[k % 6], width: 30, height: 30, fontSize: 15 }}>{ar(from + k)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hafs" style={{ fontSize: 25, color: '#26336B' }}>{uth(s, k, v)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TILE_C[k % 6] }}>{m}</div>
          </div>
          <Icon d={I.sound} size={22} color={TILE_C[k % 6]} />
        </motion.button>
      ))}
      {more && <motion.button type="button" onClick={() => onMore?.(more.id)} animate={auto ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: auto ? Infinity : 0, duration: 0.8 }}
        style={{ border: 0, borderRadius: 18, padding: 12, background: u.color, color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: `0 5px 0 ${u.dark}` }}>
        {auto ? 'الشيخ هيكمّل السورة…' : `كمّل باقي السورة (الآيات ${ar(to + 1)}–${ar(to + more.steps.find((t) => t.k === 'surah').verses.length)}) ◀`}</motion.button>}
    </div>
  );
}
