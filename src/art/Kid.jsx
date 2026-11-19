// رسومات الطفل في أوضاع الصلاة والوضوء: ستايل مسطّح ناعم، من غير ملامح وش، ولد أو بنت
// كل جزء "كبسولة" بخط سميك ليه حدّ أغمق، فالشكل يطلع كرتوني ومتّسق في كل الأوضاع

export const PAL = {
  boy: { robe: '#FFFFFF', robeLine: '#9DB2D3', cap: '#FFFFFF', capBand: '#7FC1EA', rug: '#3DB57A', rugLine: '#2A8F5E', rugTrim: '#FFD66B' },
  girl: { robe: '#FFB4CF', robeLine: '#E27CA3', cap: '#C7B1F6', capBand: '#9C80E6', rug: '#F58FB8', rugLine: '#D9628F', rugTrim: '#FFE7A0' },
};
const SKIN = '#F5CFB0', SKIN_L = '#C9977A', HAIR = '#5B3A24';

// خط كبسولة: حدّ غامق تحته ولون فوقه
const Cap = ({ pts, w, c, l }) => {
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  return (<g><path d={d} fill="none" stroke={l} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>);
};
const Hand = ({ at, r = 7 }) => <circle cx={at[0]} cy={at[1]} r={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />;

// الراس: ولد بطاقية بيضا، بنت بخمار. الوش من غير ملامح
function Head({ at, g, dir = -1, tilt = 0, r = 21 }) {
  const P = PAL[g];
  const [x, y] = at;
  if (g === 'girl') return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <path d={`M${x - r - 6} ${y + 4} C ${x - r - 8} ${y - r - 14}, ${x + r + 8} ${y - r - 14}, ${x + r + 6} ${y + 4} L ${x + r + 12} ${y + r + 16} L ${x - r - 12} ${y + r + 16} Z`} fill={P.cap} stroke={P.capBand} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx={x + dir * 5} cy={y + 2} rx={r * 0.72} ry={r * 0.8} fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
      <circle cx={x + dir * 5 + dir * r * 0.32} cy={y + 8} r="4" fill="#FF9EB0" opacity=".55" />
    </g>
  );
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
      <path d={`M${x - dir * r * 0.95} ${y - 2} C ${x - dir * r} ${y - r * 0.7}, ${x - dir * r * 0.2} ${y - r * 0.95}, ${x + dir * r * 0.2} ${y - r * 0.85} L ${x - dir * r * 0.6} ${y - 6} Z`} fill={HAIR} />
      <path d={`M${x - r - 2} ${y - 6} C ${x - r} ${y - r - 12}, ${x + r} ${y - r - 12}, ${x + r + 2} ${y - 6} Z`} fill={P.cap} stroke={P.robeLine} strokeWidth="2.5" />
      <path d={`M${x - r} ${y - 10} Q ${x} ${y - 15} ${x + r} ${y - 10}`} stroke={P.capBand} strokeWidth="3" fill="none" />
      <circle cx={x + dir * r * 0.55} cy={y + 8} r="4" fill="#FF9EB0" opacity=".55" />
    </g>
  );
}

function Rug({ g, x = 30, w = 150 }) {
  const P = PAL[g];
  return (<g>
    <rect x={x} y="206" width={w} height="14" rx="6" fill={P.rug} stroke={P.rugLine} strokeWidth="2.5" />
    <path d={`M${x + 8} 213 H${x + w - 8}`} stroke={P.rugTrim} strokeWidth="2" strokeDasharray="6 5" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${x + w + 1} ${208 + i * 3} h6`} stroke={P.rugLine} strokeWidth="1.6" strokeLinecap="round" />)}
  </g>);
}

// ثوب واقف: شكل جرس من الكتف للكعب
const Robe = ({ g, top, bottom, x = 100, wTop = 22, wBot = 30 }) => {
  const P = PAL[g];
  return <path d={`M${x - wTop} ${top} Q ${x} ${top - 10} ${x + wTop} ${top} L ${x + wBot} ${bottom} Q ${x} ${bottom + 6} ${x - wBot} ${bottom} Z`} fill={P.robe} stroke={P.robeLine} strokeWidth="3" strokeLinejoin="round" />;
};
const Feet = ({ y = 206, xs = [84, 104], dir = -1 }) => xs.map((x, i) => <ellipse key={i} cx={x + dir * 2} cy={y - 2} rx="10" ry="5.5" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />);

// الوضعيات (منظر جانبي والوش ناحية الشمال = القبلة)
const POSES = {
  // واقف وإيديه جنبه
  stand: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[98, 58]} g={g} />
    <Cap pts={[[96, 92], [90, 128], [92, 150]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[92, 154]} />
  </g>),
  // نية: واقف وإيده على قلبه
  niyya: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[98, 58]} g={g} />
    <Cap pts={[[98, 92], [106, 118], [90, 112]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[88, 111]} />
    <path d="M60 70 c-4-6 -12-2 -9 4 l9 8 9-8 c3-6 -5-10 -9-4z" fill="#FF7E9D" />
  </g>),
  // تكبيرة الإحرام: الإيدين جنب الودان
  takbir: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[100, 58]} g={g} />
    <Cap pts={[[96, 94], [80, 100], [80, 66]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[80, 61]} r={8} />
    <Cap pts={[[102, 94], [118, 100], [116, 66]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[116, 61]} r={8} />
  </g>),
  // القيام والقراءة: اليمين على الشمال فوق الصدر
  qiyam: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[98, 58]} g={g} />
    <Cap pts={[[102, 94], [108, 120], [86, 116]]} w={13} c={P.robe} l={P.robeLine} />
    <Cap pts={[[96, 94], [98, 122], [84, 118]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[82, 117]} />
  </g>),
  // الركوع: الضهر مستوي والإيدين على الركب
  ruku: (g, P) => (<g>
    <Cap pts={[[124, 132], [124, 170], [124, 202]]} w={24} c={P.robe} l={P.robeLine} />
    <Feet xs={[118]} />
    <Cap pts={[[126, 132], [76, 128]]} w={34} c={P.robe} l={P.robeLine} />
    <Cap pts={[[82, 134], [104, 160], [118, 170]]} w={12} c={P.robe} l={P.robeLine} /><Hand at={[120, 170]} />
    <Head at={[54, 132]} g={g} tilt={-80} />
  </g>),
  // الرفع من الركوع: واقف والإيدين لتحت
  itidal: (g, P) => POSES.stand(g, P),
  // السجود: الجبهة والمناخير والإيدين والركب وصوابع الرجلين على الأرض
  sujud: (g, P) => (<g>
    <Cap pts={[[150, 202], [122, 202], [134, 170]]} w={22} c={P.robe} l={P.robeLine} />
    <Cap pts={[[136, 168], [84, 186]]} w={32} c={P.robe} l={P.robeLine} />
    <ellipse cx="156" cy="203" rx="7" ry="4.5" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <Cap pts={[[92, 186], [80, 200], [70, 204]]} w={11} c={P.robe} l={P.robeLine} /><ellipse cx="66" cy="204" rx="9" ry="4.5" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <Head at={[56, 188]} g={g} tilt={-110} r={19} />
  </g>),
  // الجلوس بين السجدتين: قاعد على رجله والإيدين على الفخذ
  julus: (g, P) => (<g>
    <Cap pts={[[78, 200], [124, 202]]} w={22} c={P.robe} l={P.robeLine} />
    <ellipse cx="134" cy="202" rx="8" ry="5" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <Cap pts={[[118, 188], [114, 112]]} w={34} c={P.robe} l={P.robeLine} />
    <Cap pts={[[114, 118], [104, 150], [84, 182]]} w={12} c={P.robe} l={P.robeLine} /><Hand at={[82, 184]} />
    <Head at={[112, 84]} g={g} />
  </g>),
  // التشهد: زي الجلوس والسبابة مرفوعة
  tashahhud: (g, P) => (<g>
    {POSES.julus(g, P)}
    <path d="M80 182 L72 166" stroke={SKIN_L} strokeWidth="7" strokeLinecap="round" /><path d="M80 182 L72 166" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
  </g>),
  // التسليم: قاعد والراس ملفوفة يمين وشمال
  taslim: (g, P) => (<g>
    <Cap pts={[[78, 200], [124, 202]]} w={22} c={P.robe} l={P.robeLine} />
    <ellipse cx="134" cy="202" rx="8" ry="5" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <Cap pts={[[118, 188], [114, 112]]} w={34} c={P.robe} l={P.robeLine} />
    <Cap pts={[[114, 118], [104, 150], [84, 182]]} w={12} c={P.robe} l={P.robeLine} /><Hand at={[82, 184]} />
    <Head at={[112, 84]} g={g} dir={1} />
    <path d="M146 70 q14 12 0 26 M156 62 q22 20 0 42" fill="none" stroke="#7FC1EA" strokeWidth="3" strokeLinecap="round" />
    <path d="M78 70 q-14 12 0 26 M68 62 q-22 20 0 42" fill="none" stroke="#7FC1EA" strokeWidth="3" strokeLinecap="round" />
  </g>),
  // دعاء: الإيدين مرفوعين
  dua: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[100, 58]} g={g} tilt={-8} />
    <Cap pts={[[96, 94], [84, 112], [80, 92]]} w={13} c={P.robe} l={P.robeLine} />
    <path d="M70 92 q10 -16 22 0 q-11 8 -22 0z" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
  </g>),
  // الشهادة: السبابة لفوق
  shahada: (g, P) => (<g>
    <Robe g={g} top={86} bottom={202} />
    <Feet />
    <Head at={[100, 58]} g={g} />
    <Cap pts={[[96, 94], [80, 104], [76, 76]]} w={13} c={P.robe} l={P.robeLine} /><Hand at={[76, 72]} r={7} />
    <path d="M76 68 L76 52" stroke={SKIN_L} strokeWidth="7" strokeLinecap="round" /><path d="M76 68 L76 52" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
  </g>),
};

export const POSE_NAMES = { niyya: 'النية', takbir: 'تكبيرة الإحرام', qiyam: 'القيام', ruku: 'الركوع', itidal: 'الرفع من الركوع', sujud: 'السجود', julus: 'الجلوس بين السجدتين', tashahhud: 'التشهد', taslim: 'التسليم', stand: 'الوقوف', dua: 'الدعاء', shahada: 'الشهادة' };

export default function Kid({ pose = 'stand', g = 'boy', rug = true, size = 200, bg = true, label }) {
  const P = PAL[g] || PAL.boy;
  const draw = POSES[pose] || POSES.stand;
  return (
    <svg viewBox="0 0 200 230" width={size} height={size * 1.15} role="img" aria-label={label || POSE_NAMES[pose] || ''} style={{ display: 'block', maxWidth: '100%' }}>
      {bg && <><circle cx="100" cy="120" r="96" fill={g === 'girl' ? '#FFF0F6' : '#EEF6FF'} /><circle cx="160" cy="44" r="5" fill="#FFD66B" /><circle cx="36" cy="150" r="4" fill="#FFD66B" opacity=".7" /></>}
      {rug && <Rug g={g} />}
      {draw(g, P)}
    </svg>
  );
}
