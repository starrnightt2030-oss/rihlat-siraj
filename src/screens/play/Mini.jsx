// «مين المختلف؟» و«عدّ وطابق»: جولات قصيرة متتالية، كل جولة بتتولّد جديدة، و١٠ جولات = نجمة
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store';
import { sfx } from '../../lib/sound';
import { say } from '../../lib/voice';
import { PEG_NUM_WORDS } from '../../data/pegs';
import { ODD_GROUPS, MINI_LINES } from '../../data/playData';
import { Head, Chips, Win, Img, ar, shuffle, pick, rnd } from './common';

const ROUNDS = 8;
const Bar = ({ i, c }) => (
  <div style={{ position: 'relative', display: 'flex', gap: 4 }}>
    {[...Array(ROUNDS)].map((_, k) => <span key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: k < i ? c : 'rgba(34,48,106,.12)', transition: 'background .3s' }} />)}
  </div>
);
const Thing = ({ x, size }) => (x.src ? <Img src={x.src} style={{ width: size, height: size, objectFit: 'contain' }} /> : <span style={{ fontSize: size * 0.78, lineHeight: 1 }}>{x.e}</span>);

// ---------- مين المختلف؟ ----------
function oddRound() {
  const [g, o] = shuffle(ODD_GROUPS.filter((x) => x.items.length >= 3));
  const same = shuffle(g.items).slice(0, 3), odd = pick(o.items);
  return { g, o, cards: shuffle([...same.map((x) => ({ ...x, odd: false })), { ...odd, odd: true }]) };
}
export function Odd({ back }) {
  const win = useStore((s) => s.win);
  const [i, setI] = useState(0), [r, setR] = useState(oddRound), [pickd, setPick] = useState(null), [score, setScore] = useState(0);
  useEffect(() => { const t = setTimeout(() => say(MINI_LINES.odd), 400); return () => clearTimeout(t); }, []);
  const done = i >= ROUNDS;
  useEffect(() => { if (done) { sfx.good(); win('odd'); } }, [done]);
  const choose = (k) => {
    if (pickd !== null) return; setPick(k);
    const ok = r.cards[k].odd; if (ok) { sfx.star(); setScore(score + 1); } else sfx.soft();
    setTimeout(() => { setPick(null); setI(i + 1); setR(oddRound()); }, ok ? 1500 : 2300);
  };
  const again = () => { setI(0); setScore(0); setR(oddRound()); };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title="مين المختلف؟ 🤔" sub="٣ من نفس النوع وواحد غريب… دوس عليه" back={back} tone="lilac" />
      <Bar i={i} c="#7B5CE0" />
      {!done && <>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {r.cards.map((x, k) => { const show = pickd !== null, good = x.odd, mine = pickd === k;
            return (
              <motion.button key={i + '-' + k} type="button" onClick={() => choose(k)} initial={{ scale: 0.7, opacity: 0 }} animate={mine && !good ? { x: [0, -8, 8, -4, 0], scale: 1, opacity: 1 } : { scale: show && good ? 1.06 : 1, opacity: show && !good && !mine ? 0.55 : 1 }} transition={{ delay: show ? 0 : k * 0.07 }}
                className="card" style={{ position: 'relative', border: 0, aspectRatio: '1', display: 'grid', placeItems: 'center', cursor: 'pointer', background: show && good ? '#E3F7EE' : mine ? '#FFE3E3' : '#fff', outline: show && good ? '4px solid #2FB383' : mine ? '4px solid #E5484D' : 'none' }}>
                <Thing x={x} size={96} />
                <span style={{ position: 'absolute', bottom: 8, fontSize: 13, fontWeight: 800, color: '#6D7896' }}>{x.n}</span>
                {show && good && <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 22 }}>⭐</span>}
              </motion.button>
            ); })}
        </div>
        <AnimatePresence>{pickd !== null && <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ position: 'relative', padding: 12, textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#26336B', lineHeight: 1.7 }}>
          {r.cards[pickd].odd ? '👏 صح! ' : '🤏 قربت! '}الباقيين كلهم {r.g.t}، لكن {r.cards.find((x) => x.odd).n} {r.o.one}
        </motion.div>}</AnimatePresence>
      </>}
      {done && <Win text={`خلّصت! جاوبت ${ar(score)} من ${ar(ROUNDS)} صح`} again={again} />}
    </div>
  );
}

// ---------- عدّ وطابق ----------
const CNT = [{ id: 5, t: 'لحد ٥' }, { id: 10, t: 'لحد ١٠' }, { id: 20, t: 'لحد ٢٠' }];
const OBJ = [{ src: 'rewards/star', n: 'نجوم' }, { src: 'stickers/camel', n: 'جمال' }, { e: '🌴', n: 'نخل' }, { e: '🍎', n: 'تفاح' }, { src: 'stickers/whale', n: 'حيتان' }, { e: '🌙', n: 'أهلّة' }, { src: 'stickers/hoopoe', n: 'هداهد' }, { e: '🎈', n: 'بلالين' }, { e: '🐟', n: 'سمك' }, { src: 'stickers/mosque', n: 'مساجد' }];
function countRound(max) {
  const n = Math.floor(rnd(max === 5 ? 1 : max === 10 ? 3 : 8, max + 1)), obj = pick(OBJ);
  const opts = new Set([n]); while (opts.size < 3) { const d = n + pick([-3, -2, -1, 1, 2, 3]); if (d >= 1 && d <= max) opts.add(d); }
  // الحاجات متوزّعة في شبكة مع شوية لخبطة، عشان تبان طبيعية ومتتلزقش في بعض
  const cols = Math.ceil(Math.sqrt(n * 1.5)), rows = Math.ceil(n / cols);
  const cells = shuffle([...Array(cols * rows).keys()]).slice(0, n).map((c) => ({ x: (c % cols + 0.5 + rnd(-0.15, 0.15)) / cols, y: (Math.floor(c / cols) + 0.5 + rnd(-0.15, 0.15)) / rows, r: rnd(-14, 14) }));
  return { n, obj, opts: shuffle([...opts]), cells, size: n > 12 ? 34 : n > 6 ? 44 : 58 };
}
export function Count({ back }) {
  const age = useStore((s) => s.profile?.age || '7-9'), win = useStore((s) => s.win);
  const [max, setMax] = useState(age === '4-6' ? 5 : age === '7-9' ? 10 : 20);
  const [i, setI] = useState(0), [r, setR] = useState(() => countRound(max)), [pickd, setPick] = useState(null), [score, setScore] = useState(0), [tapped, setTapped] = useState([]);
  useEffect(() => { const t = setTimeout(() => say(MINI_LINES.count), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { setI(0); setScore(0); setR(countRound(max)); setTapped([]); }, [max]);
  const done = i >= ROUNDS;
  useEffect(() => { if (done) { sfx.good(); win('count'); } }, [done]);
  // الطفل يقدر يدوس على كل حاجة وهو بيعد، وتتعلّم عليها برقمها
  const tapObj = (k) => { if (tapped.includes(k) || pickd !== null) return; const t = [...tapped, k]; setTapped(t); sfx.tap(); say(PEG_NUM_WORDS[t.length - 1]); };
  const choose = (v) => {
    if (pickd !== null) return; setPick(v); const ok = v === r.n;
    if (ok) { sfx.star(); setScore(score + 1); say(PEG_NUM_WORDS[r.n - 1]); } else sfx.soft();
    setTimeout(() => { setPick(null); setTapped([]); setI(i + 1); setR(countRound(max)); }, ok ? 1300 : 2000);
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Head title="عدّ وطابق 🔢" sub="عدّ الحاجات واختار الرقم الصح" back={back} tone="mint" />
      <Chips items={CNT} value={max} onPick={(v) => { sfx.tap(); setMax(v); }} c="#1F8FA6" />
      <Bar i={i} c="#1F8FA6" />
      {!done && <>
        <div className="card" style={{ position: 'relative', height: 300, background: 'linear-gradient(180deg,#F2FBFF,#E3F6FA)', overflow: 'hidden' }}>
          {r.cells.map((c, k) => { const t = tapped.indexOf(k);
            return <motion.button key={i + '-' + k} type="button" onClick={() => tapObj(k)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: k * 0.04, type: 'spring', stiffness: 400, damping: 18 }}
              style={{ position: 'absolute', left: `calc(${c.x * 100}% - ${r.size / 2}px)`, top: `calc(${c.y * 100}% - ${r.size / 2}px)`, transform: `rotate(${c.r}deg)`, border: 0, background: 'transparent', padding: 0, cursor: 'pointer', opacity: t >= 0 ? 0.55 : 1 }}>
              <Thing x={r.obj} size={r.size} />
              {t >= 0 && <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 22, height: 22, borderRadius: 11, background: '#1F8FA6', color: '#fff', fontSize: 13, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{ar(t + 1)}</span>}
            </motion.button>; })}
        </div>
        <div style={{ position: 'relative', textAlign: 'center', fontSize: 17, fontWeight: 800, color: '#26336B' }}>كام {r.obj.n}؟ <span style={{ fontSize: 13, color: '#6D7896' }}>(دوس عليهم وانت بتعد)</span></div>
        <div style={{ position: 'relative', display: 'flex', gap: 10 }}>
          {r.opts.map((v) => { const show = pickd !== null, good = v === r.n, mine = pickd === v;
            return <motion.button key={i + '-' + v} type="button" onClick={() => choose(v)} animate={mine && !good ? { x: [0, -8, 8, -4, 0] } : { scale: show && good ? 1.1 : 1 }}
              style={{ flex: 1, height: 74, borderRadius: 20, border: 0, fontFamily: 'inherit', fontSize: 34, fontWeight: 800, cursor: 'pointer', background: show && good ? '#2FB383' : mine ? '#E5484D' : '#fff', color: show && (good || mine) ? '#fff' : '#1F8FA6', boxShadow: '0 5px 0 rgba(31,143,166,.25)' }}>{ar(v)}</motion.button>; })}
        </div>
      </>}
      {done && <Win text={`برافو! عدّيت ${ar(score)} من ${ar(ROUNDS)} صح`} again={() => { setI(0); setScore(0); setR(countRound(max)); }} more={max < 20 ? () => setMax(max === 5 ? 10 : 20) : null} />}
    </div>
  );
}
