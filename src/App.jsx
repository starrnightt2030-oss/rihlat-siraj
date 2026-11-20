import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useStore } from './store';
import Splash from './screens/Splash';
import Onboard from './screens/Onboard';
import Journey from './screens/Journey';
import Unit from './screens/Unit';
import Card from './screens/Card';
import Album from './screens/Album';
import Games from './screens/Games';
import Stories from './screens/Stories';
import Parent from './screens/Parent';
import Adhkar from './screens/Adhkar';
import Home, { Section } from './screens/Home';
import Hadith from './screens/Hadith';
import Asmaa from './screens/Asmaa';
import Bedtime from './screens/Bedtime';
import Ramadan from './screens/Ramadan';
import Qaida from './screens/Qaida';
import Tuhfa from './screens/Tuhfa';
import Hifz from './screens/Hifz';
import People from './screens/People';
import { TabBar } from './components/ui';
import UpdatePrompt from './components/UpdatePrompt';
import { TurnBadge } from './components/Reciter';
import { BadgeWatcher } from './components/Badges';
import { syncReminders } from './lib/remind';
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
  const back = () => (history.length > 1 ? history.back() : go('home'));

  let { name, arg } = route;
  if (!profile && !['splash', 'onboard', 'parent'].includes(name)) name = 'splash';
  const tabs = ['home', 'island', 'stories', 'games', 'album'].includes(name) || (name === 'adhkar' && !arg);
  const P = { go, back, arg };
  const screens = { splash: Splash, onboard: Onboard, island: Journey, unit: Unit, card: Card, album: Album, games: Games, stories: Stories, parent: Parent, adhkar: Adhkar, home: Home, sec: Section, anbiya25: (p) => <People {...p} kind="anbiya" />, sahaba: (p) => <People {...p} kind="sahaba" />, hadith: Hadith, asmaa: Asmaa, bedtime: Bedtime, ramadan: Ramadan, qaida: Qaida, tuhfa: Tuhfa, hifz: Hifz };
  const S = screens[name] || Journey;

  return (
    <MotionConfig reducedMotion={motionOn ? 'user' : 'always'}>
      <div className={'app' + (motionOn ? '' : ' reduce-motion')}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={name + arg} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.28 }} style={{ position: 'absolute', inset: 0 }}>
            <S {...P} />
          </motion.div>
        </AnimatePresence>
        {tabs && !arg && <TabBar cur={name} go={go} />}
        <UpdatePrompt />
        <TurnBadge />
        <BadgeWatcher />
      </div>
    </MotionConfig>
  );
}
