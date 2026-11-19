// مشاهد الحكايات مرسومة: كل مشهد بيوصف الكلام اللي بيتقال، بحركة هادية (موج، مطر، سفينة بتتهز)
// من غير أي تجسيد للأنبياء — بنعبّر بالمكان والرموز والنور
const W = 240, H = 200;
const uid = (() => { let n = 0; return () => 'sa' + (++n); })();

const SkyG = ({ id, a, b }) => <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>;
const Sky = ({ a, b }) => { const id = uid(); return <g><SkyG id={id} a={a} b={b} /><rect width={W} height={H} fill={`url(#${id})`} /></g>; };
const Sun = ({ x, y, r = 18, c = '#FFD25A' }) => <g><circle cx={x} cy={y} r={r * 1.8} fill={c} opacity=".25" /><circle cx={x} cy={y} r={r} fill={c} /></g>;
const Moon = ({ x, y }) => <path d={`M${x} ${y - 16} a16 16 0 1 0 12 28 a13 13 0 1 1 -12 -28z`} fill="#FFE07A" />;
const Star = ({ x, y, s = 1, c = '#fff' }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3z" fill={c}><animate attributeName="opacity" values="1;.3;1" dur={`${2 + s}s`} repeatCount="indefinite" /></path>;
const Cloud = ({ x, y, s = 1, c = '#fff', drift = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 18 c-8 0 -10 -10 -2 -12 c0 -10 14 -12 18 -4 c4 -8 18 -6 18 4 c10 0 10 12 0 12z" fill={c} />
    {drift ? <animateTransform attributeName="transform" type="translate" additive="sum" values={`0 0;${drift} 0;0 0`} dur="12s" repeatCount="indefinite" /> : null}
  </g>
);
const Sea = ({ y = 130, c1 = '#4AA8E8', c2 = '#2E86D1', rough = false }) => {
  const amp = rough ? 9 : 4;
  const wave = (yy, c, dur, dx) => (
    <path d={`M-40 ${yy} ${Array.from({ length: 9 }, (_, i) => `q 20 ${-amp} 40 0`).join(' ')} V${H} H-40z`} fill={c}>
      <animateTransform attributeName="transform" type="translate" values={`0 0;${dx} 0;0 0`} dur={dur} repeatCount="indefinite" />
    </path>);
  return <g>{wave(y, c1, rough ? '2.4s' : '6s', 20)}{wave(y + 14, c2, rough ? '1.8s' : '5s', -20)}</g>;
};
const Ship = ({ x, y, s = 1, tilt = 3, dur = '3s', sail = '#FFF7E6' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g>
      <animateTransform attributeName="transform" type="rotate" values={`${-tilt} 0 0;${tilt} 0 0;${-tilt} 0 0`} dur={dur} repeatCount="indefinite" />
      <path d="M-40 0 H40 L30 18 H-30z" fill="#A8683A" stroke="#6E3E1C" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M-34 6 H34" stroke="#C98B55" strokeWidth="2" />
      {[-22, -10, 2, 14].map((cx) => <circle key={cx} cx={cx} cy={10} r="2.4" fill="#6E3E1C" />)}
      <path d="M-2 0 V-52" stroke="#6E3E1C" strokeWidth="3" />
      <path d="M0 -50 Q26 -30 2 -6z" fill={sail} stroke="#C9B48A" strokeWidth="2" />
      <path d="M-4 -46 Q-24 -28 -4 -8z" fill={sail} stroke="#C9B48A" strokeWidth="2" />
      <path d="M-2 -52 l12 4 -12 4z" fill="#E0563F" />
      {[-30, -16, 18, 28].map((bx, i) => <rect key={i} x={bx - 5} y={-10 + (i % 2) * 2} width={10} height={10 - (i % 2) * 2} rx="2" fill={['#D9A066', '#B98A5A', '#E3B37A', '#C99560'][i]} stroke="#6E3E1C" strokeWidth="1.5" />)}
    </g>
  </g>
);
const Whale = ({ x, y, s = 1, open = false, swim = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g>
      {swim && <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="3.5s" repeatCount="indefinite" />}
      <path d="M-60 0 C -60 -30, 20 -36, 44 -14 C 56 -26, 70 -30, 74 -20 C 66 -14, 64 -6, 70 4 C 60 4, 52 0, 46 -4 C 30 22, -50 26, -60 0z" fill="#3D78C9" stroke="#24528F" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M-58 4 C -40 20, 20 18, 40 0 C 20 10, -36 12, -58 4z" fill="#BFE0F7" />
      {open ? <path d="M-60 -2 L-30 4 L-58 10z" fill="#1B3460" /> : <path d="M-58 4 Q -44 8 -30 5" stroke="#24528F" strokeWidth="2" fill="none" />}
      <circle cx="-36" cy="-10" r="3" fill="#1B3460" />
      <path d="M-10 18 q6 10 16 6" stroke="#24528F" strokeWidth="2.4" fill="#3D78C9" />
      <path d="M-20 -28 q-4 -12 2 -20 M-20 -28 q4 -12 10 -16" stroke="#8AD6F5" strokeWidth="3" fill="none" strokeLinecap="round"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" /></path>
    </g>
  </g>
);
const Houses = ({ y = 150, dim = false, doors = 'open' }) => {
  const H1 = [[16, 46, 40, '#F3D7A7'], [58, 40, 52, '#EFC48E'], [100, 52, 36, '#F6DFB8'], [150, 44, 48, '#EFC48E'], [196, 40, 40, '#F3D7A7']];
  return (<g>
    {H1.map(([x, w, h, c], i) => (<g key={i}>
      <rect x={x} y={y - h} width={w} height={h} fill={dim ? '#C9B79C' : c} stroke="#A57B4E" strokeWidth="2" />
      <rect x={x - 3} y={y - h - 5} width={w + 6} height={6} rx="2" fill={dim ? '#B09A7A' : '#D9A066'} />
      <rect x={x + w / 2 - 6} y={y - 18} width={12} height={18} rx="6" fill={doors === 'closed' ? '#7A4E2A' : '#5A3A20'} />
      <rect x={x + 6} y={y - h + 10} width={9} height={9} rx="2" fill={dim ? '#8E7B62' : '#7FC1EA'} />
      {w > 44 && <rect x={x + w - 15} y={y - h + 10} width={9} height={9} rx="2" fill={dim ? '#8E7B62' : '#7FC1EA'} />}
    </g>))}
    <rect x="0" y={y} width={W} height={H - y} fill="#E8D2A6" />
  </g>);
};
const Rain = ({ n = 40, c = '#BFE6FF' }) => (<g>{Array.from({ length: n }, (_, i) => {
  const x = (i * 37) % W, d = 0.6 + (i % 5) * 0.12;
  return <path key={i} d={`M${x} -10 l-6 16`} stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".8"><animateTransform attributeName="transform" type="translate" values={`0 ${(i * 23) % H};-30 ${H + 20}`} dur={`${d}s`} repeatCount="indefinite" /></path>;
})}</g>);
const Bolt = ({ x, y }) => <path d={`M${x} ${y} l-10 24 h10 l-8 22 l22 -30 h-11 l9 -16z`} fill="#FFE07A"><animate attributeName="opacity" values="0;0;1;0;1;0;0" dur="3s" repeatCount="indefinite" /></path>;
const Mountain = ({ x, w, h, y = 160, c = '#9C8466' }) => <path d={`M${x} ${y} L${x + w * 0.5} ${y - h} L${x + w} ${y}z`} fill={c} />;
const Ark = ({ x, y, s = 1, rock = 2, build = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g>
      {rock ? <animateTransform attributeName="transform" type="rotate" values={`${-rock} 0 0;${rock} 0 0;${-rock} 0 0`} dur="4s" repeatCount="indefinite" /> : null}
      <path d="M-70 -10 H70 L56 20 H-56z" fill={build ? '#C98B55' : '#A8683A'} stroke="#6E3E1C" strokeWidth="2.6" strokeLinejoin="round" />
      {[-60, -40, -20, 0, 20, 40].map((px) => <path key={px} d={`M${px} -10 L${px + 4} 20`} stroke="#6E3E1C" strokeWidth="1.4" opacity=".6" />)}
      {!build && <><rect x="-44" y="-38" width="88" height="28" rx="4" fill="#D9A066" stroke="#6E3E1C" strokeWidth="2.4" /><path d="M-50 -38 L0 -54 L50 -38z" fill="#B5733F" stroke="#6E3E1C" strokeWidth="2.4" strokeLinejoin="round" />
        {[-30, -10, 10, 30].map((wx) => <rect key={wx} x={wx - 5} y="-30" width="10" height="9" rx="2" fill="#FFE9A8" stroke="#6E3E1C" strokeWidth="1.4" />)}</>}
      {build && [-50, -20, 10, 40].map((rx) => <path key={rx} d={`M${rx} -10 V-46`} stroke="#8A5A30" strokeWidth="4" strokeLinecap="round" />)}
    </g>
  </g>
);
const Animal = ({ k, x, y, s = 1 }) => {
  const A = {
    giraffe: <g><path d="M0 0 v-18 h14 v18 M4 -18 l8 -22 h6 l-4 24z" fill="#F5C24A" stroke="#B57E1A" strokeWidth="1.6" /><circle cx="6" cy="-10" r="2" fill="#B57E1A" /><circle cx="14" cy="-30" r="1.6" fill="#B57E1A" /></g>,
    elephant: <g><path d="M-2 0 v-14 c0 -10 26 -10 26 0 v14 h-6 v-6 h-14 v6z" fill="#A9B4C6" stroke="#6E7B90" strokeWidth="1.6" /><path d="M24 -10 c6 2 6 10 2 14" stroke="#6E7B90" strokeWidth="4" fill="none" strokeLinecap="round" /></g>,
    bird: <g><ellipse cx="6" cy="-8" rx="8" ry="6" fill="#FF8FB8" stroke="#C9568A" strokeWidth="1.4" /><path d="M14 -10 l5 2 -5 2z" fill="#F5A623" /><path d="M0 -10 q4 -8 10 -2" fill="#FFB4CF" /></g>,
    sheep: <g><ellipse cx="8" cy="-8" rx="11" ry="7" fill="#fff" stroke="#9DB2D3" strokeWidth="1.6" /><circle cx="19" cy="-10" r="4" fill="#6E7B90" /><path d="M2 -2 v4 M14 -2 v4" stroke="#6E7B90" strokeWidth="2" /></g>,
  }[k];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{A}</g>;
};
const Ant = ({ x, y, s = 1, load, walk = true, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <g>
      {walk && <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur=".5s" repeatCount="indefinite" />}
      {[-6, 0, 6].map((lx) => <path key={lx} d={`M${lx} 0 l-3 6 M${lx} 0 l3 6`} stroke="#3B2416" strokeWidth="1.4" strokeLinecap="round" />)}
      <ellipse cx="-9" cy="-2" rx="6" ry="5" fill="#5A3624" /><ellipse cx="0" cy="-2" rx="4" ry="3.6" fill="#6E4430" /><circle cx="8" cy="-4" r="4.4" fill="#6E4430" />
      <path d="M10 -8 q4 -6 8 -6 M8 -8 q2 -6 6 -8" stroke="#3B2416" strokeWidth="1.3" fill="none" />
      <circle cx="9.5" cy="-5" r="1.2" fill="#fff" />
      {load && <circle cx="-2" cy="-10" r="4" fill={load} stroke="#B57E1A" strokeWidth="1" />}
    </g>
  </g>
);
const AntHill = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-26 0 Q0 -26 26 0z" fill="#C79A63" stroke="#9C7343" strokeWidth="2" /><ellipse cx="0" cy="-6" rx="6" ry="4" fill="#4A2E1C" /></g>;
const Grass = ({ y = 160, c = '#7FD3A0' }) => <g><path d={`M0 ${y} Q60 ${y - 10} 120 ${y} T240 ${y} V${H} H0z`} fill={c} />{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 18 + 6} ${y + 6} l-3 -8 M${i * 18 + 6} ${y + 6} l3 -9`} stroke="#3DB57A" strokeWidth="2" strokeLinecap="round" />)}</g>;
const Light = ({ x, y1 = 0, y2 = 150, w = 50 }) => <path d={`M${x - 8} ${y1} L${x - w} ${y2} H${x + w} L${x + 8} ${y1}z`} fill="#FFF3B0" opacity=".45"><animate attributeName="opacity" values=".3;.55;.3" dur="3s" repeatCount="indefinite" /></path>;
const Txt = ({ x, y, t, c = '#fff', s = 14, f = "'Baloo Bhaijaan 2'" }) => <text x={x} y={y} textAnchor="middle" fontFamily={f} fontSize={s} fontWeight="800" fill={c}>{t}</text>;
const Bubble = ({ x, y, t }) => <g><rect x={x - 46} y={y - 18} width="92" height="28" rx="14" fill="#fff" stroke="#E0A21A" strokeWidth="2" /><path d={`M${x - 6} ${y + 10} l-4 10 12 -10z`} fill="#fff" stroke="#E0A21A" strokeWidth="2" /><Txt x={x} y={y + 2} t={t} c="#B57E1A" s={12} /></g>;
const Banner = ({ x, y }) => <g transform={`translate(${x} ${y})`}><path d="M0 0 V-40" stroke="#6E5A44" strokeWidth="2.4" /><path d="M0 -40 l16 5 -16 5z" fill="#E0563F" /></g>;
const Gourd = ({ x, y }) => (<g transform={`translate(${x} ${y})`}>
  <path d="M-60 0 C -40 -40, 40 -40, 60 0" stroke="#3E9C5E" strokeWidth="5" fill="none" />
  {[[-50, -14, 1], [-24, -32, 1.2], [6, -38, 1.3], [34, -28, 1.1], [54, -10, 1]].map(([lx, ly, s], i) => <path key={i} transform={`translate(${lx} ${ly}) scale(${s})`} d="M0 0 C -18 -4, -20 -22, -4 -24 C 0 -30, 14 -28, 14 -18 C 26 -14, 20 4, 0 0z" fill={i % 2 ? '#58C98A' : '#4BBF80'} stroke="#2E9C62" strokeWidth="1.6" />)}
  {[[-30, -6], [22, -8]].map(([gx, gy], i) => <ellipse key={i} cx={gx} cy={gy} rx="10" ry="7" fill="#F5C24A" stroke="#C99520" strokeWidth="1.6" />)}
</g>);

export const STORY_ART = {
  // يونس
  y_town: () => (<g><Sky a="#9FDCFF" b="#E9F7FF" /><Sun x={196} y={36} /><Cloud x={30} y={26} drift={14} /><Mountain x={-20} w={140} h={50} y={118} c="#B8D9C6" /><Houses y={168} /><Light x={120} y2={168} w={70} /><Txt x={120} y={194} t="ادعوا الله وحده" c="#8A5A30" s={13} /></g>),
  y_refuse: () => (<g><Sky a="#C9A27A" b="#F4DDB8" /><Cloud x={40} y={30} c="#E9DDCB" drift={10} /><Cloud x={150} y={20} c="#E9DDCB" /><Houses y={168} dim doors="closed" /><path d="M110 70 q10 -16 20 0" stroke="#8A6E52" strokeWidth="3" fill="none" /><Txt x={120} y={60} t="محدّش سمع الكلام…" c="#6E5238" s={14} /></g>),
  y_sail: () => (<g><Sky a="#8ED8FF" b="#D7F2FF" /><Sun x={200} y={34} /><Cloud x={20} y={30} drift={20} /><Cloud x={120} y={18} s={0.8} drift={-14} /><Ship x={110} y={118} s={1.1} tilt={3} /><Sea y={132} /></g>),
  y_storm: () => (<g><Sky a="#3D4A73" b="#7D8BB0" /><Cloud x={10} y={10} s={1.6} c="#59668F" drift={10} /><Cloud x={130} y={4} s={1.8} c="#4E5A82" drift={-10} /><Bolt x={70} y={40} /><Bolt x={190} y={30} /><Rain n={36} /><Ship x={116} y={110} s={1.05} tilt={12} dur="1.6s" sail="#E3DCCF" /><Sea y={120} c1="#3E6FAE" c2="#2A5591" rough /></g>),
  y_splash: () => (<g><Sky a="#5D6C9E" b="#A9B7D6" /><Cloud x={20} y={14} s={1.4} c="#7381A8" /><Ship x={70} y={104} s={0.75} tilt={8} dur="2s" sail="#E3DCCF" /><Sea y={124} c1="#3E6FAE" c2="#2A5591" rough />
    {[0, 1, 2].map((i) => <ellipse key={i} cx="170" cy="132" rx="10" ry="4" fill="none" stroke="#DFF3FF" strokeWidth="2.5"><animate attributeName="rx" values="6;30" dur="2s" begin={`${i * 0.66}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="2s" begin={`${i * 0.66}s`} repeatCount="indefinite" /></ellipse>)}
    <path d="M160 128 q10 -26 20 0" fill="#DFF3FF" opacity=".9" /></g>),
  y_whale: () => (<g><Sky a="#3C7FD0" b="#86C4F5" /><Sea y={70} c1="#3B8EDB" c2="#2A6FBB" /><rect y="110" width={W} height="90" fill="#1F5A9E" />
    {[30, 90, 200].map((bx, i) => <circle key={i} cx={bx} cy={150} r="3" fill="#BFE6FF" opacity=".7"><animate attributeName="cy" values="190;90" dur={`${3 + i}s`} repeatCount="indefinite" /></circle>)}
    <Whale x={130} y={140} s={1.25} open /><Light x={70} y1={70} y2={190} w={40} /></g>),
  y_dark: () => (<g><rect width={W} height={H} fill="#0B1838" /><rect x="0" y="0" width={W} height="70" fill="#121F45" /><Moon x={200} y={32} /><Star x={40} y={20} s={0.7} /><Star x={120} y={30} s={0.6} />
    <rect y="70" width={W} height="130" fill="#0E2550" />
    <ellipse cx="120" cy="140" rx="100" ry="52" fill="#081530" stroke="#1F3D78" strokeWidth="3" />
    <circle cx="120" cy="140" r="30" fill="#FFE9A0" opacity=".25"><animate attributeName="r" values="24;40;24" dur="3s" repeatCount="indefinite" /></circle>
    <Txt x={120} y={136} t="لا إله إلا أنت" c="#FFE9A0" s={15} f="Amiri, serif" /><Txt x={120} y={156} t="سبحانك" c="#FFE9A0" s={13} f="Amiri, serif" />
    <Txt x={40} y={64} t="ضلمة الليل" c="#7F94C8" s={10} /><Txt x={36} y={100} t="ضلمة البحر" c="#7F94C8" s={10} /><Txt x={120} y={196} t="ضلمة بطن الحوت" c="#7F94C8" s={10} /></g>),
  y_shore: () => (<g><Sky a="#FFC98A" b="#FFF0D2" /><Sun x={50} y={70} r={22} c="#FFB347" /><Sea y={120} c1="#58B6E8" c2="#3F9AD6" /><path d="M110 200 C 130 150, 200 130, 240 128 V200z" fill="#F3D7A7" /><Whale x={72} y={140} s={0.7} /><path d="M196 130 l4 -26 M206 130 q-10 -30 -30 -24 M206 130 q8 -30 28 -24" stroke="#3E9C5E" strokeWidth="3" fill="none" /></g>),
  y_gourd: () => (<g><Sky a="#A8F0B8" b="#F0FFE9" /><Sun x={36} y={32} /><Houses y={120} /><rect y="120" width={W} height="80" fill="#BFE6A8" /><Gourd x={120} y={186} /><rect x="60" y="14" width="120" height="26" rx="13" fill="#fff" opacity=".9" /><Txt x={120} y={32} t="القوم كلهم آمنوا" c="#1F8A61" s={14} /></g>),
  // نوح
  n_idols: () => (<g><Sky a="#9FDCFF" b="#E9F7FF" /><Sun x={200} y={34} /><Houses y={170} /><Light x={70} y2={170} w={50} />{[150, 176, 202].map((x, i) => <path key={i} d={`M${x} 170 v-22 h12 v22`} fill="#9AA3B2" stroke="#6E7B90" strokeWidth="2" />)}<path d="M146 138 L220 172 M220 138 L146 172" stroke="#E0563F" strokeWidth="4" strokeLinecap="round" /><Txt x={70} y={194} t="الله واحد" c="#8A5A30" s={13} /></g>),
  n_years: () => (<g><Sky a="#FFD9A0" b="#FFF1DA" /><circle cx="120" cy="96" r="58" fill="none" stroke="#E7B53C" strokeWidth="3" strokeDasharray="6 6"><animateTransform attributeName="transform" type="rotate" values="0 120 96;360 120 96" dur="12s" repeatCount="indefinite" /></circle>
    <g><animateTransform attributeName="transform" type="rotate" values="0 120 96;360 120 96" dur="6s" repeatCount="indefinite" /><circle cx="120" cy="38" r="10" fill="#FFD25A" /><path d="M120 144 m-8 0 a9 9 0 1 0 8 -10 a7 7 0 1 1 -8 10z" fill="#9C80E6" /></g>
    <Txt x={120} y={104} t="٩٥٠ سنة" c="#B57E1A" s={24} /><Txt x={120} y={190} t="صبر طويل جدًا" c="#8A5A30" s={13} /></g>),
  n_build: () => (<g><Sky a="#A8E4FF" b="#E9F7FF" /><Sun x={200} y={34} /><Grass y={168} c="#C9E6A8" /><Ark x={110} y={150} s={1.05} rock={0} build />
    {[[40, 176], [60, 180]].map(([px, py], i) => <rect key={i} x={px} y={py} width="40" height="6" rx="2" fill="#C98B55" stroke="#8A5A30" strokeWidth="1.4" transform={`rotate(-6 ${px} ${py})`} />)}
    <g transform="translate(200 160) rotate(-30)"><rect x="-2" y="0" width="4" height="22" fill="#8A5A30" /><rect x="-8" y="-6" width="16" height="8" rx="2" fill="#7D8CA6" /><animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-25;0" dur=".8s" repeatCount="indefinite" /></g>
    <Txt x={120} y={60} t="بأمر ربنا… سفينة كبيرة" c="#2A6FBB" s={14} /></g>),
  n_flood: () => (<g><Sky a="#4E5C86" b="#8E9BBF" /><Cloud x={0} y={8} s={1.8} c="#63709A" /><Cloud x={120} y={0} s={2} c="#56638D" /><Rain n={46} /><Ark x={120} y={118} s={1} rock={5} />
    <Animal k="giraffe" x={86} y={92} s={0.9} /><Animal k="giraffe" x={100} y={92} s={0.8} /><Animal k="bird" x={132} y={78} s={0.9} /><Animal k="bird" x={146} y={80} s={0.9} />
    <Sea y={132} c1="#3E6FAE" c2="#2A5591" rough /></g>),
  n_sail: () => (<g><Sky a="#8ED8FF" b="#D7F2FF" /><Cloud x={20} y={24} drift={20} /><Sun x={196} y={34} /><Ark x={120} y={120} s={1.05} rock={3} /><Animal k="elephant" x={74} y={92} s={0.8} /><Animal k="sheep" x={148} y={92} s={0.8} /><Sea y={134} /></g>),
  n_judi: () => (<g><Sky a="#FFC98A" b="#FFF0D2" /><Sun x={200} y={40} r={20} c="#FFB347" />
    <path d="M10 112 A110 110 0 0 1 230 112" stroke="#FF7E6B" strokeWidth="5" fill="none" opacity=".6" /><path d="M20 112 A100 100 0 0 1 220 112" stroke="#F5C24A" strokeWidth="5" fill="none" opacity=".6" /><path d="M30 112 A90 90 0 0 1 210 112" stroke="#58C98A" strokeWidth="5" fill="none" opacity=".6" /><path d="M40 112 A80 80 0 0 1 200 112" stroke="#5AA9E0" strokeWidth="5" fill="none" opacity=".6" />
    <path d="M20 200 L110 92 L220 200z" fill="#8F7A5E" /><path d="M110 92 L132 120 L96 116z" fill="#B5A07F" /><Ark x={112} y={102} s={0.6} rock={0} /><Txt x={120} y={190} t="جبل الجودي" c="#fff" s={14} /></g>),
  // النمل
  a_valley: () => (<g><Sky a="#A8F0B8" b="#F0FFE9" /><Sun x={200} y={32} /><Grass y={140} /><AntHill x={190} y={170} s={1.3} />
    {[[30, 168, '#F5C24A'], [64, 174, '#FF7E6B'], [98, 168, '#F5C24A'], [132, 176, null], [160, 170, '#58C98A']].map(([x, y, l], i) => <Ant key={i} x={x} y={y} s={1.3} load={l} />)}
    <Txt x={110} y={120} t="شغل وتعاون" c="#1F8A61" s={14} /></g>),
  a_army: () => (<g><Sky a="#FFD9A0" b="#FFF1DA" /><Sun x={36} y={34} /><path d="M0 120 Q120 100 240 120 V200 H0z" fill="#E8D2A6" />
    <ellipse cx="150" cy="114" rx="90" ry="16" fill="#E9C99A" opacity=".8"><animate attributeName="rx" values="80;96;80" dur="3s" repeatCount="indefinite" /></ellipse>
    {Array.from({ length: 9 }, (_, i) => <Banner key={i} x={80 + i * 16} y={118 - (i % 2) * 4} />)}
    <Grass y={168} /><AntHill x={40} y={186} /><Ant x={70} y={190} s={1.1} /><Txt x={150} y={74} t="جيش كبير جاي ناحية الوادي" c="#8A5A30" s={12} /></g>),
  a_warn: () => (<g><Sky a="#A8F0B8" b="#F0FFE9" /><Grass y={140} /><ellipse cx="120" cy="150" rx="26" ry="10" fill="#B5A07F" /><Ant x={116} y={142} s={2.4} walk={false} /><Bubble x={150} y={96} t="ادخلوا مساكنكم!" />
    {[[30, 182], [60, 188], [190, 184], [214, 178]].map(([x, y], i) => <Ant key={i} x={x} y={y} s={1.1} flip={i > 1} />)}</g>),
  a_hide: () => (<g><Sky a="#A8F0B8" b="#F0FFE9" /><Grass y={140} /><AntHill x={120} y={178} s={2.2} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i}><Ant x={30} y={180} s={1.1} /><animateTransform attributeName="transform" type="translate" values={`${i * -40} ${i * 2};${80 + i * 4} -6`} dur="2.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" /></g>)}
    <Txt x={120} y={110} t="كلهم في أمان" c="#1F8A61" s={14} /></g>),
  a_thanks: () => (<g><Sky a="#FFE59A" b="#FFF8E0" /><Sun x={120} y={60} r={26} /><Grass y={150} /><AntHill x={120} y={186} s={1.6} />
    {[[60, 190], [180, 190]].map(([x, y], i) => <Ant key={i} x={x} y={y} s={1.2} flip={i > 0} />)}
    <Txt x={120} y={124} t="الحمد لله على نعمه" c="#B57E1A" s={15} f="Amiri, serif" /></g>),
};

export default function StoryArt({ id }) {
  const f = STORY_ART[id];
  if (!f) return null;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" style={{ position: 'absolute', inset: 0, display: 'block' }}>{f()}</svg>;
}
