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
import Certificate from '../components/Certificate';
import { micReady, hear, micLog, resetMicMode, warmMic } from '../lib/listen';
import { ayahWords, align, score } from '../lib/match';

const BASE = import.meta.env.BASE_URL;
const SURAS = Object.keys(Q30).map(Number).sort((a, b) => (a === 1 ? -1 : b === 1 ? 1 : b - a)); // الفاتحة ثم الناس ← النبأ
export const HIFZ_INTRO = 'يلا نحفظ! اختار سورة، والشيخ هيقرا كل آية وانت تعيد وراه.';
export const HIFZ_TURN = 'دورك! قول الآية ورا الشيخ.';
export const HIFZ_DONE = 'ما شاء الله! حفظت السورة.';
const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
// الآية بتتحسب صح لو الطفل قال ٨٠٪ من كلماتها على الأقل (التعرّف على صوت الأطفال مش مظبوط ١٠٠٪)
const PASS = 0.8;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// onNear: بتتنادي قبل ما الشيخ يخلّص الآية بحوالي ٠٫٨ ثانية، عشان المايك يبدأ يفتح بدري ويلحق أول كلمة من الطفل
function playOnce(url, run, my, onNear) {
  return new Promise((res) => {
    const a = new Audio(url); run.cur = a; let near = false;
    const fire = () => { if (!near) { near = true; onNear?.(); } };
    if (onNear) a.ontimeupdate = () => { if (a.duration && a.duration - a.currentTime < 0.8) fire(); };
    a.onended = () => { fire(); res(a.duration || 4); }; a.onerror = () => { fire(); res(0); };
    if (run.n !== my) return res(0);
    a.play().catch(() => res(0));
  });
}

function Surah({ s, back }) {
  const st = useStore((x) => x.settings), done = useStore((x) => x.hifz) || [], mark = useStore((x) => x.hifzToggle);
  const profile = useStore((x) => x.profile), weak = useStore((x) => x.hifzWeak?.[s]) || [], markAyah = useStore((x) => x.markAyah), certs = useStore((x) => x.hifzCerts) || {}, certify = useStore((x) => x.certify);
  const [cert, setCert] = useState(null);
  const ayat = Q30[s].ayat;
  const words = useMemo(() => ayat.map(ayahWords), [s]);
  const [reps, setReps] = useState(1), [on, setOn] = useState(-1), [turn, setTurn] = useState(false), [hide, setHide] = useState(false), [party, setParty] = useState(false);
  // سمّعني: المايك بيسمع الطفل وهو بيعيد، والكلمات بتنوّر أول ما يقولها
  const [mic, setMic] = useState('unk'); // unk | ok | denied | none | fail
  // الشيخ عمره ما يستنى المايك: لو إذن المايك ماجاش في ثانية ونص، نكمّل من غير سماع
  const micNow = async () => { if (mic !== 'unk') return mic; const m = await Promise.race([micReady(), wait(1500).then(() => 'unk')]); if (m !== 'unk') setMic(m); return m; };
  const [heard, setHeard] = useState(''), [hits, setHits] = useState({}), [note, setNote] = useState(null), [seen, setSeen] = useState({}), [mode, setMode] = useState(null), [res, setRes] = useState(null);
  const run = useRef({ n: 0, cur: null, ear: null });
  const stop = () => { run.current.n++; try { run.current.cur?.pause(); } catch (e) {} run.current.ear?.stop(); setOn(-1); setTurn(false); setMode(null); setHeard(''); setNote(null); };
  useEffect(() => { micReady().then((m) => { setMic(m); if (m === 'ok') warmMic(); }); return () => { stop(); hush(); }; }, []);
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
  const mkEar = (k, ctx, round, est, muted) => {
    const ear = hear({ muted, maxMs: Math.max(6000, est * 2.2 + 3000), waitMs: round ? 4000 : 8000, onFail: () => { run.current.micFail = true; setMic('fail'); },
      onText: (t) => { const txt = (ctx.all + ' ' + t).trim(); setHeard(txt); const h = align(words[k], txt); setHits((x) => ({ ...x, [k]: h })); if (score(h) >= 0.85) ear.stop(); } });
    return ear;
  };
  // يفتح المايك بدري وهو «مكتوم» والشيخ لسه بيخلّص الآية
  const prepare = (k, est) => { const ctx = { all: '' }; return { ctx, ear: mkEar(k, ctx, 0, est, true) }; };
  const listen = async (k, my, est, early) => {
    const ctx = early?.ctx || { all: '' }; let best = words[k].map(() => false);
    setHeard(''); setHits((h) => ({ ...h, [k]: best }));
    for (let round = 0; round < 3 && alive(my); round++) {
      const ear = round === 0 && early ? early.ear : mkEar(k, ctx, round, est, false);
      if (round === 0 && early) ear.unmute();
      run.current.ear = ear;
      const t = await ear.promise; run.current.ear = null;
      if (!t) break;
      ctx.all = (ctx.all + ' ' + t).trim(); best = align(words[k], ctx.all);
      if (score(best) >= 0.85) break;
    }
    setHits((x) => ({ ...x, [k]: best }));
    return { sc: score(best), said: !!ctx.all, best };
  };
  // الكلمات اللي الطفل نسيها أو قالها غلط (أول ٣)
  const missing = (k, best) => words[k].filter((w, j) => !best[j] && /[\u0621-\u064A]/.test(w)).slice(0, 3).join(' ');
  // الشيخ يقرا والطفل يعيد وراه
  const start = async (from = 0) => {
    stop(); hush(); const my = ++run.current.n; setMode('rep'); setRes(null);
    const m = await micNow(); if (!alive(my)) return;
    for (let k = from; k < ayat.length; k++) {
      for (let t = 0; t < reps; t++) {
        // لو الطفل قالها غلط أو ناقصة، الشيخ يعيدها ويسمعه تاني (لحد ٣ محاولات عشان مايزهقش)
        for (let tries = 1; ; tries++) {
          if (!alive(my)) return;
          setOn(k); setTurn(false); setHeard(''); setHits((h) => ({ ...h, [k]: null }));
          const useMic = m === 'ok' && !run.current.micFail;
          let early = null;
          // المايك بيفتح أول ما الشيخ يخلّص (مش قبلها، عشان مايسمعش صوت الشيخ ويقفل لوحده)
          const d = await playOnce(ayahUrl(r, code(k), BASE), run.current, my);
          if (!alive(my)) { early?.ear.stop(); return; }
          setNote(null); setTurn(true);
          if (!useMic) { early?.ear.stop(); await wait(Math.max(2500, d * 1100)); break; } // من غير مايك: وقت للطفل يعيد
          const { sc, said, best } = await listen(k, my, d * 1000, early);
          if (!alive(my)) return;
          setTurn(false);
          if (sc >= PASS) { markAyah(s, k, false); sfx.good(); setNote({ ok: true, t: sc >= 0.95 ? 'ما شاء الله! 🌟' : 'برافو! 👏' }); await wait(1000); break; }
          sfx.soft();
          if (tries >= 3) { markAyah(s, k, true); setNote({ ok: false, t: 'مش مشكلة، هنرجعلها تاني 💪' }); await wait(1500); break; }
          const miss = said && missing(k, best);
          setNote({ ok: false, t: !said ? 'مسمعتكش… الشيخ هيقولها تاني وقول وراه بصوت عالي 🎤' : miss ? `قربت! ركّز في: «${miss}» 👂` : 'قربت! اسمع الشيخ تاني 👂' });
          await wait(1600);
        }
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
      // محاولتين: لو غلط في الأولى يعيدها من الأول، ولو غلط تاني الشيخ يصحّحله والآية تتسجل للمراجعة
      let sc = 0, best = null;
      for (let tries = 1; tries <= 2; tries++) {
        setTurn(true);
        ({ sc, best } = await listen(k, my, words[k].length * 900));
        if (!alive(my)) return;
        if (sc >= PASS || tries === 2) break;
        setTurn(false); sfx.soft(); const miss = missing(k, best);
        setNote({ ok: false, t: miss ? `راجع: «${miss}»… اقرا الآية تاني من الأول 🎤` : 'حاول تاني… اقرا الآية من الأول 🎤' }); await wait(1500); setNote(null);
      }
      setTurn(false); setSeen((x) => ({ ...x, [k]: true }));
      if (sc >= PASS) { good++; markAyah(s, k, false); sfx.good(); setNote({ ok: true, t: 'صح! 👏' }); await wait(700); }
      else { markAyah(s, k, true); sfx.soft(); setNote({ ok: false, t: 'اسمع الشيخ وهو بيقولها صح 👂' }); await playOnce(ayahUrl(r, code(k), BASE), run.current, my); }
    }
    if (!alive(my)) return;
    setOn(-1); setMode(null); setNote(null); setRes({ good, all: ayat.length });
    if (good === ayat.length) {
      if (!done.includes(s)) mark(s); setParty(true); sfx.star(); say(HIFZ_DONE);
      certify(s, { at: certs[s]?.at || Date.now(), last: Date.now() });
      setTimeout(() => setCert(true), 1800);
    }
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
      {cert && <Certificate c={{ title: 'شهادة حفظ', name: profile?.name || 'بطل', gender: profile?.gender, verb: profile?.gender === 'girl' ? 'أتمّت حفظ وتسميع' : 'أتمّ حفظ وتسميع', main: 'سورة ' + Q30[s].name, sub: `${ar(ayat.length)} ${ayat.length > 10 ? 'آية' : 'آيات'} من القرآن الكريم`, stars: 5 }} onClose={() => setCert(null)} />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F8A61' }}>سورة {Q30[s].name}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(ayat.length)} آيات • بصوت {r.name}</div></div>
        <HomeBtn />
      </div>
      <div className="card" style={{ position: 'relative', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontWeight: 800 }}>
          <span>كام مرة أكرّر كل آية؟</span>
          {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setReps(n)} style={{ borderRadius: 12, width: 38, height: 36, padding: 0, fontSize: 17, border: 0, background: reps === n ? '#2FB383' : '#E3F7EE', color: reps === n ? '#fff' : '#1F8A61', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>{ar(n)}</button>)}
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
      {weak.length > 0 && !mode && <div className="card" style={{ position: 'relative', padding: '8px 12px', fontSize: 14, fontWeight: 800, color: '#B4531A', background: '#FFF3D6' }}>📌 آيات محتاجة مراجعة: {weak.slice().sort((a, b) => a - b).map((k) => ar(k + 1)).join('، ')}</div>}
      {certs[s] && !mode && !cert && <button type="button" onClick={() => setCert(true)} style={{ position: 'relative', border: '3px solid #E8C77A', borderRadius: 18, padding: 10, background: 'linear-gradient(135deg,#FFF8E1,#FFE9B0)', color: '#8C5A1F', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>📜 شهادة حفظ سورة {Q30[s].name}</button>}
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


// ===== الاختبار الشامل: للسور اللي الطفل حفظها =====
// الشيخ يقرا آية، والطفل يكمّل الآية اللي بعدها من حفظه. لو صح: «بارك الله فيك»، ولو غلط مرتين الشيخ يصحّحله.
// في الآخر تقرير بمستوى كل سورة والآيات اللي محتاجة مراجعة، وشهادة لو النتيجة كويسة.
export const REVIEW_LINES = ['الاختبار الشامل! الشيخ هيقرا آية، وانت كمّل الآية اللي بعدها.', 'بارك الله فيك!', 'كمّل الآية اللي بعدها.', 'خلّصت الاختبار! تعالى نشوف النتيجة.'];
const levelOf = (p) => (p >= 90 ? ['ممتاز', '#1F8A61'] : p >= 75 ? ['جيد جدًا', '#2C6BC4'] : p >= 60 ? ['جيد', '#B07A12'] : ['محتاج مراجعة', '#E5484D']);
function buildReview(surahs, weakAll, n = 10) {
  const items = [];
  const pool = surahs.filter((s) => Q30[s].ayat.length > 1);
  if (!pool.length) return items;
  // الآيات الضعيفة الأول، وبعدين توزيع عادل على السور
  for (const s of pool) for (const k of weakAll[s] || []) if (k >= 1 && items.length < n / 2) items.push({ s, k });
  let r = 0;
  while (items.length < Math.min(n, pool.reduce((a, s) => a + Q30[s].ayat.length - 1, 0))) {
    const s = pool[r++ % pool.length], k = 1 + Math.floor(Math.random() * (Q30[s].ayat.length - 1));
    if (!items.some((x) => x.s === s && x.k === k)) items.push({ s, k });
    if (r > 400) break;
  }
  return items.sort(() => Math.random() - 0.5);
}
function Review({ back }) {
  const st = useStore((x) => x.settings), done = useStore((x) => x.hifz) || [], weakAll = useStore((x) => x.hifzWeak) || {}, markAyah = useStore((x) => x.markAyah), addHifzTest = useStore((x) => x.addHifzTest), profile = useStore((x) => x.profile);
  const r = reciterById(st.reciter);
  const [items] = useState(() => buildReview(done, weakAll));
  const [i, setI] = useState(-1), [hits, setHits] = useState(null), [heard, setHeard] = useState(''), [note, setNote] = useState(null), [turn, setTurn] = useState(false), [res, setRes] = useState([]), [cert, setCert] = useState(false), [fin, setFin] = useState(false);
  const run = useRef({ n: 0, cur: null, ear: null });
  const alive = (my) => run.current.n === my;
  const code = (s, k) => String(s).padStart(3, '0') + String(k + 1).padStart(3, '0');
  useEffect(() => () => { run.current.n++; try { run.current.cur?.pause(); } catch (e) {} run.current.ear?.stop(); hush(); }, []);
  const go = async () => {
    const my = ++run.current.n; const out = [];
    await say(REVIEW_LINES[0]);
    const m = await Promise.race([micReady(), wait(3000).then(() => 'unk')]);
    if (m === 'ok') warmMic();
    for (let q = 0; q < items.length; q++) {
      if (!alive(my)) return;
      const { s, k } = items[q], words = ayahWords(Q30[s].ayat[k]);
      setI(q); setHits(words.map(() => false)); setHeard(''); setNote(null); setTurn(false);
      let early = null;
      await playOnce(ayahUrl(r, code(s, k - 1), BASE), run.current, my);
      if (!alive(my)) { early?.ear.stop(); return; }
      let sc = 0;
      for (let tries = 1; tries <= 2; tries++) {
        setTurn(true);
        if (m !== 'ok') { await wait(6000); break; }
        const ctx = tries === 1 && early ? early.ctx : { all: '' };
        const ear = tries === 1 && early ? early.ear : mk(words, ctx, false); if (tries === 1 && early) ear.unmute();
        run.current.ear = ear; const t = await ear.promise; run.current.ear = null;
        if (!alive(my)) return;
        ctx.all = (ctx.all + ' ' + (t || '')).trim(); const h = align(words, ctx.all); setHits(h); sc = score(h);
        if (sc >= PASS) break;
        if (tries === 1) { setTurn(false); sfx.soft(); setNote({ ok: false, t: t ? 'قربت! حاول تاني من أول الآية 🎤' : 'مسمعتكش… كمّل الآية بصوت عالي 🎤' }); await wait(1300); setNote(null); setHits(words.map(() => false)); setHeard(''); }
      }
      setTurn(false);
      const ok = m === 'ok' ? sc >= PASS : null;
      if (ok) { markAyah(s, k, false); sfx.good(); setHits(words.map(() => true)); setNote({ ok: true, t: 'بارك الله فيك! 🌟' }); await say(REVIEW_LINES[1]); }
      else if (ok === false) { markAyah(s, k, true); sfx.soft(); setNote({ ok: false, t: 'اسمع الشيخ وهو بيقولها صح 👂' }); setHits(words.map(() => true)); await playOnce(ayahUrl(r, code(s, k), BASE), run.current, my); }
      out.push({ s, k, ok: !!ok }); setRes([...out]);
      await wait(700);
    }
    if (!alive(my)) return;
    const per = {}; out.forEach((x) => { per[x.s] = per[x.s] || [0, 0]; per[x.s][1]++; if (x.ok) per[x.s][0]++; });
    const pct = Math.round((out.filter((x) => x.ok).length / Math.max(1, out.length)) * 100);
    addHifzTest({ at: Date.now(), pct, per: Object.fromEntries(Object.entries(per).map(([s, [a, b]]) => [s, Math.round((a / b) * 100)])), weak: out.filter((x) => !x.ok).map((x) => [x.s, x.k]) });
    setFin(true); setI(-1); say(REVIEW_LINES[3]);
  };
  function mk(words, ctx, muted) {
    const ear = hear({ muted, maxMs: 9000 + words.length * 900, waitMs: 8000, onText: (t) => { const txt = (ctx.all + ' ' + t).trim(); setHeard(txt); const h = align(words, txt); setHits(h); if (score(h) >= 0.9) ear.stop(); } });
    return ear;
  }
  const head = (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Back onClick={back} />
      <div style={{ flex: 1 }}><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F8A61' }}>🏆 الاختبار الشامل</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{items.length ? `${ar(items.length)} آيات من السور اللي حفظتها` : 'احفظ سورة الأول'}</div></div>
      <HomeBtn />
    </div>
  );
  if (fin) {
    const per = {}; res.forEach((x) => { per[x.s] = per[x.s] || [0, 0]; per[x.s][1]++; if (x.ok) per[x.s][0]++; });
    const pct = Math.round((res.filter((x) => x.ok).length / Math.max(1, res.length)) * 100), [lv, lc] = levelOf(pct);
    const weak = res.filter((x) => !x.ok);
    const lines = Object.entries(per).map(([s, [a, b]]) => { const p = Math.round((a / b) * 100); return ['سورة ' + Q30[s].name, `${ar(p)}٪ • ${levelOf(p)[0]}`, levelOf(p)[1]]; });
    return (
      <div className="screen" style={{ gap: 12 }}>
        <Sky tone="mint" />{pct >= 75 && <Confetti />}
        {cert && <Certificate c={{ title: 'شهادة إتقان الحفظ', name: profile?.name || 'بطل', gender: profile?.gender, verb: profile?.gender === 'girl' ? 'اجتازت الاختبار الشامل في حفظ' : 'اجتاز الاختبار الشامل في حفظ', main: lines.length === 1 ? lines[0][0] : `${ar(lines.length)} سور من جزء عمّ`, sub: `النتيجة ${ar(pct)}٪ • ${lv}`, lines: lines.length > 1 ? lines : undefined, stars: pct >= 90 ? 5 : pct >= 75 ? 4 : 3 }} onClose={() => setCert(false)} />}
        {head}
        <div className="card" style={{ position: 'relative', padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: lc }}><bdi>{ar(pct)}٪</bdi></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: lc }}>مستوى الحفظ: {lv}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#6D7896' }}>قلت {ar(res.filter((x) => x.ok).length)} من {ar(res.length)} آيات صح</div>
        </div>
        <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>📊 مستوى كل سورة</div>
          {lines.map(([n, v, c]) => <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800 }}><span className="hafs" style={{ fontSize: 19 }}>{n}</span><span style={{ color: c }}>{v}</span></div>)}
        </div>
        {weak.length > 0 && <div className="card" style={{ position: 'relative', padding: 12, background: '#FFF3D6', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#B4531A' }}>📌 محتاج تراجع:</div>
          {weak.map((x) => <div key={x.s + '-' + x.k} style={{ fontSize: 15, fontWeight: 700 }}>سورة {Q30[x.s].name} — الآية {ar(x.k + 1)}</div>)}
        </div>}
        {pct >= 60 && <button type="button" onClick={() => setCert(true)} style={{ position: 'relative', border: '3px solid #E8C77A', borderRadius: 18, padding: 12, background: 'linear-gradient(135deg,#FFF8E1,#FFE9B0)', color: '#8C5A1F', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>📜 شهادة إتقان الحفظ</button>}
        <button type="button" onClick={back} style={{ position: 'relative', border: 0, borderRadius: 18, padding: 14, background: '#2FB383', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>تمام</button>
      </div>
    );
  }
  const it = items[i], words = it ? ayahWords(Q30[it.s].ayat[it.k]) : [];
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      {head}
      {!items.length && <div className="card" style={{ position: 'relative', padding: 16, textAlign: 'center', fontSize: 17, fontWeight: 800 }}>لما تسمّع سورة كاملة في «حفّظني» هتقدر تعمل الاختبار الشامل 💪</div>}
      {items.length > 0 && i < 0 && <button type="button" onClick={go} style={{ position: 'relative', border: 0, borderRadius: 20, padding: 18, background: '#2FB383', color: '#fff', fontFamily: 'inherit', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 0 #1F8A61' }}>▶ ابدأ الاختبار</button>}
      {it && <>
        <div style={{ position: 'relative', display: 'flex', gap: 3 }}>{items.map((_, k) => <span key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: k < i ? (res[k]?.ok ? '#2FB383' : '#FF7E6B') : k === i ? '#FFC93C' : '#E5E9F0' }} />)}</div>
        <div className="card" style={{ position: 'relative', padding: 12, textAlign: 'center', background: '#FFFDF5' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#6D7896' }}>سورة {Q30[it.s].name} • الشيخ بيقرا الآية {ar(it.k)}</div>
          <div className="hafs" dir="rtl" style={{ fontSize: 24, color: '#26336B', lineHeight: 2 }}>{Q30[it.s].ayat[it.k - 1]} <span style={{ color: '#2FB383', fontSize: 18 }}>﴿{ar(it.k)}﴾</span></div>
        </div>
        <div className="card" style={{ position: 'relative', padding: 12, textAlign: 'center', border: '3px dashed #2FB383' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1F8A61' }}>{turn ? <><motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block' }}>🎤</motion.span> كمّل الآية {ar(it.k + 1)} من حفظك…</> : `الآية ${ar(it.k + 1)}`}</div>
          <div className="hafs" dir="rtl" style={{ fontSize: 24, lineHeight: 2 }}>{words.map((w, j) => <span key={j} style={{ color: hits?.[j] ? '#1F8A61' : '#26336B', background: hits?.[j] ? '#D4F5E4' : 'transparent', borderRadius: 8, filter: hits?.[j] ? 'none' : 'blur(7px)', transition: 'all .25s' }}>{w} </span>)}</div>
          {heard && <div dir="rtl" style={{ fontSize: 15, fontWeight: 700, color: '#6D7896' }}>«{heard}»</div>}
        </div>
        {note && <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ position: 'relative', padding: 10, textAlign: 'center', fontSize: 18, fontWeight: 800, background: note.ok ? '#D4F5E4' : '#FFE9D6', color: note.ok ? '#1F8A61' : '#B4531A' }}>{note.t}</motion.div>}
      </>}
    </div>
  );
}

export default function Hifz({ arg, back, go, swap }) {
  const done = useStore((x) => x.hifz) || [];
  useEffect(() => { if (!arg) hubSay(HIFZ_INTRO); return () => hush(); }, [arg]);
  if (arg === 'test') return <Review back={back} />;
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
      {done.length > 0 && <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('hifz', 'test'); }} className="card"
        style={{ position: 'relative', border: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#1F8A61,#2FB383)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right' }}>
        <span style={{ fontSize: 36 }}>🏆</span>
        <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>الاختبار الشامل</span><span style={{ display: 'block', fontSize: 13, fontWeight: 700, opacity: 0.95 }}>الشيخ يقرا آية وانت تكمّل اللي بعدها • تقرير وشهادة</span></span>
      </motion.button>}
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
