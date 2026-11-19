// ركن «أحاديث النبي ﷺ»: ٤ مجموعات، كل حديث صفحته فيها النص والمصدر والشرح وهعمل إيه وسؤال صغير و«حفظته»
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import DIcon from '../art/Icons';
import { Btn, Bubble, IconBtn, I, Icon, HomeBtn } from '../components/ui';
import { H_CATS, HADITH, hadithById, hadithLine, hadithMean } from '../data/hadith';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';

export const HADITH_INTRO = 'دي أحاديث النبي صلى الله عليه وسلم. اختار حديث وأنا أقولهولك وأشرحهولك.';

export default function Hadith({ arg, back, go }) {
  const h = hadithById(arg);
  if (h) return <Detail key={h.id} h={h} back={back} go={go} />;
  return <List go={go} back={back} />;
}

function List({ go, back }) {
  const hdone = useStore((s) => s.hdone) || [];
  const [cat, setCat] = useState('all');
  useEffect(() => { hubSay(HADITH_INTRO); return () => hush(); }, []);
  const list = cat === 'all' ? HADITH : HADITH.filter((x) => x.cat === cat);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1F8A61' }}>أحاديث النبي ﷺ</h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(HADITH.length)} حديث صحيح للأطفال</div>
        </div>
        <span style={{ background: '#fff', borderRadius: 16, padding: '6px 12px', fontWeight: 800, color: '#1F8A61', boxShadow: '0 3px 0 #E8E0D0' }}>حفظت {ar(hdone.length)}</span>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 6px', flexShrink: 0, minHeight: 48 }}>
        {[{ id: 'all', t: 'الكل', c: '#1F8A61' }, ...H_CATS].map((c) => (
          <button key={c.id} type="button" onClick={() => { sfx.tap(); setCat(c.id); }} style={{ flexShrink: 0, minHeight: 40, whiteSpace: 'nowrap', border: 0, borderRadius: 20, padding: '6px 16px', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer', background: cat === c.id ? c.c : '#fff', color: cat === c.id ? '#fff' : c.c, boxShadow: '0 3px 0 #E8E0D0' }}>{c.t}</button>
        ))}
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((x, k) => {
          const C = H_CATS.find((c) => c.id === x.cat), ok = hdone.includes(x.id);
          return (
            <motion.button key={x.id} type="button" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: Math.min(k, 10) * 0.04 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('hadith', x.id); }} className="card"
              style={{ border: ok ? `3px solid ${C.c}` : '3px solid transparent', padding: 10, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', background: C.bg, color: '#26336B' }}>
              <span style={{ flexShrink: 0, borderRadius: 16, overflow: 'hidden', background: '#fff' }}><DIcon id={x.ic} size={52} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ayah" style={{ fontSize: 19, lineHeight: 1.6, color: '#26336B', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>«{x.t}»</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.c }}>{C.t} · {x.ref}</div>
              </div>
              {ok && <span style={{ fontSize: 22, color: C.c }}>✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ h, back, go }) {
  const C = H_CATS.find((c) => c.id === h.cat);
  const hdone = useStore((s) => s.hdone) || [], toggle = useStore((s) => s.hadithDone);
  const ok = hdone.includes(h.id);
  const [pick, setPick] = useState(null);
  const opts = useMemo(() => (h.id.charCodeAt(2) % 2 ? [h.q[1][1], h.q[1][0]] : h.q[1]), [h.id]);
  const right = h.q[1][0];
  const play = () => say(hadithLine(h), [], hadithMean(h));
  useEffect(() => { const t = setTimeout(play, 400); return () => { clearTimeout(t); hush(); }; }, [h.id]);
  const i = HADITH.indexOf(h), nx = HADITH[(i + 1) % HADITH.length];
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, color: C.c }}>{C.t} · حديث {ar(i + 1)} من {ar(HADITH.length)}</span>
        <HomeBtn />
      </div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ position: 'relative', padding: 16, background: '#fff', border: `4px solid ${C.c}`, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -50 }}><span style={{ borderRadius: 24, overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 6px 14px rgba(0,0,0,.12)' }}><DIcon id={h.ic} size={76} /></span></div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.c, marginTop: 6 }}>قال النبي ﷺ:</div>
        <div className="ayah" style={{ fontSize: 26, lineHeight: 1.75, color: '#26336B', margin: '4px 0' }}>«{h.t}»</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#8A93B0' }}>{h.ref}</div>
        <button type="button" onClick={() => { sfx.tap(); play(); }} style={{ marginTop: 8, border: 0, borderRadius: 18, padding: '6px 16px', background: C.bg, color: C.c, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon d={I.sound} size={18} color={C.c} /> اسمع تاني</button>
      </motion.div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <Siraj pose="wave" size={78} />
        <Bubble tail="l" style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: C.c }}>يعني إيه؟</div><div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.5 }}>{h.mean}</div></Bubble>
      </div>
      <div className="card" style={{ position: 'relative', padding: 12, background: C.bg, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 26 }}>💡</span><div><div style={{ fontSize: 13, fontWeight: 800, color: C.c }}>هعمل إيه؟</div><div style={{ fontSize: 17, fontWeight: 800, color: '#26336B' }}>{h.tip}</div></div>
      </div>
      <div className="card" style={{ position: 'relative', padding: 12, background: '#fff' }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{h.q[0]}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {opts.map((o) => { const st = pick === o ? (o === right ? 'ok' : 'no') : null;
            return <motion.button key={o} type="button" whileTap={{ scale: 0.95 }} animate={st === 'no' ? { x: [0, -8, 8, -4, 0] } : {}} onClick={() => { setPick(o); if (o === right) { sfx.star(); say('شاطر! إجابة صح'); } else { sfx.oops?.(); say('قربت! فكّر تاني'); } }}
              style={{ border: 0, borderRadius: 16, padding: '12px 8px', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer', background: st === 'ok' ? '#2FB383' : st === 'no' ? '#FFD9CF' : '#F4F6FB', color: st === 'ok' ? '#fff' : '#26336B' }}>{o}</motion.button>; })}
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 10 }}>
        <Btn className="block" tone={ok ? 'leaf' : ''} sound="pop" onClick={() => { if (!ok) { sfx.reveal?.(); say('برافو! حفظته صح'); } toggle(h.id); }}>{ok ? '✓ حفظته' : 'حفظته!'}</Btn>
        <Btn tone="teal" sound="whoosh" onClick={() => go('hadith', nx.id)} style={{ flexShrink: 0 }}>اللي بعده ◀</Btn>
      </div>
    </div>
  );
}
