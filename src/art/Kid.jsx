// رسومات الطفل في أوضاع الصلاة: منظر جانبي واضح (الوش ناحية الشمال = القبلة)، إيدين بصوابع ورجلين باينين
// من غير ملامح وش. الدراع والرجل البعيدين بلون أغمق شوية عشان العمق يبان
import { SKIN, SKIN_D, SKIN_L, Limb, Chain, Hand, Foot, Head } from './Body';

export const PAL = {
  boy: { robe: '#FFFFFF', robeD: '#DDE6F3', robeLine: '#7F96BC', cap: '#FFFFFF', capBand: '#5AA9E0', capLine: '#7F96BC', rug: '#3DB57A', rugLine: '#2A8F5E', rugTrim: '#FFD66B', bg: '#EAF5FF' },
  girl: { robe: '#FFB4CF', robeD: '#F393B8', robeLine: '#C9568A', cap: '#C9B4F7', capBand: '#9C80E6', capLine: '#8466D6', rug: '#F7A8C8', rugLine: '#D9628F', rugTrim: '#FFE7A0', bg: '#FFF0F6' },
};
const FLOOR = 208;

function Rug({ g, x = 22, w = 160 }) {
  const P = PAL[g];
  return (<g>
    <rect x={x} y={FLOOR - 2} width={w} height="14" rx="5" fill={P.rug} stroke={P.rugLine} strokeWidth="2.4" />
    <path d={`M${x + 8} ${FLOOR + 5} H${x + w - 8}`} stroke={P.rugTrim} strokeWidth="2.2" strokeDasharray="7 5" />
    <path d={`M${x + 6} ${FLOOR + 1} l6 -8 6 8z`} fill={P.rugTrim} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${x + w} ${FLOOR + 1 + i * 3} h6`} stroke={P.rugLine} strokeWidth="1.6" strokeLinecap="round" />)}
  </g>);
}
// إيد في كُم: دراع بلون الهدوم وبعده الرسغ
const Arm = ({ pts, P, back, hand }) => (<g>
  <Chain pts={pts} ws={[7.5, 7, 6]} fill={back ? P.robeD : P.robe} line={P.robeLine} />
  {hand}
</g>);
// ثوب واقف من الجنب
const StandRobe = ({ P }) => (<g>
  <path d="M84 76 Q100 68 116 76 L119 120 L124 196 Q101 203 78 196 L82 120 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.8" strokeLinejoin="round" />
  <path d="M112 82 L115 120 L119 194" stroke={P.robeD} strokeWidth="5" opacity=".7" fill="none" strokeLinecap="round" />
</g>);
const StandFeet = ({ g }) => (g === 'girl'
  ? (<g><Foot at={[92, FLOOR - 1]} s={0.85} fill="#F6E7EE" line="#C9568A" /><path d="M78 196 Q101 204 124 196 L124 201 Q101 209 78 201z" fill={PAL.girl.robe} stroke={PAL.girl.robeLine} strokeWidth="2.4" /></g>)
  : (<g><Foot at={[112, FLOOR - 1]} s={1.05} fill={SKIN_D} /><Foot at={[90, FLOOR - 1]} s={1.05} /></g>));

const stand = (g, P, arms, head = <Head at={[97, 46]} g={g} P={P} />) => (<g>
  {arms.back}
  <StandRobe P={P} />
  <StandFeet g={g} />
  {head}
  {arms.front}
</g>);

const POSES = {
  stand: (g, P) => stand(g, P, {
    back: <Arm P={P} back pts={[[106, 84], [108, 118], [106, 146]]} hand={<Hand at={[106, 150]} ang={90} flip fill={SKIN_D} />} />,
    front: <Arm P={P} pts={[[96, 84], [94, 118], [92, 146]]} hand={<Hand at={[92, 150]} ang={92} />} />,
  }),
  niyya: (g, P) => (<g>
    {stand(g, P, {
      back: <Arm P={P} back pts={[[106, 84], [108, 118], [106, 146]]} hand={<Hand at={[106, 150]} ang={90} flip fill={SKIN_D} />} />,
      front: <Arm P={P} pts={[[96, 84], [102, 112], [88, 102]]} hand={<Hand at={[84, 100]} ang={210} />} />,
    })}
    <path d="M52 52 c-5-8 -15-3 -11 5 l11 10 11-10 c4-8 -6-13 -11-5z" fill="#FF7E9D" />
  </g>),
  takbir: (g, P) => stand(g, P, {
    back: <Arm P={P} back pts={[[106, 84], [92, 100], [86, 64]]} hand={<Hand at={[86, 56]} ang={-92} fill={SKIN_D} flip />} />,
    front: <Arm P={P} pts={[[94, 84], [76, 96], [70, 64]]} hand={<Hand at={[69, 56]} ang={-95} />} />,
  }),
  qiyam: (g, P) => stand(g, P, {
    back: <Arm P={P} back pts={[[105, 84], [108, 116], [88, 110]]} hand={<Hand at={[84, 110]} ang={196} fill={SKIN_D} />} />,
    front: <Arm P={P} pts={[[96, 84], [102, 116], [86, 104]]} hand={<Hand at={[82, 103]} ang={192} />} />,
  }),
  itidal: (g, P) => POSES.stand(g, P),
  ruku: (g, P) => (<g>
    <Arm P={P} back pts={[[90, 124], [112, 146], [132, 158]]} hand={<Hand at={[136, 161]} ang={40} fill={SKIN_D} />} />
    <path d="M76 112 Q112 104 150 112 L156 138 L152 196 Q140 203 126 196 L128 142 Q104 136 80 132 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.8" strokeLinejoin="round" />
    {g === 'girl' ? <Foot at={[136, FLOOR - 1]} s={0.85} fill="#F6E7EE" line="#C9568A" /> : <g><Foot at={[148, FLOOR - 1]} fill={SKIN_D} /><Foot at={[136, FLOOR - 1]} /></g>}
    {g === 'girl' && <path d="M124 194 Q140 202 154 194 L154 200 Q140 208 124 200z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.4" />}
    <Head at={[56, 122]} g={g} P={P} tilt={-80} />
    <Arm P={P} pts={[[86, 126], [106, 150], [126, 160]]} hand={<Hand at={[130, 163]} ang={40} />} />
  </g>),
  sujud: (g, P) => (<g>
    <Arm P={P} back pts={[[96, 178], [110, 192], [84, 202]]} hand={<Hand at={[80, 204]} ang={180} mode="open" fill={SKIN_D} />} />
    <path d="M150 146 Q118 152 84 172 L80 196 Q102 188 116 186 L114 206 L162 206 L162 194 Q158 166 150 146 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.8" strokeLinejoin="round" />
    <Foot at={[166, FLOOR - 1]} s={0.85} toes fill={g === 'girl' ? '#F6E7EE' : SKIN} line={g === 'girl' ? '#C9568A' : SKIN_L} />
    <Head at={[62, 186]} g={g} P={P} tilt={-118} r={21} />
    <Arm P={P} pts={[[90, 180], [104, 196], [76, 204]]} hand={<Hand at={[70, 205]} ang={180} />} />
  </g>),
  julus: (g, P) => (<g>
    <Arm P={P} back pts={[[110, 118], [114, 152], [92, 184]]} hand={<Hand at={[86, 188]} ang={160} fill={SKIN_D} />} />
    <path d="M100 112 Q116 104 128 114 L136 186 Q140 206 126 208 L64 208 Q58 194 74 190 L102 186 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.8" strokeLinejoin="round" />
    <Foot at={[142, FLOOR - 1]} s={0.8} toes fill={g === 'girl' ? '#F6E7EE' : SKIN} line={g === 'girl' ? '#C9568A' : SKIN_L} />
    <Head at={[108, 84]} g={g} P={P} />
    <Arm P={P} pts={[[104, 118], [106, 152], [84, 180]]} hand={<Hand at={[78, 183]} ang={165} />} />
  </g>),
  tashahhud: (g, P) => (<g>
    <Arm P={P} back pts={[[110, 118], [114, 152], [92, 184]]} hand={<Hand at={[86, 188]} ang={160} fill={SKIN_D} />} />
    <path d="M100 112 Q116 104 128 114 L136 186 Q140 206 126 208 L64 208 Q58 194 74 190 L102 186 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="2.8" strokeLinejoin="round" />
    <Foot at={[142, FLOOR - 1]} s={0.8} toes fill={g === 'girl' ? '#F6E7EE' : SKIN} line={g === 'girl' ? '#C9568A' : SKIN_L} />
    <Head at={[108, 84]} g={g} P={P} />
    <Arm P={P} pts={[[104, 118], [106, 152], [86, 172]]} hand={<Hand at={[80, 172]} ang={-60} mode="point" s={1.1} />} />
    <circle cx="70" cy="150" r="9" fill="#FFE07A" opacity=".6" />
  </g>),
  taslim: (g, P) => (<g>
    {POSES.julus(g, P)}
    <path d="M140 66 q16 16 0 32" fill="none" stroke="#5AA9E0" strokeWidth="4" strokeLinecap="round" markerEnd="url(#karr)" />
    <path d="M76 66 q-16 16 0 32" fill="none" stroke="#5AA9E0" strokeWidth="4" strokeLinecap="round" markerEnd="url(#karr)" />
    <text x="152" y="60" textAnchor="middle" fontFamily="'Baloo Bhaijaan 2'" fontSize="12" fontWeight="800" fill="#2E7DB8">يمين</text>
    <text x="64" y="60" textAnchor="middle" fontFamily="'Baloo Bhaijaan 2'" fontSize="12" fontWeight="800" fill="#2E7DB8">شمال</text>
  </g>),
  dua: (g, P) => stand(g, P, {
    back: <Arm P={P} back pts={[[105, 84], [100, 112], [84, 102]]} hand={<Hand at={[78, 98]} ang={-110} mode="open" fill={SKIN_D} />} />,
    front: <Arm P={P} pts={[[96, 84], [90, 114], [72, 104]]} hand={<Hand at={[66, 100]} ang={-120} mode="open" />} />,
  }, <Head at={[97, 46]} g={g} P={P} tilt={-6} />),
  shahada: (g, P) => stand(g, P, {
    back: <Arm P={P} back pts={[[106, 84], [108, 118], [106, 146]]} hand={<Hand at={[106, 150]} ang={90} flip fill={SKIN_D} />} />,
    front: <Arm P={P} pts={[[96, 84], [84, 108], [80, 84]]} hand={<Hand at={[80, 78]} ang={-90} mode="point" />} />,
  }),
};

export const POSE_NAMES = { niyya: 'النية', takbir: 'تكبيرة الإحرام', qiyam: 'القيام', ruku: 'الركوع', itidal: 'الرفع من الركوع', sujud: 'السجود', julus: 'الجلوس بين السجدتين', tashahhud: 'التشهد', taslim: 'التسليم', stand: 'الوقوف', dua: 'الدعاء', shahada: 'الشهادة' };

export default function Kid({ pose = 'stand', g = 'boy', rug = true, size = 200, bg = true, label }) {
  const P = PAL[g] || PAL.boy;
  const draw = POSES[pose] || POSES.stand;
  return (
    <svg viewBox="0 0 200 230" width={size} height={size * 1.15} role="img" aria-label={label || POSE_NAMES[pose] || ''} style={{ display: 'block', maxWidth: '100%' }}>
      <defs><marker id="karr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#5AA9E0" /></marker></defs>
      {bg && <><circle cx="100" cy="118" r="98" fill={P.bg} /><path d="M18 40 a10 10 0 1 0 8 16 8 8 0 0 1 -8 -16z" fill="#FFD66B" opacity=".8" /><circle cx="176" cy="60" r="3" fill="#FFD66B" /><circle cx="168" cy="40" r="2" fill="#FFD66B" /></>}
      {rug && <Rug g={g} />}
      {draw(g, P)}
    </svg>
  );
}
