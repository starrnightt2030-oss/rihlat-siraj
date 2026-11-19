// ألعاب الكلمات: حروف مبعثرة (زي كلمات كراش)، سؤال المليون، دوّر على الكلمة، رتّب الآية
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, HomeBtn } from '../components/ui';
import { useStore } from '../store';
import { QB } from '../data/quizbank';
import Q30 from '../data/quran30.json';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, recite } from '../lib/voice';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const Head = ({ t, back, right }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
    <IconBtn icon={I.back} label="رجوع" onClick={back} />
    <h1 style={{ flex: 1, fontSize: 24, fontWeight: 800 }}>{t}</h1>{right}<HomeBtn />
  </div>
);
const Pill = ({ children, c = '#7B5CE0' }) => <span style={{ background: '#fff', color: c, borderRadius: 16, padding: '4px 12px', fontWeight: 800, fontSize: 15, boxShadow: '0 3px 0 #E8E0D0' }}>{children}</span>;
function Done({ title, sub, again, back }) {
  const win = useStore((s) => s.win);
  useEffect(() => { win('words', 3); sfx.reveal?.(); say('برافو!'); }, []);
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <Confetti />
      <Siraj pose="party" size={150} />
      <div style={{ fontSize: 30, fontWeight: 800 }}>{title}</div>
      {sub && <div style={{ fontSize: 18, fontWeight: 700, color: '#5D6CA0' }}>{sub}</div>}
      <div style={{ display: 'flex', gap: 10, width: '100%' }}><Btn className="block" onClick={again} sound="pop">العب تاني</Btn><Btn tone="white" onClick={back}>رجوع</Btn></div>
    </div>
  );
}

// ===== ١) حروف مبعثرة: رتّب الحروف وكوّن الكلمة من التلميح =====
const WORDS = [
  ['صلاة', 'بنعملها ٥ مرات في اليوم'], ['مسجد', 'بيت ربنا اللي بنصلّي فيه'], ['قرآن', 'كلام ربنا'], ['كعبة', 'قبلة المسلمين في مكة'],
  ['صيام', 'بنعمله في رمضان'], ['زكاة', 'جزء من الفلوس بندّيه للفقير'], ['وضوء', 'بنعمله قبل الصلاة'], ['دعاء', 'لما نطلب من ربنا'],
  ['صدق', 'عكس الكدب'], ['جنة', 'المكان الحلو اللي ربنا وعدنا بيه'], ['هدهد', 'الطائر اللي في قصة سليمان'], ['يونس', 'النبي اللي الحوت بلعه'],
  ['نوح', 'النبي اللي بنى السفينة'], ['رمضان', 'شهر الصيام'], ['سجود', 'جبهتنا بتلمس الأرض في الصلاة'], ['تسبيح', 'لما نقول سبحان الله'],
  ['أمانة', 'نحافظ على حاجة حد ونرجّعها'], ['صبر', 'نستحمل وما نزعلش'], ['شكر', 'نقول الحمد لله'], ['أذان', 'النداء للصلاة'],
  ['هجرة', 'سفر النبي ﷺ من مكة للمدينة'], ['عيد', 'يوم فرحة بعد رمضان'], ['قبلة', 'الاتجاه اللي بنصلّي ناحيته'], ['رحمة', 'الطيبة والعطف'],
];
const EXTRA = 'بتثجحخدذرزسشصضطظعغفقكلمنهوي';
export function Scramble({ back, age }) {
  const N = 6, extra = age === '4-6' ? 0 : age === '7-9' ? 1 : 2;
  const [seed, setSeed] = useState(0);
  const set = useMemo(() => shuffle(WORDS).slice(0, N), [seed]);
  const [i, setI] = useState(0), [got, setGot] = useState([]), [ok, setOk] = useState(false);
  const w = set[i] && set[i][0];
  const tiles = useMemo(() => w ? shuffle([...w].concat(Array.from({ length: extra }, (_, k) => EXTRA[(i * 7 + k * 11 + seed) % EXTRA.length]))).map((c, k) => ({ c, k })) : [], [i, seed]);
  useEffect(() => { setGot([]); setOk(false); if (w) say('رتّب الحروف وكوّن الكلمة!'); }, [i, seed]);
  if (i >= N) return <div className="screen"><Sky tone="lilac" /><Done title="ما شاء الله!" sub={`كوّنت ${ar(N)} كلمات`} again={() => { setI(0); setSeed(seed + 1); }} back={back} /></div>;
  const tap = (t) => {
    if (ok || got.includes(t.k)) return; sfx.tap(); const g = [...got, t.k]; setGot(g);
    const word = g.map((k) => tiles.find((x) => x.k === k).c).join('');
    if (word === w) { setOk(true); sfx.star(); say('شاطر! إجابة صح'); setTimeout(() => setI(i + 1), 1300); }
    else if (g.length >= w.length) { sfx.oops?.(); say('قربت! فكّر تاني'); setTimeout(() => setGot([]), 700); }
  };
  return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="lilac" />
      <Head t="حروف مبعثرة" back={back} right={<Pill>{ar(i + 1)}/{ar(N)}</Pill>} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <Siraj pose="wave" size={74} />
        <Bubble tail="l" style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: '#7B5CE0' }}>التلميح</div><div style={{ fontSize: 20, fontWeight: 800 }}>{set[i][1]}</div></Bubble>
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 8, direction: 'rtl', marginTop: 8 }}>
        {[...w].map((_, k) => { const c = got[k] !== undefined ? tiles.find((x) => x.k === got[k]).c : '';
          return <motion.span key={k} animate={ok ? { y: [0, -10, 0] } : {}} transition={{ delay: k * 0.06 }} style={{ width: 52, height: 60, borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 800, background: ok ? '#2FB383' : c ? '#fff' : '#ffffff88', color: ok ? '#fff' : '#26336B', border: '3px dashed ' + (c ? 'transparent' : '#B9A8F5'), boxShadow: c ? '0 4px 0 #D8CCF7' : 'none' }}>{c}</motion.span>; })}
      </div>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 14 }}>
        {tiles.map((t) => { const used = got.includes(t.k);
          return <motion.button key={t.k + '-' + i} type="button" whileTap={{ scale: 0.85 }} initial={{ scale: 0, rotate: -20 }} animate={{ scale: used ? 0.8 : 1, rotate: 0, opacity: used ? 0.3 : 1 }} onClick={() => tap(t)}
            style={{ width: 64, height: 64, borderRadius: 32, border: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 32, fontWeight: 800, color: '#fff', background: 'radial-gradient(circle at 35% 30%, #B59BFF, #7B5CE0)', boxShadow: '0 5px 0 #5A3DBF' }}>{t.c}</motion.button>; })}
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 10, marginTop: 'auto' }}>
        <Btn tone="white" onClick={() => setGot(got.slice(0, -1))}>⌫ امسح</Btn>
        <Btn tone="white" onClick={() => { const n = got.length; if (n < w.length) { const k = tiles.find((x) => x.c === w[n] && !got.includes(x.k)); if (k) tap(k); } }}>💡 حرف مساعدة</Btn>
      </div>
    </div>
  );
}

// ===== ٢) سؤال المليون: ١٠ أسئلة بتصعب، و٣ وسائل مساعدة، ونجوم بدل الفلوس =====
const LADDER = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
export function Million({ back, age }) {
  const [seed, setSeed] = useState(0);
  const pool = useMemo(() => { const mx = age === '4-6' ? 1 : age === '7-9' ? 2 : 3; const used = new Set();
    const pick = (l) => { const c = shuffle(QB.filter((q) => q.l === Math.min(l, mx) && !used.has(q.q))); const q = c[0] || shuffle(QB.filter((x) => !used.has(x.q)))[0]; used.add(q.q); return q; };
    return LADDER.map((l) => pick(l)); }, [seed]);
  const [i, setI] = useState(0), [pick, setPick] = useState(null), [out, setOut] = useState(false), [hid, setHid] = useState([]), [hint, setHint] = useState(false), [life, setLife] = useState({ half: 1, ask: 1, swap: 1 }), [extra, setExtra] = useState(null);
  const q = extra || pool[i];
  const opts = useMemo(() => q ? shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))) : [], [q]);
  useEffect(() => { setPick(null); setHid([]); setHint(false); if (q && !out) say(q.q); }, [i, extra, seed]);
  const reset = () => { setSeed(seed + 1); setI(0); setOut(false); setLife({ half: 1, ask: 1, swap: 1 }); setExtra(null); };
  if (i >= LADDER.length) return <div className="screen"><Sky tone="warm" /><Done title="بطل المليون! 🏆" sub="جاوبت العشر أسئلة كلهم صح" again={reset} back={back} /></div>;
  if (out) return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <Sky tone="warm" /><Siraj pose="think" size={140} />
      <div style={{ position: 'relative', fontSize: 26, fontWeight: 800 }}>وصلت للسؤال {ar(i + 1)}! 👏</div>
      <div style={{ position: 'relative', fontSize: 18, fontWeight: 700, color: '#5D6CA0' }}>الإجابة الصح: {opts.find((o) => o.ok)?.t}</div>
      <div style={{ position: 'relative', display: 'flex', gap: 10, width: '100%' }}><Btn className="block" onClick={reset} sound="pop">جرّب تاني</Btn><Btn tone="white" onClick={back}>رجوع</Btn></div>
    </div>
  );
  const answer = (o) => {
    if (pick) return; setPick(o);
    if (o.ok) { sfx.star(); say('شاطر! إجابة صح'); setTimeout(() => { setExtra(null); setI(i + 1); }, 1400); }
    else { sfx.oops?.(); say('قربت! فكّر تاني'); setTimeout(() => setOut(true), 1500); }
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <Head t="سؤال المليون" back={back} />
      <div style={{ position: 'relative', display: 'flex', gap: 4, direction: 'rtl' }}>
        {LADDER.map((_, k) => <span key={k} style={{ flex: 1, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, background: k < i ? '#2FB383' : k === i ? '#F5A623' : '#fff', color: k <= i ? '#fff' : '#9AA3BF', boxShadow: k === 4 || k === 9 ? '0 0 0 2px #E8890C' : 'none' }}>{k === 9 ? '🏆' : ar(k + 1)}</span>)}
      </div>
      <motion.div key={q.q} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ position: 'relative', padding: 16, background: 'linear-gradient(135deg,#2B3D8C,#4A5FC0)', color: '#fff', textAlign: 'center', fontSize: 22, fontWeight: 800, border: '3px solid #FFC93C' }}>{q.q}</motion.div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((o, k) => { if (hid.includes(o.t)) return <div key={o.t} style={{ height: 58 }} />;
          const st = pick === o ? (o.ok ? 'ok' : 'no') : pick && o.ok ? 'ok' : null, glow = hint && o.ok;
          return <motion.button key={o.t} type="button" whileTap={{ scale: 0.97 }} animate={glow ? { scale: [1, 1.04, 1] } : {}} transition={glow ? { repeat: Infinity, duration: 1 } : {}} onClick={() => answer(o)}
            style={{ minHeight: 58, borderRadius: 30, border: '3px solid ' + (glow ? '#FFC93C' : '#C9D2F0'), fontFamily: 'inherit', fontSize: 19, fontWeight: 800, cursor: 'pointer', background: st === 'ok' ? '#2FB383' : st === 'no' ? '#E0507A' : '#fff', color: st ? '#fff' : '#26336B', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
            <span style={{ width: 32, height: 32, borderRadius: 16, background: '#F5A623', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16 }}>{'أبج'[k]}</span>{o.t}</motion.button>; })}
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Btn tone="white" className="block" disabled={!life.half || pick} style={{ opacity: life.half ? 1 : 0.4 }} onClick={() => { setLife({ ...life, half: 0 }); setHid([opts.find((o) => !o.ok).t]); }}>✂️ احذف إجابة</Btn>
        <Btn tone="white" className="block" disabled={!life.ask || pick} style={{ opacity: life.ask ? 1 : 0.4 }} onClick={() => { setLife({ ...life, ask: 0 }); setHint(true); }}>🔥 اسأل سراج</Btn>
        <Btn tone="white" className="block" disabled={!life.swap || pick} style={{ opacity: life.swap ? 1 : 0.4 }} onClick={() => { setLife({ ...life, swap: 0 }); const c = shuffle(QB.filter((x) => x.l === LADDER[i] && !pool.includes(x)))[0]; if (c) setExtra(c); }}>🔄 غيّر السؤال</Btn>
      </div>
    </div>
  );
}

// ===== ٣) دوّر على الكلمة: شبكة حروف فيها كلمات مستخبية (أفقي أو رأسي) =====
const THEMES = [
  { t: 'أنبياء', c: '#3FA9F5', w: ['نوح', 'هود', 'صالح', 'يونس', 'موسى', 'عيسى', 'آدم', 'لوط', 'يوسف'] },
  { t: 'عبادات', c: '#2FB383', w: ['صلاة', 'صيام', 'زكاة', 'حج', 'دعاء', 'ذكر', 'وضوء'] },
  { t: 'أخلاق', c: '#FF7E6B', w: ['صدق', 'أمانة', 'صبر', 'رحمة', 'كرم', 'شكر', 'عدل'] },
  { t: 'في الجنة', c: '#9B7BF2', w: ['أنهار', 'قصور', 'فاكهة', 'نور', 'سلام', 'سعادة'] },
];
function makeGrid(words, n) {
  for (let tries = 0; tries < 200; tries++) {
    const g = Array.from({ length: n }, () => Array(n).fill('')), place = [];
    let fail = false;
    for (const w of words) {
      const L = [...w]; let ok = false;
      for (let t = 0; t < 80 && !ok; t++) {
        const dir = Math.random() < 0.5 ? 'h' : 'v', r = Math.floor(Math.random() * (dir === 'v' ? n - L.length + 1 : n)), c = Math.floor(Math.random() * (dir === 'h' ? n - L.length + 1 : n));
        if (r < 0 || c < 0) continue;
        const cells = L.map((_, k) => (dir === 'h' ? [r, c + k] : [r + k, c]));
        if (cells.every(([y, x], k) => !g[y][x] || g[y][x] === L[k])) { cells.forEach(([y, x], k) => (g[y][x] = L[k])); place.push({ w, cells }); ok = true; }
      }
      if (!ok) { fail = true; break; }
    }
    if (fail) continue;
    const pool = 'ابتثجحخدذرسشصطعفقكلمنهوي';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!g[y][x]) g[y][x] = pool[Math.floor(Math.random() * pool.length)];
    return { g, place };
  }
  return null;
}
export function WordSearch({ back, age }) {
  const n = age === '4-6' ? 6 : 7, cnt = age === '4-6' ? 4 : age === '7-9' ? 5 : 6;
  const [seed, setSeed] = useState(0), [th, setTh] = useState(0);
  const T = THEMES[th % THEMES.length];
  const { g, place } = useMemo(() => makeGrid(shuffle(T.w).slice(0, cnt).sort((a, b) => b.length - a.length), n), [seed, th]);
  const [found, setFound] = useState([]), [sel, setSel] = useState(null), [flash, setFlash] = useState(null);
  useEffect(() => { setFound([]); setSel(null); say('دوّر على الكلمات المستخبية!'); }, [seed, th]);
  const key = (y, x) => y + ',' + x;
  const isFound = (y, x) => place.some((p) => found.includes(p.w) && p.cells.some(([a, b]) => a === y && b === x));
  const tap = (y, x) => {
    sfx.tap();
    if (!sel) { setSel([y, x]); return; }
    const [y0, x0] = sel; setSel(null);
    const hit = place.find((p) => !found.includes(p.w) && ((key(...p.cells[0]) === key(y0, x0) && key(...p.cells.at(-1)) === key(y, x)) || (key(...p.cells.at(-1)) === key(y0, x0) && key(...p.cells[0]) === key(y, x))));
    if (hit) { sfx.star(); setFound([...found, hit.w]); setFlash(hit.w); say('شاطر! إجابة صح'); }
    else sfx.oops?.();
  };
  const allDone = found.length === place.length;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <Head t="دوّر على الكلمة" back={back} right={<Pill c={T.c}>{T.t}</Pill>} />
      {allDone ? <Done title="لقيت كل الكلمات! 🔎" again={() => { setTh(th + 1); setSeed(seed + 1); }} back={back} /> : (<>
        <div style={{ position: 'relative', fontSize: 15, fontWeight: 800, color: '#5D6CA0', textAlign: 'center' }}>دوس على أول حرف في الكلمة، وبعدين على آخر حرف</div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 4, direction: 'rtl', background: '#fff', borderRadius: 20, padding: 8, boxShadow: '0 5px 0 #D5EBE0' }}>
          {g.map((row, y) => row.map((ch, x) => { const f = isFound(y, x), s = sel && sel[0] === y && sel[1] === x;
            return <motion.button key={key(y, x)} type="button" whileTap={{ scale: 0.85 }} onClick={() => tap(y, x)} style={{ aspectRatio: '1', border: 0, borderRadius: 10, fontFamily: 'inherit', fontSize: n > 6 ? 22 : 26, fontWeight: 800, cursor: 'pointer', background: s ? '#FFC93C' : f ? T.c : '#F4F6FB', color: f ? '#fff' : '#26336B' }}>{ch}</motion.button>; }))}
        </div>
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {place.map((p) => <motion.span key={p.w} animate={flash === p.w ? { scale: [1, 1.3, 1] } : {}} style={{ padding: '6px 14px', borderRadius: 16, fontSize: 18, fontWeight: 800, background: found.includes(p.w) ? T.c : '#fff', color: found.includes(p.w) ? '#fff' : '#26336B', textDecoration: found.includes(p.w) ? 'line-through' : 'none', boxShadow: '0 3px 0 #E8E0D0' }}>{p.w}</motion.span>)}
        </div>
      </>)}
    </div>
  );
}

// ===== ٤) رتّب الآية: كلمات آية من جزء عمّ متلخبطة، رتّبها وبعدين اسمعها من الشيخ =====
const AYAT = (() => { const out = []; for (const [s, v] of Object.entries(Q30)) { if (+s === 1) continue; v.ayat.forEach((t, k) => { const n = t.split(' ').length; if (n >= 3 && n <= 7) out.push({ s: +s, a: k + 1, t, name: v.name }); }); } return out; })();
export function AyahOrder({ back, age }) {
  const N = 5, maxW = age === '4-6' ? 4 : age === '7-9' ? 6 : 7;
  const [seed, setSeed] = useState(0);
  const set = useMemo(() => shuffle(AYAT.filter((x) => x.t.split(' ').length <= maxW)).slice(0, N), [seed]);
  const [i, setI] = useState(0), [got, setGot] = useState([]), [ok, setOk] = useState(false);
  const A = set[i], words = A ? A.t.split(' ') : [];
  const tiles = useMemo(() => shuffle(words.map((w, k) => ({ w, k }))), [i, seed]);
  useEffect(() => { setGot([]); setOk(false); if (A) say('رتّب كلمات الآية!'); }, [i, seed]);
  if (i >= N) return <div className="screen"><Sky tone="lilac" /><Done title="رتّبت الآيات صح!" sub={`${ar(N)} آيات من جزء عمّ`} again={() => { setI(0); setSeed(seed + 1); }} back={back} /></div>;
  const code = String(A.s).padStart(3, '0') + String(A.a).padStart(3, '0');
  const tap = (t) => {
    if (ok || got.includes(t.k)) return; sfx.tap(); const g = [...got, t.k];
    if (words[t.k] !== words[g.length - 1]) { sfx.oops?.(); return; }
    setGot(g);
    if (g.length === words.length) { setOk(true); sfx.star(); setTimeout(() => recite([code]), 500); }
  };
  return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="lilac" />
      <Head t="رتّب الآية" back={back} right={<Pill>{ar(i + 1)}/{ar(N)}</Pill>} />
      <div style={{ position: 'relative', textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#6E4FD0' }}>من سورة {A.name.replace(/[ً-ْ]/g, '')} · آية {ar(A.a)}</div>
      <div className="card" style={{ position: 'relative', minHeight: 120, padding: 14, background: ok ? '#E3F7EE' : '#fff', display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignContent: 'center', direction: 'rtl', border: ok ? '3px solid #2FB383' : '3px dashed #C9B8F5' }}>
        {got.length ? got.map((k) => <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} className="hafs" style={{ fontSize: 28, color: '#26336B' }}>{words[k]}</motion.span>) : <span style={{ color: '#9AA3BF', fontWeight: 700 }}>دوس على الكلمات بالترتيب</span>}
      </div>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {tiles.map((t) => <motion.button key={t.k + '-' + i} type="button" whileTap={{ scale: 0.9 }} animate={{ opacity: got.includes(t.k) ? 0.25 : 1 }} onClick={() => tap(t)} className="hafs"
          style={{ border: 0, borderRadius: 16, padding: '6px 16px', fontSize: 26, cursor: 'pointer', background: '#fff', color: '#5A3DBF', boxShadow: '0 4px 0 #D8CCF7' }}>{t.w}</motion.button>)}
      </div>
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', gap: 10 }}>
        {ok ? <Btn className="block" sound="pop" onClick={() => { hush(); setI(i + 1); }}>اللي بعدها ◀</Btn> : <Btn tone="white" className="block" onClick={() => recite([code])}>🔊 اسمع الآية كمساعدة</Btn>}
      </div>
    </div>
  );
}
