import { motion } from 'framer-motion';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { useStore } from '../store';

export const Icon = ({ d, size = 24, color = 'currentColor', w = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
export const I = {
  back: <path d="M9 5l7 7-7 7" />,
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  play: <path d="M16 5L7 12l9 7z" fill="currentColor" />,
  pause: <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />,
  sound: <><path d="M4 10v4h4l5 4V6L8 10z" fill="currentColor" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  drop: <path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z" fill="currentColor" stroke="none" />,
  hand: <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v4c0 4-3 7-7 7h-1c-3 0-4.5-1.5-6-4l-2.5-4a1.6 1.6 0 0 1 2.6-1.8L8 13" />,
  star: <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="currentColor" stroke="none" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" stroke="none" />,
};

export function Btn({ children, tone = '', className = '', onClick, sound = 'tap', ...p }) {
  return <button type="button" className={`btn ${tone} ${className}`} onClick={(e) => { sfx[sound]?.(); onClick?.(e); }} {...p}>{children}</button>;
}
export function IconBtn({ icon, label, onClick, color = '#22306A', sound = 'back', style }) {
  return <button type="button" className="icon-btn" aria-label={label} style={style} onClick={() => { sfx[sound]?.(); onClick?.(); }}><Icon d={icon} color={color} /></button>;
}
export function HomeBtn({ style }) {
  return <IconBtn icon={I.home} label="الرئيسية" sound="tap" color="#E07F1E" style={style} onClick={() => { location.hash = '#/home'; }} />;
}
export function StarsChip() {
  const stars = useStore((s) => s.stars);
  return <span className="chip"><img src={A('rewards/star')} alt="" style={{ width: 30, height: 30 }} />{ar(stars)}</span>;
}
export function LightChip() {
  const light = useStore((s) => s.light);
  return <span className="chip" style={{ borderColor: '#FFE9A8' }}><img src={A('rewards/jar')} alt="" style={{ width: 26, height: 30 }} />{ar(light)}</span>;
}

export function Bubble({ children, tail = 'r', style }) {
  return <motion.div key={typeof children === 'string' ? children : undefined} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 20 }}
    className={'bubble tail-' + tail} style={style}>{children}</motion.div>;
}

const TABS = [
  { id: 'home', name: 'الرئيسية', img: 'games/memory/mosque' },
  { id: 'island', name: 'رحلتي', img: 'characters/siraj/face_happy' },
  { id: 'stories', name: 'الحكايات', img: 'stickers/whale' },
  { id: 'games', name: 'الألعاب', img: 'characters/lantern/lit' },
  { id: 'album', name: 'كنوزي', img: 'rewards/chest' },
];
export function TabBar({ cur, go }) {
  return (
    <nav className="tabbar" aria-label="التنقل">
      {TABS.map((t) => (
        <button key={t.id} className={cur === t.id ? 'on' : ''} aria-current={cur === t.id ? 'page' : undefined} onClick={() => { sfx.tap(); go(t.id); }}>
          <img src={A(t.img)} alt="" />{t.name}
        </button>
      ))}
    </nav>
  );
}
