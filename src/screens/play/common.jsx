// أدوات مشتركة لألعاب «ألعب وأتعلّم»: رأس الشاشة، لوحة الفوز، خلط، وصور التطبيق اللي الألعاب بتستخدمها
import { motion } from 'framer-motion';
import Sky from '../../components/Sky';
import Siraj from '../../components/Siraj';
import { Confetti } from '../../components/Reward';
import { Btn, Bubble, IconBtn, I, HomeBtn } from '../../components/ui';
import { A, ar } from '../../lib/asset';

// العرض المتاح جوه الشاشة (من غير الـ padding)
export const innerW = (el) => { if (!el) return 360; const cs = getComputedStyle(el); return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); };
export const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

// صور شفافة (ستيكرات) بأسمائها، للظلال والحاجات المستخبية والعد والحاجة الغريبة
export const THINGS = [
  { id: 'camel', src: 'stickers/camel', n: 'الجمل', g: 'animal' }, { id: 'whale', src: 'stickers/whale', n: 'الحوت', g: 'animal' },
  { id: 'hoopoe', src: 'stickers/hoopoe', n: 'الهدهد', g: 'animal' }, { id: 'ant', src: 'stickers/ant', n: 'النملة', g: 'animal' },
  { id: 'kaaba', src: 'stickers/kaaba', n: 'الكعبة', g: 'place' }, { id: 'mosque', src: 'stickers/mosque', n: 'المسجد', g: 'place' },
  { id: 'lighthouse', src: 'stickers/lighthouse', n: 'المنارة', g: 'place' }, { id: 'ship', src: 'stickers/ship', n: 'المركب', g: 'sea' },
  { id: 'ark', src: 'stickers/ark', n: 'سفينة نوح', g: 'sea' }, { id: 'anchor', src: 'stories/yunus/prop_anchor', n: 'المرساة', g: 'sea' },
  { id: 'gourd', src: 'stickers/gourd', n: 'اليقطين', g: 'food' }, { id: 'iftar', src: 'stickers/iftar', n: 'الفطار', g: 'food' },
  { id: 'web', src: 'stickers/web', n: 'بيت العنكبوت', g: 'thing' }, { id: 'chest', src: 'rewards/chest', n: 'الكنز', g: 'thing' },
  { id: 'jar', src: 'rewards/jar', n: 'الجرّة', g: 'thing' }, { id: 'trophy', src: 'rewards/trophy', n: 'الكاس', g: 'thing' },
  { id: 'star', src: 'rewards/star', n: 'النجمة', g: 'sky' }, { id: 'sun', src: 'stories/yunus/sky_day', n: 'الشمس', g: 'sky' },
  { id: 'barrels', src: 'stories/yunus/prop_barrels', n: 'البراميل', g: 'thing' }, { id: 'crates', src: 'stories/yunus/prop_crates', n: 'الصناديق', g: 'thing' },
  { id: 'medal', src: 'rewards/medal_gold', n: 'الميدالية', g: 'thing' },
  { id: 'siraj', src: 'characters/siraj/wave', n: 'سراج', g: 'friend' }, { id: 'bashir', src: 'characters/bashir/face_happy', n: 'بشير', g: 'friend' },
];
export const thing = (id) => THINGS.find((t) => t.id === id);

// مشاهد كبيرة من رسومات التطبيق (للبازل والاختلافات والحاجات المستخبية)
export const SCENES = [
  { id: 'garden', src: 'games/puzzles/garden', t: 'البستان' }, { id: 'harbor', src: 'games/puzzles/harbor', t: 'الميناء' },
  { id: 'hajj', src: 'lessons/islam-pillars/hajj', t: 'الحج' }, { id: 'salah', src: 'lessons/islam-pillars/salah', t: 'الصلاة' },
  { id: 'sawm', src: 'lessons/islam-pillars/sawm', t: 'الفطار في رمضان' }, { id: 'shahada', src: 'lessons/islam-pillars/shahada', t: 'أصحاب' },
  { id: 'zakat', src: 'lessons/islam-pillars/zakat', t: 'الصدقة' }, { id: 'kids', src: 'marketing/kids_scene', t: 'سراج والأصحاب' },
];
export const scene = (id) => SCENES.find((s) => s.id === id);
export { A, ar };

export function Head({ title, sub, back, right, tone = 'lilac' }) {
  return (
    <>
      <Sky tone={tone} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>{title}</h1>
          {sub && <div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{sub}</div>}
        </div>
        {right}
        <HomeBtn />
      </div>
    </>
  );
}

export function Chips({ items, value, onPick, c = '#7B5CE0' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {items.map((x) => (
        <button key={x.id} type="button" onClick={() => onPick(x.id)}
          style={{ flex: '1 1 0', minWidth: 64, border: 0, borderRadius: 16, padding: '8px 6px', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer', background: value === x.id ? c : '#fff', color: value === x.id ? '#fff' : c, boxShadow: '0 3px 0 rgba(34,48,106,.12)' }}>
          {x.t}{x.d && <span style={{ display: 'block', fontSize: 11, opacity: 0.85 }}>{x.d}</span>}
        </button>
      ))}
    </div>
  );
}

export function Win({ text, again, more, moreText = 'مستوى أصعب ◀' }) {
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <Confetti n={34} />
      <Siraj pose="party" size={130} />
      <Bubble tail="b">{text}</Bubble>
      <Btn className="block" tone="grape" onClick={again} sound="pop">العب تاني</Btn>
      {more && <Btn className="block" tone="teal" onClick={more} sound="pop">{moreText}</Btn>}
    </motion.div>
  );
}

export const Img = ({ src, style, ...p }) => <img src={A(src)} alt="" draggable={false} style={{ userSelect: 'none', WebkitUserDrag: 'none', ...style }} {...p} />;
export const stat = (t) => <span className="chip" style={{ paddingInline: 12, whiteSpace: 'nowrap' }}>{t}</span>;
export { ar as num };
