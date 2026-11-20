// وضع التحفيظ (سمّعني): المايك بيسمع الطفل وهو بيعيد والكلمات بتنوّر أول ما يقولها، و«سمّعني» بيخبّي الآيات ويظهر كل كلمة يقولها صح
// وضع التحفيظ: يختار الطفل سورة من جزء عمّ (والفاتحة)، الشيخ يقرا كل آية والطفل يعيد وراه بعدد مرات يختاره،
// وبعدين «اختبر نفسك»: الآيات تستخبى والطفل يسمّع، و«حفظتها» بتتسجل لولي الأمر
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import Q30 from '../data/quran30.json';
import { reciterById, ayahUrl } from '../data/reciters';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';
import { HomeBtn } from '../components/ui';
import { micReady, hear, micLog, resetMicMode } from '../lib/listen';
import { ayahWords, align, score } from '../lib/match';

const BASE = import.meta.env.BASE_URL;
const SURAS = Object.keys(Q30).map(Number).sort((a, b) => (a === 1 ? -1 : b === 1 ? 1 : b - a)); // الفاتحة ثم الناس ← النبأ
export const HIFZ_INTRO = 'يلا نحفظ! اختار سورة، والشيخ هيقرا كل آية وانت تعيد وراه.';
export const HIFZ_TURN = 'دورك! قول الآية ورا الشيخ.';
export const HIFZ_DONE = 'ما شاء الله! حفظت السورة.';
const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function playOnce(url, run, my) {
  return new Promise((res) => {
    const a = new Audio(url); run.cur = a;
    a.onended = () => res(a.duration || 4); a.onerror = () => res(0);
    if (run.n !== my) return res(0);
    a.play().catch(() => res(0));
  });
}

function Surah({ s, back }) {
  const st = useStore((x) => x.settings), done = useStore((x) => x.hifz) || [], mark = useStore((x) => x.hifzToggle);
  const ayat = Q30[s].ayat;
  const words = useMemo(() => ayat.map(ayahWords), [s]);
  const [reps, setReps] = useState(3), [on, setOn] = useState(-1), [turn, setTurn] = useState(false), [hide, setHide] = useState(false), [party, setParty] = useState(false);
  // سمّعني: المايك بيسمع الطفل وهو بيعيد، والكلمات بتنوّر أول ما يقولها
  const [mic, setMic] = useState('unk'); // unk | ok | denied | none | fail
  // الشيخ عمره ما يستنى المايك: لو إذن المايك ماجاش في ثانية ونص، نكمّل من غير سماع
  const micNow = async () => { if (mic !== 'unk') return mic; const m = await Promise.race([micReady(), wait(1500).then(() => 'unk')]); if (m !== 'unk') setMic(m); return m; };
  const [heard, setHeard] = useState(''), [hits, setHits] = useState({}), [note, setNote] = useState(null), [seen, setSeen] = useState({}), [mode, setMode] = useState(null), [res, setRes] = useState(null);
  const run = useRef({ n: 0, cur: null, ear: null });
  const stop = () => { run.current.n++; try { run.current.cur?.pause(); } catch (e) {} run.current.ear?.stop(); setOn(-1); setTurn(false); setMode(null); setHeard(''); setNote(null); };
  useEffect(() => { micReady().then(setMic); return () => { stop(); hush(); }; }, []);
  // اختبار المايك: يسمع ٨ ثواني ويعرض اللي سمعه وإيه اللي حصل خطوة بخطوة (عشان نعرف المشكلة على أي موبايل)
  const [mt, setMt] = useState(null);
  const micTest = async () => {
    stop(); hush(); setMt({ on: true, t: '', log: [] });
    const m = await Promise.race([micReady(), wait(60000).then(() => 'لسه مستني الإذن')]);
    setMic(m === 'ok' || m === 'denied' || m === 'none' ? m : mic);
    if (m !== 'ok') { setMt({ on: false, t: '', log: [...micLog, 'النتيجة: ' + m] }); return; }
    const ear = hear({ waitMs: 8000, maxMs: 14000, onText: (t) => setMt((x) => ({ ...x, t })) });
    run.current.ear = ear; const t = await ear.promise; run.current.ear = null;
    setMt({ on: false, t, log: [...micLog] });
  };
  const r = reciterById(st.reciter);
  const code = (k) => String(s).padStart(3, '0') + String(k + 1).padStart(3, '0');
  const alive = (my) => run.current.n === my;
  // يسمع الطفل وهو بيقرا آية k، ولو سكت في النص يدّيله فرصة تانية يكمّل. بيرجع نسبة الكلمات اللي قالها صح
  const listen = async (k, my, est) => {
    let all = ''; let best = words[k].map(() => false);
    setHeard(''); setHits((h) => ({ ...h, [k]: best }));
    for (let round = 0; round < 3 && alive(my); round++) {
      const ear = hear({ maxMs: Math.max(6000, est * 2.2 + 3000), waitMs: round ? 4000 : 8000, onFail: () => { run.current.micFail = true; setMic('fail'); },
        onText: (t) => { const txt = (all + ' ' + t).trim(); setHeard(txt); const h = align(words[k], txt); setHits((x) => ({ ...x, [k]: h })); if (score(h) >= 0.85) ear.stop(); } });
      run.current.ear = ear;
      const t = await ear.promise; run.current.ear = null;
      if (!t) break;
      all = (all + ' ' + t).trim(); best = align(words[k], all);
      if (score(best) >= 0.85) break;
    }
    setHits((x) => ({ ...x, [k]: best }));
    return { sc: score(best), said: !!all };
  };
  // الشيخ يقرا والطفل يعيد وراه
  const start = async (from = 0) => {
    stop(); hush(); const my = ++run.current.n; setMode('rep'); setRes(null);
    const m = await micNow(); if (!alive(my)) return;
    for (let k = from; k < ayat.length; k++) {
      for (let t = 0; t < reps; t++) {
        if (!alive(my)) return;
        setOn(k); setTurn(false); setNote(null); setHeard(''); setHits((h) => ({ ...h, [k]: null }));
        const d = await playOnce(ayahUrl(r, code(k), BASE), run.current, my);
        if (!alive(my)) return;
        setTurn(true);
        if (m === 'ok' && !run.current.micFail) {
          const { sc, said } = await listen(k, my, d * 1000);
          if (!alive(my)) return;
          setTurn(false);
          if (sc >= 0.6) { sfx.good(); setNote({ ok: true, t: sc >= 0.9 ? 'ما شاء الله! 🌟' : 'برافو! 👏' }); }
          else { sfx.soft(); setNote({ ok: false, t: said ? 'قربت! اسمع الشيخ تاني 👂' : 'مسمعتكش… قول ورا الشيخ بصوت عالي 🎤' }); }
          await wait(1100);
        } else await wait(Math.max(2500, d * 1100)); // من غير مايك: وقت للطفل يعيد
      }
    }
    if (alive(my)) { setOn(-1); setTurn(false); setNote(null); setMode(null); }
  };
  // سمّعني من حفظك: الآيات مستخبية، والطفل يقرا لوحده، وكل كلمة يقولها صح بتظهر. لو غلط الشيخ يصحّحله
  const test = async () => {
    stop(); hush(); const my = ++run.current.n; setMode('test'); setHide(true); setSeen({}); setHits({}); setRes(null);
    await say('اختبر نفسك! قول الآيات من حفظك.');
    let good = 0;
    for (let k = 0; k < ayat.length; k++) {
      if (!alive(my)) return;
      setOn(k); setTurn(true); setNote(null);
      const { sc } = await listen(k, my, words[k].length * 900);
      if (!alive(my)) return;
      setTurn(false); setSeen((x) => ({ ...x, [k]: true }));
      if (sc >= 0.6) { good++; sfx.good(); setNote({ ok: true, t: 'صح! 👏' }); await wait(700); }
      else { sfx.soft(); setNote({ ok: false, t: 'اسمع الشيخ وكمّل 👂' }); await playOnce(ayahUrl(r, code(k), BASE), run.current, my); }
    }
    if (!alive(my)) return;
    setOn(-1); setMode(null); setNote(null); setRes({ good, all: ayat.length });
    if (good === ayat.length) { if (!done.includes(s)) mark(s); setParty(true); sfx.star(); say(HIFZ_DONE); }
  };
  const ok = done.includes(s);
  const word = (k, w, j) => {
    const h = hits[k]?.[j], show = !hide || seen[k] || h;
    return <span key={j} style={{ color: h ? '#1F8A61' : '#26336B', background: h ? '#D4F5E4' : 'transparent', borderRadius: 8, filter: show ? 'none' : 'blur(7px)', transition: 'all .25s' }}>{w} </span>;
  };
  const btn = (bg, fg, extra) => ({ borderRadius: 16, padding: 12, border: 0, background: bg, color: fg, fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer', ...extra });
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      {party && <Confetti />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F8A61' }}>سورة {Q30[s].name}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(ayat.length)} آيات • بصوت {r.name}</div></div>
        <HomeBtn />
      </div>
      <div className="card" style={{ position: 'relative', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontWeight: 800 }}>
          <span>كرّر كل آية:</span>
          {[1, 3, 5].map((n) => <button key={n} type="button" onClick={() => setReps(n)} style={{ borderRadius: 12, padding: '6px 14px', border: 0, background: reps === n ? '#2FB383' : '#E3F7EE', color: reps === n ? '#fff' : '#1F8A61', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>{n === 1 ? 'مرة' : `${ar(n)} مرات`}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {mode ? <button type="button" onClick={stop} style={btn('#E5484D', '#fff', { flex: 1 })}>■ وقّف</button>
            : <>
              <button type="button" onClick={() => { setHide(false); start(0); }} style={btn('#2FB383', '#fff', { flex: 3 })}>▶ ردّد ورا الشيخ</button>
              <button type="button" onClick={mic === 'ok' ? test : () => { setHide(!hide); if (!hide) say('اختبر نفسك! قول الآيات من حفظك.'); }} style={btn('#fff', '#1F8A61', { flex: 2, border: '3px solid #2FB383', fontSize: 14, padding: 10 })}>{mic === 'ok' ? '🎤 سمّعني' : hide ? '👁 اظهر الآيات' : '🙈 اختبر نفسك'}</button>
            </>}
        </div>
        {(mic === 'none' || mic === 'fail') && <div style={{ fontSize: 12, fontWeight: 700, color: '#B07A12' }}>🎤 خدمة التعرّف على الكلام مش شغالة على الموبايل ده، فالشيخ مش هيقدر يسمعك. تأكد إن تطبيق Google متثبّت ومحدّث، وإن النت شغال، وبعدين افتح السورة تاني.</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button type="button" onClick={micTest} disabled={mt?.on} style={{ border: 0, background: 'transparent', color: '#6D7896', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>{mt?.on ? '🎤 قول أي كلام… أنا سامعك' : '🎤 اختبار المايك'}</button>
          {mt && !mt.on && <button type="button" onClick={() => { resetMicMode(); setMt(null); }} style={{ border: 0, background: 'transparent', color: '#A3AAC0', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>↺ ابدأ من الأول</button>}
        </div>
        {mt && (mt.t || !mt.on) && <div style={{ background: mt.t ? '#E3F7EE' : '#FFF3D6', borderRadius: 12, padding: 8, fontSize: 12, fontWeight: 700, color: '#26336B', lineHeight: 1.7 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: mt.t ? '#1F8A61' : '#B4531A' }}>{mt.t ? `✓ سمعتك: «${mt.t}»` : mt.on ? '' : '✗ ماسمعتش حاجة'}</div>
          {!mt.on && <div dir="rtl" style={{ color: '#6D7896' }}>{mt.log.map((l, k) => <div key={k}>{l}</div>)}</div>}
        </div>}
        {mic === 'denied' && <div style={{ fontSize: 12, fontWeight: 700, color: '#B07A12' }}>🎤 عشان الشيخ يسمعك وانت بتقرا، اسمح للتطبيق يستخدم المايك من إعدادات الموبايل.</div>}
      </div>
      {(turn || note) && <motion.div key={(turn ? 't' : 'n') + on} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card"
        style={{ position: 'relative', padding: 10, textAlign: 'center', background: note ? (note.ok ? '#D4F5E4' : '#FFE9D6') : '#FFF3D6', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: note ? (note.ok ? '#1F8A61' : '#B4531A') : '#B07A12' }}>
          {note ? note.t : mic === 'ok' ? <><motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block' }}>🎤</motion.span> {mode === 'test' ? 'اقرا الآية من حفظك… أنا سامعك' : 'دورك! اقرا الآية… أنا سامعك'}</> : '🎤 دورك! قول الآية ورا الشيخ'}
        </div>
        {heard && <div dir="rtl" style={{ fontSize: 16, fontWeight: 700, color: '#26336B', background: '#fff', borderRadius: 12, padding: '6px 10px' }}>«{heard}»</div>}
      </motion.div>}
      {res && <div className="card" style={{ position: 'relative', padding: 10, textAlign: 'center', fontSize: 17, fontWeight: 800, color: res.good === res.all ? '#1F8A61' : '#B4531A', background: res.good === res.all ? '#D4F5E4' : '#FFF3D6' }}>
        {res.good === res.all ? `ما شاء الله! سمّعت السورة كلها صح 🌟` : `قريت ${ar(res.good)} من ${ar(res.all)} آيات صح… كمّل وانت هتحفظها 💪`}</div>}
      <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, background: '#FFFDF5' }}>
        {ayat.map((t, k) => (
          <motion.button key={k} type="button" onClick={() => { setHide(false); start(k); }} animate={{ background: on === k ? '#E3F7EE' : 'rgba(0,0,0,0)' }}
            style={{ border: 0, borderRadius: 12, padding: '4px 8px', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit' }}>
            <span className="hafs" dir="rtl" style={{ fontSize: 24 }}>{words[k].map((w, j) => word(k, w, j))}<span style={{ color: '#2FB383', fontSize: 18 }}>﴿{ar(k + 1)}﴾</span></span>
          </motion.button>
        ))}
      </div>
      <button type="button" onClick={() => { mark(s); if (!ok) { setParty(true); sfx.star(); say(HIFZ_DONE); } }} style={{ position: 'relative', borderRadius: 18, padding: 14, border: ok ? 0 : '3px solid #2FB383', background: ok ? '#2FB383' : '#fff', color: ok ? '#fff' : '#1F8A61', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>{ok ? '✓ حفظتها' : '⭐ حفظت السورة'}</button>
    </div>
  );
}

export default function Hifz({ arg, back, go, swap }) {
  const done = useStore((x) => x.hifz) || [];
  useEffect(() => { if (!arg) hubSay(HIFZ_INTRO); return () => hush(); }, [arg]);
  if (arg && Q30[arg]) return <Surah key={arg} s={+arg} back={back} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#1F8A61' }}>حفّظني</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>الشيخ يقرا وانت تعيد وراه</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#1F8A61' }}>{ar(done.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من {ar(SURAS.length)}</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(done.length / SURAS.length) * 100}%`, background: 'linear-gradient(90deg,#2FB383,#1F8A61)' }} /></div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {SURAS.map((s) => { const ok = done.includes(s);
          return (
            <motion.button key={s} type="button" whileTap={{ scale: 0.93 }} onClick={() => { sfx.pop(); go('hifz', String(s)); }} className="card"
              style={{ border: ok ? '3px solid #2FB383' : '3px solid transparent', background: ok ? '#E3F7EE' : '#fff', padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: 74 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#6D7896' }}>{ok ? '✓ ' : ''}{ar(s)}</span>
              <span className="hafs" style={{ fontSize: 20, color: '#1F8A61', lineHeight: 1.8 }}>{Q30[s].name}</span>
            </motion.button>
          ); })}
      </div>
    </div>
  );
}
