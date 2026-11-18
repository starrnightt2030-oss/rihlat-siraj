import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Siraj from './Siraj';
import { Btn } from './ui';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';
import { STICKER_NAMES, SPARKS } from '../data/content';

export function Confetti({ n = 40 }) {
  const colors = ['#FFC233', '#1EC8BE', '#FF7B6B', '#9D7CFF', '#4FCB6B', '#FF8FC8', '#3FA9F5'];
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = Math.random() * 100, d = 1.8 + Math.random() * 1.6, s = 8 + Math.random() * 10, r = Math.random() * 720 - 360;
        return <motion.span key={i} initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }} animate={{ y: 900, x: (Math.random() - 0.5) * 120, rotate: r, opacity: [1, 1, 0.2] }} transition={{ duration: d, delay: Math.random() * 0.6, ease: 'easeIn' }}
          style={{ position: 'absolute', top: 0, left: `${x}%`, width: s, height: s * (i % 3 ? 0.5 : 1), borderRadius: i % 4 ? 3 : s, background: colors[i % colors.length] }} />;
      })}
    </div>
  );
}

export default function Reward({ result, region, onHome, onRegion, title }) {
  const { stars, gain, light, sticker, spark } = result;
  const sp = spark && SPARKS.find((s) => s.id === spark);
  useEffect(() => {
    sfx.good(); say(`برافو! نوّرت ${region?.name || 'الجزيرة'}`);
    [0, 1, 2].forEach((k) => k < stars && setTimeout(() => sfx.star(k), 500 + k * 350));
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-label="مكافأة"
      style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'radial-gradient(circle at 50% 35%, #FFF6CC 0%, #FFE38A 45%, #FFC75A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, textAlign: 'center' }}>
      <motion.div aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', width: 700, height: 700, top: '50%', left: '50%', marginTop: -420, marginLeft: -350, background: 'repeating-conic-gradient(rgba(255,255,255,.35) 0 10deg, transparent 10deg 20deg)', borderRadius: '50%' }} />
      <Confetti />
      <h1 style={{ position: 'relative', fontSize: 40, fontWeight: 800, color: '#fff', WebkitTextStroke: '6px #E39400', paintOrder: 'stroke fill' }}>{title || 'برافو عليك!'}</h1>
      <div style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'flex-end' }}>
        {[0, 1, 2].map((k) => (
          <motion.img key={k} src={A(k < stars ? 'rewards/star' : 'rewards/star_empty')} alt="" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5 + k * 0.35, type: 'spring', stiffness: 260, damping: 11 }}
            style={{ width: k === 1 ? 96 : 76, height: k === 1 ? 96 : 76, marginBottom: k === 1 ? 14 : 0, opacity: k < stars ? 1 : 0.45 }} />
        ))}
      </div>
      <Siraj pose="party" size={170} style={{ position: 'relative' }} />
      <div style={{ position: 'relative', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {gain > 0 && <Gift img="rewards/star" t={`+${ar(gain)} نجوم`} d={1.4} />}
        {light > 0 && <Gift img="rewards/jar" t={`+${ar(light)} نور`} d={1.6} />}
        {sticker && <Gift img={'stickers/' + sticker} t={'ملصق ' + STICKER_NAMES[sticker]} d={1.8} big />}
        {sp && <Gift img={'characters/sparks/' + sp.id} t={'شرارة ' + sp.name} d={2} big />}
      </div>
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
        {onRegion && <Btn className="block" tone="teal" onClick={onRegion} sound="pop">كمّل في {region?.name}</Btn>}
        <Btn className="block" tone="white" onClick={onHome} sound="tap">ارجع لرحلتي</Btn>
      </div>
    </motion.div>
  );
}

function Gift({ img, t, d, big }) {
  return (
    <motion.div initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ delay: d, type: 'spring', stiffness: 240, damping: 14 }}
      style={{ background: '#fff', borderRadius: 22, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 5px 0 rgba(227,148,0,.35)', fontWeight: 800, fontSize: 17 }}>
      <img src={A(img)} alt="" style={{ width: big ? 54 : 38, height: big ? 54 : 38, objectFit: 'contain' }} />{t}
    </motion.div>
  );
}
