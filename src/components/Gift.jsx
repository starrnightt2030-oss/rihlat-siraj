import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Btn } from './ui';
import { Confetti } from './Reward';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';
import { giftOfToday } from '../data/gifts';
import { giftLine } from '../data/speech';

// هدية كل يوم: الفانوس بيتفتح ويطلع منه ذكر أو عمل خير صغير
export default function Gift({ onTake }) {
  const g = giftOfToday();
  const [open, setOpen] = useState(false);
  useEffect(() => { say('هدية النهارده!'); }, []);
  const tap = () => { if (open) return; sfx.sparkle(); setOpen(true); setTimeout(() => say(giftLine(g)), 400); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-label="هدية النهارده"
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(38,51,107,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        style={{ position: 'relative', width: '100%', maxWidth: 380, background: 'radial-gradient(circle at 50% 30%, #FFF8DA, #FFE48F 70%)', borderRadius: 34, padding: '22px 18px 18px', textAlign: 'center', overflow: 'hidden', boxShadow: '0 10px 0 #E8B84A' }}>
        {open && <Confetti n={26} />}
        <span className="ribbon" style={{ '--c': '#FF7E6B', fontSize: 18, position: 'relative' }}>هدية النهارده</span>
        {!open ? (
          <motion.button type="button" onClick={tap} aria-label="افتح الهدية" animate={{ rotate: [-4, 4, -4], y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ display: 'block', margin: '14px auto 6px', border: 0, background: 'transparent', cursor: 'pointer' }}>
            <img src={A('rewards/chest')} alt="" style={{ width: 170, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(176,104,20,.3))' }} />
            <div style={{ fontSize: 19, fontWeight: 800, color: '#8A5A10' }}>دوس عشان تفتحها</div>
          </motion.button>
        ) : (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <img src={A('characters/siraj/celebrate')} alt="سراج" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <div className="card" style={{ width: '100%', padding: '14px 12px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#E0563F', lineHeight: 1.2 }}>{g.t}</div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.55, marginTop: 6 }}>{g.sub}</div>
              {g.ref && <div style={{ fontSize: 13, fontWeight: 700, color: '#8C8170', marginTop: 4 }}>{g.ref}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}><img src={A('rewards/jar')} alt="" style={{ width: 26, height: 30, objectFit: 'contain' }} />+٢ نور</div>
            <Btn className="block" tone="leaf" sound="pop" onClick={onTake}>يلا نبدأ اليوم</Btn>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
