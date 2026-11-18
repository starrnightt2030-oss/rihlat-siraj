import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Hill from '../components/Hill';
import Logo from '../components/Logo';
import Siraj from '../components/Siraj';
import { Btn, Bubble, Icon, I } from '../components/ui';
import { useStore } from '../store';
import { say } from '../lib/voice';
import { sfx } from '../lib/sound';
import { A } from '../lib/asset';

export default function Splash({ go }) {
  const profile = useStore((s) => s.profile);
  const line = profile ? `أهلًا يا ${profile.name}! مستنيك نكمّل رحلتنا` : 'بسم الله… يلا ننوّرها!';
  const start = () => { sfx.whoosh(); say(line); go(profile ? 'island' : 'onboard'); };
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
      <Sky />
      <Hill />
      <img src={A('characters/lantern/lit')} alt="" aria-hidden="true" className="float" style={{ position: 'absolute', bottom: 110, left: 18, width: 70, animationDelay: '-1s' }} />
      <img src={A('characters/bashir/fly')} alt="" aria-hidden="true" className="float" style={{ position: 'absolute', top: 150, left: 12, width: 92, animationDelay: '-2s' }} />
      <div style={{ position: 'relative', marginTop: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Logo size={70} />
        <span style={{ fontSize: 20, fontWeight: 700, color: '#2B5BA8', background: 'rgba(255,255,255,.75)', padding: '2px 16px', borderRadius: 16 }}>مغامرة النور للأطفال</span>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Bubble tail="b" style={{ fontSize: 22, marginBottom: 8 }}>{line}</Bubble>
        <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 }}>
          <Siraj pose="wave" size={250} onTap={() => say(line)} />
        </motion.div>
      </div>
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <Btn tone="" className="block pulse" onClick={start} sound="pop" style={{ fontSize: 26, minHeight: 68 }}>
          <Icon d={I.play} size={26} /> {profile ? 'يلا نكمّل' : 'يلا نبدأ الرحلة'}
        </Btn>
        <button type="button" onClick={() => go('parent')} style={{ border: 0, background: 'rgba(255,255,255,.8)', borderRadius: 16, padding: '6px 16px', fontSize: 16, fontWeight: 700, color: '#5D6CA0', cursor: 'pointer' }}>ركن ولي الأمر</button>
      </div>
    </div>
  );
}
