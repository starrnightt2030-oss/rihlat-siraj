// تمارين جوّه الكارت: اختار الصورة، وصّل، رتّب، كمّل الحديث
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Art from '../art';
import { Icon, I } from './ui';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const COLS = ['#F5A623', '#2FB383', '#E0609E', '#3A8FE0', '#7B5CE0', '#1F8FA6'];
const shuffle = (arr) => { const a = arr.map((x, i) => [x, i]); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.length > 1 && a.every(([, k], i) => k === i)) a.push(a.shift()); return a; };
const Shake = { x: [0, -10, 10, -6, 6, 0] };
export const PRACTICE = new Set(['pick', 'match', 'order', 'fill']);

const Title = ({ s, u }) => (
  <div style={{ textAlign: 'center' }}>
    <span className="ribbon" style={{ '--c': u.color, fontSize: 15 }}>تمرين</span>
    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>{s.q}</div>
  </div>
);
const good = (t = 'برافو!') => { sfx.good(); say(t); };
const bad = () => { sfx.soft(); say('قربت! فكّر تاني'); };

const Opt = ({ children, on, state, onClick, label, col }) => (
  <motion.button type="button" onClick={onClick} aria-label={label} animate={state === 'bad' ? Shake : state === 'good' ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 0.4 }}
    style={{ position: 'relative', border: `4px solid ${state === 'good' ? '#2FB383' : state === 'bad' ? '#FF7E6B' : on ? col : '#fff'}`, borderRadius: 24, background: '#fff', padding: 6, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, boxShadow: '0 5px 0 #E8E0D0' }}>
    {children}
    {state === 'good' && <span style={{ position: 'absolute', top: 6, left: 6, width: 30, height: 30, borderRadius: 15, background: '#2FB383', display: 'grid', placeItems: 'center' }}><Icon d={I.check} color="#fff" w={4} size={18} /></span>}
  </motion.button>
);

// اختار الصورة الصح — opts: [{ kid|wudu|scene, t? }] أو نصوص
function Pick({ s, u, g, onSolve }) {
  const order = useMemo(() => shuffle(s.opts), [s]);
  const [st, setSt] = useState({});
  const done = st[s.c] === 'good';
  const tap = (k) => {
    if (done) return;
    if (k === s.c) { setSt({ [k]: 'good' }); good(s.ok || 'برافو! إجابة صح'); onSolve(); }
    else { setSt({ [k]: 'bad' }); bad(); setTimeout(() => setSt({}), 700); }
  };
  const text = typeof s.opts[0] === 'string';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Title s={s} u={u} />
      {s.show && <div className="card" style={{ alignSelf: 'center', padding: 6, background: u.soft }}><Art a={s.show} g={g} size={170} /></div>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${text && s.opts.length > 3 ? 3 : 2}, minmax(0,1fr))`, gap: 10 }}>
        {order.map(([o, k], i) => (
          <Opt key={k} state={st[k]} onClick={() => tap(k)} label={typeof o === 'string' ? o : o.t || 'اختيار ' + (i + 1)} col={COLS[i % 6]}>
            {typeof o === 'string'
              ? <span style={{ minHeight: 64, display: 'grid', placeItems: 'center', fontSize: o.length > 3 ? 18 : 30, fontWeight: 800, lineHeight: 1.3, padding: '0 4px', color: COLS[i % 6] }}>{o}</span>
              : <><Art a={o} g={g} size={120} />{o.t && <span style={{ fontSize: 15, fontWeight: 800 }}>{o.t}</span>}</>}
          </Opt>
        ))}
      </div>
      {done && s.after && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '10px 14px', fontSize: 17, fontWeight: 800, color: '#1F8A61', background: '#EAF8F1' }}>{s.after}</motion.div>}
    </div>
  );
}

// وصّل كل صورة باسمها — pairs: [[art, 'الاسم']]
function Match({ s, u, g, onSolve }) {
  const arts = useMemo(() => shuffle(s.pairs), [s]);
  const names = useMemo(() => shuffle(s.pairs), [s]);
  const [sel, setSel] = useState(null);
  const [ok, setOk] = useState({});
  const [badN, setBadN] = useState(null);
  const tapName = (k) => {
    if (ok[k]) return;
    if (sel === null) { sfx.tap(); say('اختار الصورة الأول'); return; }
    if (sel === k) { const n = { ...ok, [k]: true }; setOk(n); setSel(null); sfx.good(); if (Object.keys(n).length === s.pairs.length) { good('برافو! وصّلت كله صح'); onSolve(); } }
    else { setBadN(k); bad(); setTimeout(() => setBadN(null), 600); }
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Title s={s} u={u} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.pairs.length > 4 ? 3 : 2}, minmax(0,1fr))`, gap: 8 }}>
        {arts.map(([[a], k], i) => (
          <Opt key={k} on={sel === k} state={ok[k] ? 'good' : null} onClick={() => { if (!ok[k]) { sfx.tap(); setSel(k); } }} label={'صورة ' + (i + 1)} col={u.color}>
            <Art a={a} g={g} size={s.pairs.length > 4 ? 84 : 110} />
            <span style={{ minHeight: 22, fontSize: 14, fontWeight: 800, color: '#1F8A61' }}>{ok[k] ? s.pairs[k][1] : '؟'}</span>
          </Opt>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {names.map(([[, t], k], i) => (
          <motion.button key={k} type="button" onClick={() => tapName(k)} disabled={ok[k]} animate={badN === k ? Shake : {}}
            style={{ border: 0, borderRadius: 18, padding: '8px 14px', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer', color: ok[k] ? '#9AA6BF' : '#fff', background: ok[k] ? '#EEF1F6' : COLS[i % 6], boxShadow: ok[k] ? 'none' : '0 4px 0 #0002', textDecoration: ok[k] ? 'line-through' : 'none' }}>{t}</motion.button>
        ))}
      </div>
    </div>
  );
}

// رتّب بالترتيب الصح — items: [{ kid|wudu|scene, t }] بالترتيب الصح
function Order({ s, u, g, onSolve }) {
  const order = useMemo(() => shuffle(s.items), [s]);
  const [n, setN] = useState(0);
  const [badK, setBadK] = useState(null);
  const tap = (k) => {
    if (k < n) return;
    if (k === n) { sfx.pop(); const m = n + 1; setN(m); if (m === s.items.length) { good('برافو! الترتيب صح'); onSolve(); } }
    else { setBadK(k); bad(); setTimeout(() => setBadK(null), 600); }
  };
  const big = s.items.length <= 4;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Title s={s} u={u} />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#6D7896', textAlign: 'center' }}>دوس على الأول، وبعدين اللي بعده… <bdi>{ar(n)}</bdi> من <bdi>{ar(s.items.length)}</bdi></div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${big ? 2 : 3}, minmax(0,1fr))`, gap: 8 }}>
        {order.map(([o, k]) => (
          <Opt key={k} state={k < n ? 'good' : badK === k ? 'bad' : null} onClick={() => tap(k)} label={o.t} col={u.color}>
            {k < n && <span className="num" style={{ '--c': u.color, position: 'absolute', top: 4, right: 4, width: 28, height: 28, fontSize: 15 }}>{ar(k + 1)}</span>}
            {(o.kid || o.wudu || o.scene) && <Art a={o} g={g} size={big ? 110 : 80} />}
            <span style={{ fontSize: big ? 15 : 13, fontWeight: 800, lineHeight: 1.3, minHeight: o.kid || o.wudu || o.scene ? 0 : 54, display: 'grid', placeItems: 'center' }}>{o.t}</span>
          </Opt>
        ))}
      </div>
    </div>
  );
}

// كمّل الحديث أو الآية — text: 'قبل ___ بعد'
function Fill({ s, u, onSolve }) {
  const order = useMemo(() => shuffle(s.opts), [s]);
  const [st, setSt] = useState({});
  const done = st[s.c] === 'good';
  const [a, b] = s.text.split('___');
  const tap = (k) => {
    if (done) return;
    if (k === s.c) { setSt({ [k]: 'good' }); good('برافو! حفظته صح'); onSolve(); }
    else { setSt({ [k]: 'bad' }); bad(); setTimeout(() => setSt({}), 700); }
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
      <Title s={s} u={u} />
      <div className="card dash" style={{ '--c': '#9FD3B6', padding: '18px 14px', textAlign: 'center', background: '#F4FBF7' }}>
        <div className="ayah" style={{ fontSize: 25, color: '#1F7A55', lineHeight: 2 }}>
          «{a}<span style={{ display: 'inline-block', minWidth: 70, margin: '0 4px', padding: '0 8px', borderRadius: 12, background: done ? '#2FB383' : '#FFF3D6', color: done ? '#fff' : '#C97B23', borderBottom: done ? 0 : '3px dashed #F5A623' }}>{done ? s.opts[s.c] : '؟'}</span>{b}»
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7A6A70' }}>{s.ref}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {order.map(([o, k], i) => (
          <motion.button key={k} type="button" onClick={() => tap(k)} animate={st[k] === 'bad' ? Shake : {}}
            className="ayah" style={{ border: 0, borderRadius: 20, minHeight: 60, fontSize: 22, cursor: 'pointer', color: st[k] ? '#fff' : '#26336B', background: st[k] === 'good' ? '#2FB383' : st[k] === 'bad' ? '#FF7E6B' : '#fff', boxShadow: `0 5px 0 ${COLS[i % 6]}55` }}>{o}</motion.button>
        ))}
      </div>
      {done && s.mean && <div className="card" style={{ padding: '10px 14px', fontSize: 17, fontWeight: 800, color: u.dark }}>يعني: {s.mean}</div>}
    </div>
  );
}

export default function Practice(p) {
  const K = { pick: Pick, match: Match, order: Order, fill: Fill }[p.s.k];
  return K ? <K {...p} /> : null;
}
