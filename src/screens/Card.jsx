import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import Reward from '../components/Reward';
import { Btn, Bubble, IconBtn, Icon, I } from '../components/ui';
import { cardById, ALL_CARDS } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, recite } from '../lib/voice';
import { stepLine } from '../data/speech';

const tashkeel = (t) => (t.match(/[\u064B-\u0652]/g) || []).length >= 3;
const TILE = ['#FFF3D6', '#E6F6EE', '#FFEAF2', '#E6F0FF', '#F1ECFF', '#E3F6FA'];
const TILE_C = ['#F5A623', '#2FB383', '#E0609E', '#3A8FE0', '#7B5CE0', '#1F8FA6'];
const audOf = (s) => s.k === 'ayah' && s.aud ? [s.aud] : s.k === 'surah' ? s.verses.map((_, k) => s.sura + String(k + 1).padStart(3, '0')) : [];
const speak = (s) => say(stepLine(s), audOf(s));

export default function Card({ arg, go, back }) {
  const c = cardById(arg) || ALL_CARDS[0];
  const u = c.unit;
  const complete = useStore((s) => s.complete);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('learn');
  const [pick, setPick] = useState(null), [miss, setMiss] = useState(0), [res, setRes] = useState(null);
  const step = c.steps[i];
  const total = c.steps.length + 1;
  const pos = phase === 'learn' ? i + 1 : total;
  useEffect(() => () => hush(), []);
  useEffect(() => { if (phase === 'learn') speak(step); else if (phase === 'quiz') say(c.quiz.q); }, [i, phase]);

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
        <span className="ribbon" style={{ '--c': u.color, fontSize: 14, padding: '2px 12px' }}>{c.title}</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'learn' && (
          <motion.div key={i} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Step s={step} u={u} />
          </motion.div>
        )}
        {phase === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <img src={A('characters/bashir/hero')} alt="بشير" className="float" style={{ width: 100, height: 112, objectFit: 'contain', flexShrink: 0 }} />
              <Bubble tail="r" style={{ flex: 1, marginBottom: 10 }}><div style={{ fontSize: 14, fontWeight: 800, color: '#7B5CE0' }}>بشير بيسألك</div><div style={{ fontSize: 20, fontWeight: 800 }}>{c.quiz.q}</div></Bubble>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {c.quiz.a.map((t, k) => {
                const right = pick === k && k === c.quiz.c, wrong = pick === k && !right;
                const col = ['#FF9A7A', '#4ED7A3', '#FFB0CC'][k % 3];
                return (
                  <motion.button key={k} type="button" onClick={() => answer(k)} animate={wrong ? { x: [0, -12, 12, -8, 8, 0] } : right ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.4 }}
                    className={c.quiz.a[k].length < 40 && /[ً-ْ]/.test(t) ? 'ayah' : ''}
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
          <Btn className="block" sound="" onClick={next} style={{ flex: 1, '--c': u.color, '--d': u.dark, '--t': '#fff', minHeight: 62 }}>{i < c.steps.length - 1 ? 'التالي' : 'يلا نجرّب!'}</Btn>
        </div>
      )}

      {phase === 'reward' && res && <Reward result={res} chest={u.cards[u.cards.length - 1].id === c.id} region={{ name: u.title }} onHome={() => go('island')} onRegion={() => go('unit', u.id)} />}
    </div>
  );
}

function Step({ s, u }) {
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
          {s.aud && <button type="button" onClick={() => recite([s.aud])} style={{ marginTop: 8, border: 0, borderRadius: 16, padding: '4px 14px', background: '#fff', color: '#B03A64', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 3px 0 #F2C4D6' }}>اسمع الآية من الشيخ</button>}
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
  if (s.k === 'surah') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ textAlign: 'center' }}><span className="ribbon" style={{ '--c': u.color, fontSize: 18 }}>سورة {s.name}</span><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896', marginTop: 4 }}>دوس على أي آية تسمعها وكرّرها</div></div>
      {s.name !== 'الفاتحة' && <div className="ayah" style={{ textAlign: 'center', fontSize: 20, color: '#6E4FD0' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
      {s.verses.map(([v, m], k) => (
        <motion.button type="button" key={k} onClick={() => { sfx.tap(); recite([s.sura + String(k + 1).padStart(3, '0')]); }} aria-label={'اسمع الآية ' + (k + 1)} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.08 }} className="card"
          style={{ border: 0, cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, background: TILE[k % 6], boxShadow: `0 4px 0 ${TILE_C[k % 6]}33` }}>
          <span className="num" style={{ '--c': TILE_C[k % 6], width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ayah" style={{ fontSize: 23, color: '#26336B', lineHeight: 1.7 }}>{v}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TILE_C[k % 6] }}>{m}</div>
          </div>
          <Icon d={I.sound} size={22} color={TILE_C[k % 6]} />
        </motion.button>
      ))}
    </div>
  );
  return null;
}
