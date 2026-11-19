// أذكاري: الصباح والمساء والنوم وحصن الطفل + السبحة + اختبر نفسك
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, Icon, LightChip, HomeBtn } from '../components/ui';
import Practice from '../components/Practice';
import { ReciterChip } from '../components/Reciter';
import DIcon from '../art/Icons';
import { ADHKAR, TASBIH, adhkarById, dhikrLine } from '../data/adhkar';
import { today } from '../data/gifts';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush } from '../lib/voice';

const buzz = (ms = 12) => { try { navigator.vibrate?.(ms); } catch { /* مش مدعوم */ } };
const doneToday = (z) => (z && z.d === today() ? z : { ids: [], secs: [] });
// وقت الأذكار المناسب دلوقتي
const nowSec = () => { const h = new Date().getHours(); return h >= 4 && h < 12 ? 'sabah' : h >= 15 && h < 21 ? 'masa' : h >= 21 || h < 4 ? 'nawm' : null; };

export default function Adhkar({ arg, go, back }) {
  useEffect(() => () => hush(), []);
  if (arg === 'tasbih') return <Tasbih back={back} />;
  if (arg === 'quiz') return <Quiz back={back} go={go} />;
  if (arg && adhkarById(arg)) return <Section sec={adhkarById(arg)} back={back} go={go} />;
  return <Hub go={go} />;
}

function Hub({ go }) {
  const z = doneToday(useStore((s) => s.azkar));
  const tas = useStore((s) => s.tasbih || 0);
  const cur = nowSec();
  useEffect(() => { say(cur ? 'دلوقتي وقت ' + adhkarById(cur).title : 'اختار أذكارك'); }, []);
  return (
    <div className="screen with-nav" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h1 style={{ fontSize: 32, fontWeight: 800 }}>أذكاري</h1><LightChip /></div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="happy" size={84} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 10, fontSize: 17 }}>{cur ? <>دلوقتي وقت <b style={{ color: adhkarById(cur).dark }}>{adhkarById(cur).title}</b>… يلا نقولها سوا!</> : 'ذكر ربنا بيحفظنا وبيفرّح قلبنا. اختار من هنا.'}</Bubble>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {ADHKAR.map((s, k) => {
          const n = s.items.filter((d) => z.ids.includes(d.id)).length, full = z.secs.includes(s.id), on = cur === s.id;
          return (
            <motion.button key={s.id} type="button" whileTap={{ scale: 0.96 }} onClick={() => { sfx.pop(); go('adhkar', s.id); }} className="card" animate={on ? { scale: [1, 1.03, 1] } : {}} transition={on ? { repeat: Infinity, duration: 1.8 } : {}}
              style={{ position: 'relative', border: `3px solid ${on ? s.color : '#fff'}`, padding: '14px 10px 10px', cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: s.soft, boxShadow: `0 6px 0 ${s.color}55` }}>
              <span className="num" style={{ '--c': s.color, position: 'absolute', top: 8, right: 8, width: 30, height: 30, fontSize: 15 }}>{ar(k + 1)}</span>
              {on && !full && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: s.color, color: '#fff', borderRadius: 12, padding: '0 10px', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>وقتها دلوقتي</span>}
              {full && <span style={{ position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: 15, background: '#2FB383', display: 'grid', placeItems: 'center' }}><Icon d={I.check} color="#fff" size={18} w={4} /></span>}
              <DIcon id={s.ic} size={70} />
              <span style={{ fontSize: 19, fontWeight: 800 }}>{s.title}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.dark, lineHeight: 1.3, textAlign: 'center' }}>{s.sub}</span>
              <div className="progress" style={{ width: '100%', height: 10, marginTop: 4 }}><i style={{ width: `${(n / s.items.length) * 100}%`, background: s.color }} /></div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#6D7896' }}><bdi>{ar(n)}</bdi> من <bdi>{ar(s.items.length)}</bdi></span>
            </motion.button>
          );
        })}
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { sfx.pop(); go('adhkar', 'tasbih'); }} className="card" style={{ border: 0, padding: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', boxShadow: '0 6px 0 #2FB38355' }}>
          <DIcon id="tasbih" size={52} /><div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800 }}>السبحة</div><div style={{ fontSize: 12, fontWeight: 700, color: '#1F8A61' }}>سبّحت <bdi>{ar(tas)}</bdi> مرة</div></div>
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { sfx.pop(); go('adhkar', 'quiz'); }} className="card" style={{ border: 0, padding: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', boxShadow: '0 6px 0 #F5A62355' }}>
          <DIcon id="star" size={52} /><div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800 }}>اختبر نفسك</div><div style={{ fontSize: 12, fontWeight: 700, color: '#D9822A' }}>أقول إيه لما…؟</div></div>
        </motion.button>
      </div>
    </div>
  );
}

// ذكر واحد في كل صفحة، مع عدّاد كبير
function Section({ sec, back, go }) {
  const d0 = today();
  const z = doneToday(useStore((s) => s.azkar));
  const mark = useStore((s) => s.dhikr), finishSec = useStore((s) => s.finishSec), addTasbih = useStore((s) => s.addTasbih);
  const [i, setI] = useState(() => Math.max(0, sec.items.findIndex((d) => !z.ids.includes(d.id))));
  const [cnt, setCnt] = useState(0);
  const [party, setParty] = useState(null);
  const d = sec.items[i];
  const done = z.ids.includes(d.id) || cnt >= d.n;
  const speak = () => say(dhikrLine(d), d.aud || []);
  useEffect(() => { setCnt(0); speak(); }, [i]);
  const tap = () => {
    if (cnt >= d.n) return;
    const c = cnt + 1; setCnt(c); buzz(); if (d.ic === 'tasbih') addTasbih(1);
    if (c < d.n) { sfx.tap(); return; }
    sfx.good(); buzz(60); mark(d0, d.id);
    const ids = new Set([...z.ids, d.id]);
    if (sec.items.every((x) => ids.has(x.id))) { const got = finishSec(d0, sec.id); setTimeout(() => { setParty(got); say('ما شاء الله! خلّصت ' + sec.title); }, 500); }
    else setTimeout(() => { if (i < sec.items.length - 1) setI(i + 1); }, 1100);
  };
  const pct = d.n === 1 ? (done ? 1 : 0) : Math.min(1, (done && !cnt ? d.n : cnt) / d.n);
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="screen" style={{ gap: 10 }}>
      <Sky tone={sec.id === 'masa' || sec.id === 'nawm' ? 'lilac' : 'warm'} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800 }}>{sec.title}</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>{sec.items.map((x, k) => <span key={x.id} style={{ width: k === i ? 18 : 8, height: 8, borderRadius: 4, background: z.ids.includes(x.id) ? '#2FB383' : k === i ? sec.color : '#D8DEEA', transition: 'width .2s' }} />)}</div></div>
        <HomeBtn />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={d.id} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div className="card dash" style={{ '--c': sec.color + '99', padding: '12px 14px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DIcon id={d.ic} size={54} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 20, fontWeight: 800 }}>{d.title}</div><div style={{ fontSize: 13, fontWeight: 700, color: '#7A6A70' }}>{d.ref}</div></div>
              <span style={{ background: sec.color, color: '#fff', borderRadius: 14, padding: '2px 12px', fontWeight: 800, fontSize: 15 }}>{d.n === 1 ? 'مرة' : d.n === 3 ? '٣ مرات' : <bdi>{ar(d.n)} مرة</bdi>}</span>
            </div>
            <div className="ayah" style={{ fontSize: d.t.length > 160 ? 20 : d.t.length > 70 ? 24 : 30, color: d.quran ? '#B03A64' : '#1F7A55', textAlign: 'center', lineHeight: 1.9, overflowY: 'auto', maxHeight: '34vh' }}>{d.quran ? `﴿${d.t}﴾` : d.t}</div>
            {d.aud && <ReciterChip codes={d.aud} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <Siraj pose="wave" size={70} />
            <Bubble tail="r" style={{ flex: 1, fontSize: 16, marginBottom: 6, lineHeight: 1.5 }}><span style={{ color: sec.dark, fontWeight: 800 }}>يعني: </span>{d.mean}</Bubble>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
            <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={tap} aria-label={done ? 'خلّصت' : 'اضغط كل ما تقول الذكر'}
              style={{ position: 'relative', width: 128, height: 128, border: 0, borderRadius: 64, background: done ? '#2FB383' : sec.color, boxShadow: `0 8px 0 ${done ? '#1F8A61' : sec.dark}`, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'grid', placeItems: 'center' }}>
              <svg width="128" height="128" viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} aria-hidden="true">
                <circle cx="64" cy="64" r={R} fill="none" stroke="#ffffff44" strokeWidth="8" />
                <circle cx="64" cy="64" r={R} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .25s' }} />
              </svg>
              {done ? <Icon d={I.check} color="#fff" size={50} w={4} /> : <div><div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}><bdi>{ar(cnt)}</bdi></div><div style={{ fontSize: 13, fontWeight: 800 }}>{d.n === 1 ? 'قلتها' : 'اضغط وعِدّ'}</div></div>}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'relative', display: 'flex', gap: 10, alignItems: 'center' }}>
        <IconBtn icon={I.sound} label="اسمع تاني" sound="tap" color={sec.dark} onClick={speak} style={{ width: 56, height: 56, borderRadius: 28 }} />
        {i > 0 && <IconBtn icon={I.back} label="اللي قبله" onClick={() => setI(i - 1)} style={{ width: 56, height: 56, borderRadius: 28, transform: 'scaleX(-1)' }} />}
        <Btn className="block" sound="whoosh" onClick={() => (i < sec.items.length - 1 ? setI(i + 1) : back())} style={{ flex: 1, '--c': sec.color, '--d': sec.dark, '--t': '#fff', minHeight: 58 }}>{i < sec.items.length - 1 ? 'الذكر اللي بعده' : 'رجوع لأذكاري'}</Btn>
      </div>
      {party !== null && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: '#26336Bcc', display: 'grid', placeItems: 'center', padding: 20 }} onClick={() => setParty(null)}>
          <Confetti />
          <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="card" style={{ padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Siraj pose="party" size={120} />
            <div style={{ fontSize: 24, fontWeight: 800 }}>ما شاء الله! خلّصت {sec.title}</div>
            {party && <div style={{ fontSize: 17, fontWeight: 800, color: '#D9822A' }}>+<bdi>{ar(3)}</bdi> نور في الجرة</div>}
            <Btn className="block" onClick={() => go('adhkar')} style={{ '--c': sec.color, '--d': sec.dark, '--t': '#fff' }}>رجوع لأذكاري</Btn>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// السبحة: اختار الذكر واضغط على الحبّاية
function Tasbih({ back }) {
  const [k, setK] = useState(0);
  const [n, setN] = useState(0);
  const total = useStore((s) => s.tasbih || 0), addTasbih = useStore((s) => s.addTasbih);
  const t = TASBIH[k];
  const round = n % 33, laps = Math.floor(n / 33);
  const tap = () => { const m = n + 1; setN(m); addTasbih(1); buzz(); if (m % 33 === 0) { sfx.good(); buzz(80); } else sfx.tap(); };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 800 }}>السبحة</h1>
        <HomeBtn />
      </div>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {TASBIH.map((x, j) => (
          <button key={j} type="button" onClick={() => { sfx.tap(); setK(j); setN(0); }} className="ayah"
            style={{ border: 0, borderRadius: 16, padding: '2px 12px', fontSize: 18, cursor: 'pointer', color: j === k ? '#fff' : x.c, background: j === k ? x.c : '#fff', boxShadow: `0 3px 0 ${x.c}55` }}>{x.t}</button>
        ))}
      </div>
      <div className="ayah" style={{ position: 'relative', textAlign: 'center', fontSize: 36, color: t.c }}>{t.t}</div>
      <div style={{ position: 'relative', flex: 1, display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 240 240" width="270" style={{ maxWidth: '86%' }} aria-hidden="true">
          {Array.from({ length: 33 }).map((_, j) => { const a = -Math.PI / 2 + (j / 33) * Math.PI * 2; const on = j < round || (round === 0 && n > 0 && laps > 0 && false);
            return <circle key={j} cx={120 + Math.cos(a) * 100} cy={120 + Math.sin(a) * 100} r={j === round ? 9 : 7.5} fill={on ? t.c : '#fff'} stroke={on ? '#26336B' : '#C9D1DE'} strokeWidth="2" style={{ transition: 'fill .15s' }} />; })}
        </svg>
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={tap} aria-label={'سبّح: ' + t.t}
          style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, border: 0, background: `radial-gradient(circle at 35% 30%, #fff8, transparent 40%), ${t.c}`, boxShadow: `0 8px 0 #0003`, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1 }}><bdi>{ar(round)}</bdi></div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>من <bdi>{ar(33)}</bdi></div>
        </motion.button>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 8, justifyContent: 'center' }}>
        <span className="chip">الجولات: <bdi>{ar(laps)}</bdi></span>
        <span className="chip">المرة دي: <bdi>{ar(n)}</bdi></span>
        <span className="chip">كل تسبيحي: <bdi>{ar(total)}</bdi></span>
      </div>
      <Btn tone="white" onClick={() => setN(0)} style={{ position: 'relative' }}>ابدأ من الأول</Btn>
    </div>
  );
}

// اختبر نفسك: موقف ← الذكر الصح
const short = (t) => { const w = t.split(' '); return w.length > 6 ? w.slice(0, 6).join(' ') + '…' : t; };
function Quiz({ back, go }) {
  const pool = adhkarById('hisn').items;
  const qs = useMemo(() => {
    const p = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    return p.map((d) => {
      const wrong = pool.filter((x) => x.id !== d.id && short(x.t) !== short(d.t)).sort(() => Math.random() - 0.5).slice(0, 2);
      return { k: 'pick', q: d.title + '… أقول إيه؟', opts: [short(d.t), ...wrong.map((x) => short(x.t))], c: 0, after: d.mean };
    });
  }, []);
  const [i, setI] = useState(0), [ok, setOk] = useState(false), [end, setEnd] = useState(false);
  const win = useStore((s) => s.win);
  const sec = adhkarById('hisn');
  useEffect(() => { setOk(false); if (!end) say(qs[i].q); }, [i, end]);
  if (end) return (
    <div className="screen" style={{ gap: 14, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <Sky tone="warm" /><Confetti />
      <Siraj pose="party" size={150} />
      <div style={{ position: 'relative', fontSize: 26, fontWeight: 800 }}>برافو! انت حافظ أذكارك</div>
      <Btn className="block" onClick={() => go('adhkar')} style={{ position: 'relative', '--c': sec.color, '--d': sec.dark, '--t': '#fff' }}>رجوع لأذكاري</Btn>
    </div>
  );
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <div className="progress" style={{ flex: 1, height: 14 }}><i style={{ width: `${((i + (ok ? 1 : 0)) / qs.length) * 100}%`, background: sec.color }} /></div>
        <HomeBtn />
      </div>
      <motion.div key={i} data-step initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><DIcon id={pool.find((d) => d.title + '… أقول إيه؟' === qs[i].q)?.ic} size={86} /></div>
        <Practice s={qs[i]} u={sec} g="boy" onSolve={() => setOk(true)} />
      </motion.div>
      <Btn className="block" disabled={!ok} onClick={() => { if (!ok) return; if (i < qs.length - 1) setI(i + 1); else { win('adhkar_quiz', 3); setEnd(true); say('برافو! انت حافظ أذكارك'); } }}
        style={{ position: 'relative', '--c': ok ? sec.color : '#C9D1DE', '--d': ok ? sec.dark : '#AAB4C4', '--t': '#fff', minHeight: 58 }}>{ok ? (i < qs.length - 1 ? 'السؤال اللي بعده' : 'خلّصت!') : 'اختار الإجابة'}</Btn>
    </div>
  );
}
