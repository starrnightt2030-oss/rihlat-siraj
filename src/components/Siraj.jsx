import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';

const POSE = {
  wave: 'characters/siraj/wave', point: 'characters/siraj/point', jump: 'characters/siraj/jump', fly: 'characters/siraj/fly',
  run: 'characters/siraj/run', read: 'characters/siraj/read', pray: 'characters/siraj/pray', party: 'characters/siraj/celebrate',
  oops: 'characters/siraj/oops', sleep: 'characters/siraj/sleep_lantern', hero: 'characters/siraj/hero_wave', front: 'characters/siraj/turn_front',
  happy: 'characters/siraj/face_happy', think: 'characters/siraj/face_think', wow: 'characters/siraj/face_wow', proud: 'characters/siraj/face_proud', laugh: 'characters/siraj/face_laugh',
};
export const BUDDY = {
  siraj: { name: 'سراج', img: 'characters/siraj/wave', face: 'characters/siraj/face_happy' },
  bashir: { name: 'بشير', img: 'characters/bashir/hero', face: 'characters/bashir/face_happy' },
  mishmish: { name: 'مشمش', img: 'characters/mishmish/hero', face: 'characters/mishmish/face_happy' },
};

// سراج "حي": طفو هادي وتوهّج، ولما الطفل يلمسه بينط ويلمع
export default function Siraj({ pose = 'wave', size = 160, still = false, onTap, style, glow = true }) {
  const ctl = useAnimation();
  const [spark, setSpark] = useState(0);
  const tap = async () => {
    sfx.sparkle(); setSpark((n) => n + 1);
    onTap?.();
    await ctl.start({ scaleY: [1, 0.85, 1.12, 1], scaleX: [1, 1.12, 0.92, 1], y: [0, 6, -26, 0], transition: { duration: 0.6 } });
  };
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <div className={still ? '' : 'float'} style={{ width: '100%', height: '100%' }}>
        <motion.img src={A(POSE[pose] || pose)} alt="سراج" draggable="false" animate={ctl} onClick={tap}
          className={glow ? 'glow' : ''} style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer', transformOrigin: '50% 100%' }} />
      </div>
      {spark > 0 && <Sparks key={spark} />}
    </div>
  );
}

export function Sparks({ n = 9, color = '#FFC233' }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2, r = 70 + Math.random() * 30;
        return (
          <motion.svg key={i} width="18" height="18" viewBox="0 0 24 24" style={{ position: 'absolute', left: '50%', top: '45%', marginLeft: -9 }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }} animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r, scale: [0.4, 1.3, 0], opacity: [1, 1, 0] }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={i % 3 ? color : '#fff'} />
          </motion.svg>
        );
      })}
    </div>
  );
}
