import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useStore } from './store';
import Splash from './screens/Splash';
import Onboard from './screens/Onboard';
import Island from './screens/Island';
import Region from './screens/Region';
import Lesson from './screens/Lesson';
import Album from './screens/Album';
import Games from './screens/Games';
import Stories from './screens/Stories';
import Parent from './screens/Parent';
import { TabBar } from './components/ui';
import { unlockAudio } from './lib/sound';
import { hush } from './lib/voice';

// تنقّل بسيط بالـ hash عشان زرار الرجوع في الموبايل يشتغل
const parse = () => { const [name, ...rest] = (location.hash.slice(2) || '').split('/'); return { name: name || 'splash', arg: rest.join('/') }; };

export default function App() {
  const [route, setRoute] = useState(parse);
  const profile = useStore((s) => s.profile);
  const motionOn = useStore((s) => s.settings.motion);
  useEffect(() => { const f = () => { hush(); setRoute(parse()); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  useEffect(() => { const f = () => unlockAudio(); addEventListener('pointerdown', f, { once: true }); }, []);
  const go = (name, arg) => { location.hash = '#/' + name + (arg ? '/' + arg : ''); };
  const back = () => (history.length > 1 ? history.back() : go('island'));

  let { name, arg } = route;
  if (!profile && !['splash', 'onboard', 'parent'].includes(name)) name = 'splash';
  const tabs = ['island', 'stories', 'games', 'album'].includes(name);
  const P = { go, back, arg };
  const screens = { splash: Splash, onboard: Onboard, island: Island, region: Region, lesson: Lesson, album: Album, games: Games, stories: Stories, parent: Parent };
  const S = screens[name] || Island;

  return (
    <MotionConfig reducedMotion={motionOn ? 'user' : 'always'}>
      <div className={'app' + (motionOn ? '' : ' reduce-motion')}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={name + arg} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.28 }} style={{ position: 'absolute', inset: 0 }}>
            <S {...P} />
          </motion.div>
        </AnimatePresence>
        {tabs && !arg && <TabBar cur={name} go={go} />}
      </div>
    </MotionConfig>
  );
}
