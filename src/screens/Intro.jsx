// انترو كل مرة التطبيق يتفتح: ليل هادي ← الفانوس ينوّر ← سراج يطلع ويرحّب بالطفل بصوته
// أول مرة: «يلا نتعرّف» — بعد كده: ترحيب باسم الطفل و«يلا نكمّل»
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../components/Logo';
import { Btn, Icon, I } from '../components/ui';
import { A } from '../lib/asset';
import { sfx, unlockAudio } from '../lib/sound';
import { say } from '../lib/voice';

const STARS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 60, s: 2 + (i % 3), d: (i % 7) * 0.3 }));
export const WELCOME = {
  first: 'السلام عليكم! أهلًا بيك في رحلة سراج… يلا نتعرّف!',
  boy: 'أهلًا يا بطل! وحشتني… يلا نكمّل رحلتنا',
  girl: 'أهلًا يا بطلة! وحشتيني… يلا نكمّل رحلتنا',
};
const hello = () => { const h = new Date().getHours(); return h >= 4 && h < 12 ? 'صباح النور' : h < 17 ? 'نهارك سعيد' : 'مساء النور'; };

export default function Intro({ onDone, profile }) {
  const back = !!profile;
  const [t, setT] = useState(0); // 0 ليل، 1 الفانوس بينوّر، 2 سراج طلع، 3 الاسم والزرار
  const line = !back ? WELCOME.first : profile.gender === 'girl' ? WELCOME.girl : WELCOME.boy;
  useEffect(() => {
    const sp = back ? 0.6 : 1;
    const ids = [
      setTimeout(() => setT(1), 800 * sp),
      setTimeout(() => { setT(2); sfx.reveal(); }, 2000 * sp),
      setTimeout(() => say(line), 2000 * sp + 450),
      setTimeout(() => setT(3), 2900 * sp),
    ];
    return () => ids.forEach(clearTimeout);
  }, []);
  const go = () => { unlockAudio?.(); sfx.whoosh(); onDone(); };
  const skip = () => { if (t < 2) { sfx.reveal(); say(line); } setT(3); };
  const day = t >= 2;
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }} onPointerDown={() => unlockAudio?.()}>
      <motion.div animate={{ background: day ? 'linear-gradient(180deg,#8FD3FF 0%,#CFEFFF 45%,#FFF6DD 100%)' : 'linear-gradient(180deg,#1E2A5A 0%,#33427F 60%,#5B5FA0 100%)' }} transition={{ duration: 1.2 }} style={{ position: 'absolute', inset: 0 }} />
      <AnimatePresence>{!day && STARS.map((st, i) => (
        <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.2, 1, 0.2] }} exit={{ opacity: 0 }} transition={{ repeat: Infinity, duration: 2, delay: st.d }}
          style={{ position: 'absolute', left: st.x + '%', top: st.y + '%', width: st.s, height: st.s, borderRadius: 4, background: '#fff' }} />
      ))}</AnimatePresence>
      {day && [0, 1, 2].map((i) => (
        <motion.div key={i} initial={{ x: -200 }} animate={{ x: 500 }} transition={{ duration: 22 + i * 6, repeat: Infinity, ease: 'linear', delay: -i * 7 }}
          style={{ position: 'absolute', top: 60 + i * 70, width: 110 - i * 15, height: 40 - i * 5, borderRadius: 30, background: '#fff', opacity: 0.85 }} />
      ))}
      <motion.div animate={{ scale: t >= 1 ? [1, 1.6, 2.4] : 0.3, opacity: t >= 1 ? [0, 0.9, day ? 0.35 : 0.9] : 0 }} transition={{ duration: 1.2 }}
        style={{ position: 'absolute', top: '30%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, #FFE9A0 0%, #FFD25A55 45%, transparent 70%)' }} />
      <div style={{ position: 'relative', height: 320, width: '100%', display: 'grid', placeItems: 'center' }}>
        <AnimatePresence mode="wait">
          {t < 2 ? (
            <motion.img key="lan" src={A(t === 0 ? 'characters/lantern/closed' : 'characters/lantern/lit')} alt="" initial={{ y: 40, opacity: 0 }} animate={{ y: [0, -8, 0], opacity: 1, rotate: [-3, 3, -3] }} exit={{ scale: 1.4, opacity: 0 }} transition={{ y: { repeat: Infinity, duration: 2.4 }, rotate: { repeat: Infinity, duration: 2.4 }, opacity: { duration: 0.6 } }}
              style={{ width: 150, filter: t === 1 ? 'drop-shadow(0 0 30px #FFD25A)' : 'none' }} />
          ) : (
            <motion.div key="sir" initial={{ scale: 0.2, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 10 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 16 }} className="bubble tail-b" style={{ fontSize: 20, marginBottom: 8, textAlign: 'center', lineHeight: 1.5 }}>
                {back ? <>{hello()} يا <b style={{ color: '#E07F1E' }}>{profile.name}</b>! 👋<br />{profile.gender === 'girl' ? 'وحشتيني' : 'وحشتني'}… يلا نكمّل رحلتنا</> : <>السلام عليكم! 👋<br />أهلًا بيك في رحلة سراج</>}
              </motion.div>
              <motion.img src={A('characters/siraj/wave')} alt="سراج" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.6 }} style={{ width: back ? 180 : 200, filter: 'drop-shadow(0 0 22px #FFD25A99)' }} />
            </motion.div>
          )}
        </AnimatePresence>
        {t === 2 && Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 150, opacity: 0, scale: 0.4 }} transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ position: 'absolute', width: 14, height: 14, borderRadius: 7, background: i % 2 ? '#FFD25A' : '#FF9EC1' }} />;
        })}
      </div>
      <AnimatePresence>
        {t >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', padding: '0 20px' }}>
            <Logo size={back ? 50 : 62} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#2B5BA8', background: '#ffffffcc', padding: '2px 16px', borderRadius: 16 }}>مغامرة النور للأطفال</span>
            <Btn className="block pulse" onClick={go} sound="pop" style={{ marginTop: 14, fontSize: 25, minHeight: 66 }}><Icon d={I.play} size={24} /> {back ? 'يلا نكمّل' : 'يلا نتعرّف!'}</Btn>
          </motion.div>
        )}
      </AnimatePresence>
      {t < 3 && <button type="button" onClick={skip} style={{ position: 'absolute', top: 'calc(var(--safe-top, 0px) + 16px)', left: 16, border: 0, borderRadius: 14, padding: '4px 14px', background: '#ffffff33', color: '#fff', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>تخطّي</button>}
      <div style={{ position: 'absolute', bottom: 'calc(var(--safe-bottom) + 10px)', fontSize: 12, fontWeight: 700, color: day ? '#5D6CA0' : '#ffffffaa' }}>تصميم وتطوير Mohamed Eldawly</div>
    </div>
  );
}
