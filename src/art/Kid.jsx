// رسومات الطفل في أوضاع الصلاة: منظر جانبي واضح (الوش ناحية الشمال = القبلة)، إيدين بصوابع ورجلين باينين
// من غير ملامح وش. الدراع والرجل البعيدين بلون أغمق شوية عشان العمق يبان
import { SKIN, SKIN_D, SKIN_L, Chain, Foot } from './Body';
import { Hand as WHand, SK } from './Wudu';
// إيد واقعية (نفس إيد رسومات الوضوء) بمقاس الطفل هنا
const Hand = ({ at, ang, flip, fill, mode = 'open', s = 1 }) => <WHand at={at} ang={ang} flip={flip} mode={mode} tone={fill === SKIN_D ? 1 : 0} s={0.72 * s} />;
// راس من الجنب بتفاصيل: جمجمة ومناخير وودن وشعر (الولد بطاقية بيضا، البنت بخمار) — من غير ملامح وش
function Head({ at, g, P, tilt = 0, r = 22 }) {
  const [x, y] = at, k = r / 24;
  const tr = `translate(${x} ${y}) rotate(${tilt}) scale(${k})`;
  if (g === 'girl') return (<g transform={tr}>
    <path d="M-27 2 C -29 -34, 29 -36, 29 0 C 30 14, 31 22, 33 30 C 20 34, 4 34, -8 30 C -18 24, -26 14, -27 2z" fill="url(#khj)" stroke={P.capLine} strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M-26 -3 C -25 -18, -11 -23, -2 -20 C 2 -6, 0 10, -8 21 C -18 21, -27 11, -26 -3z" fill="url(#ksk)" stroke={SK.line} strokeWidth="2.2" />
    <path d="M-26 2 l-4.5 4.5 l4.5 2" fill={SK.base} stroke={SK.line} strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="-15" cy="9" rx="4.4" ry="3" fill={SK.blush} opacity=".5" />
    <path d="M2 -27 C 16 -20, 22 0, 20 24" fill="none" stroke={P.capLine} strokeWidth="1.8" opacity=".5" />
  </g>);
  return (<g transform={tr}>
    <path d="M-23 2 C -23 -28, 25 -30, 25 0 C 25 19, 13 29, -2 29 C -14 29, -23 19, -23 2z" fill="url(#ksk)" stroke={SK.line} strokeWidth="2.4" />
    <path d="M-23 5 l-5 4.5 l5 2" fill={SK.base} stroke={SK.line} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-12 -14 C -2 -28, 22 -26, 26 -2 C 24 10, 20 16, 15 20 C 14 6, 8 -6, -2 -9 C -7 -11, -11 -11, -12 -14z" fill="#3B2416" />
    <path d="M5 3 C 12 1, 14 12, 6 15" fill={SK.mid} stroke={SK.line} strokeWidth="2" />
    <ellipse cx="-12" cy="12" rx="5" ry="3.4" fill={SK.blush} opacity=".45" />
    <path d="M-24 -8 C -24 -32, 27 -33, 27 -6 C 14 -12, -10 -13, -24 -8z" fill="#fff" stroke={P.robeLine} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M-22 -11 C -8 -16, 12 -16, 26 -9" fill="none" stroke={P.capBand} strokeWidth="2.4" />
  </g>);
}

export const PAL = {
  boy: { robe: 'url(#krb-boy)', robeD: '#D7E2F0', robeLine: '#7F96BC', cap: '#FFFFFF', capBand: '#5AA9E0', capLine: '#7F96BC', rug: '#3DB57A', rugLine: '#2A8F5E', rugTrim: '#FFD66B', bg: '#EAF5FF' },
  girl: { robe: 'url(#krb-girl)', robeD: '#F393B8', robeLine: '#C9568A', cap: '#C9B4F7', capBand: '#9C80E6', capLine: '#8466D6', rug: '#F7A8C8', rugLine: '#D9628F', rugTrim: '#FFE7A0', bg: '#FFF0F6' },
};
const FLOOR = 208;

function Rug({ g, x = 22, w = 160 }) {
  const P = PAL[g];
  return (<g>
    <rect x={x} y={FLOOR - 2} width={w} height="15" rx="4" fill={P.rug} stroke={P.rugLine} strokeWidth="2.4" />
    <rect x={x + 4} y={FLOOR + 1} width={w - 8} height="9" rx="3" fill="none" stroke={P.rugTrim} strokeWidth="1.6" />
    <path d={`M${x + 10} ${FLOOR + 5.5} H${x + w - 10}`} stroke={P.rugTrim} strokeWidth="2" strokeDasharray="3 4" />
    {[0.25, 0.5, 0.75].map((f) => <path key={f} d={`M${x + w * f - 4} ${FLOOR + 5.5} l4 -3 4 3 -4 3z`} fill={P.rugTrim} />)}
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
      <defs>
        <marker id="karr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#5AA9E0" /></marker>
        <linearGradient id="krb-boy" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="160" y2="0"><stop offset="0" stopColor="#E3EBF6" /><stop offset=".35" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#F7FAFE" /><stop offset="1" stopColor="#D2DDEC" /></linearGradient>
        <linearGradient id="krb-girl" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="160" y2="0"><stop offset="0" stopColor="#F59DC1" /><stop offset=".35" stopColor="#FFC3DA" /><stop offset=".7" stopColor="#FFB4CF" /><stop offset="1" stopColor="#EE8DB4" /></linearGradient>
        <linearGradient id="khj" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D8C8FA" /><stop offset=".6" stopColor="#C2ACF5" /><stop offset="1" stopColor="#A58CE8" /></linearGradient>
        <radialGradient id="ksk" cx="40%" cy="38%" r="70%"><stop offset="0" stopColor="#F8D3B4" /><stop offset=".7" stopColor={SK.base} /><stop offset="1" stopColor={SK.mid} /></radialGradient>
        <linearGradient id="kwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g === 'girl' ? '#FFF4F8' : '#F1F8FF'} /><stop offset="1" stopColor={g === 'girl' ? '#FFE6EF' : '#E1EEFB'} /></linearGradient>
        <clipPath id="kclip"><rect x="2" y="2" width="196" height="226" rx="24" /></clipPath>
      </defs>
      {bg && <g clipPath="url(#kclip)">
        <rect x="0" y="0" width="200" height="230" fill="url(#kwall)" />
        {/* محراب ناحية القبلة (شمال الصورة) */}
        <path d="M8 206 V92 C 8 62, 48 62, 48 92 V206" fill={g === 'girl' ? '#FCE3EC' : '#DCEBFA'} stroke={g === 'girl' ? '#F0B9CE' : '#B9D3EE'} strokeWidth="3" />
        <path d="M16 206 V96 C 16 74, 40 74, 40 96 V206" fill="none" stroke={g === 'girl' ? '#F0B9CE' : '#B9D3EE'} strokeWidth="1.6" strokeDasharray="3 3" />
        {/* شباك نور */}
        <path d="M150 30 h34 v46 h-34z" fill="#FFF8DA" stroke="#E7D7A8" strokeWidth="2.5" /><path d="M167 30 v46 M150 53 h34" stroke="#E7D7A8" strokeWidth="2" />
        <path d="M150 76 L120 206 L200 206 L184 76z" fill="#FFF3C4" opacity=".35" />
        <rect x="0" y={FLOOR + 10} width="200" height="20" fill={g === 'girl' ? '#F4D9E4' : '#D6E3F1'} />
      </g>}
      {rug && <Rug g={g} />}
      {draw(g, P)}
    </svg>
  );
}
