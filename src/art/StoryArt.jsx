// مشاهد الحكايات مرسومة: كل مشهد بيوصف الكلام اللي بيتقال، بحركة هادية (موج، مطر، سفينة بتتهز)
// من غير أي تجسيد للأنبياء — بنعبّر بالمكان والرموز والنور
import { W, H, uid, Sky, Sun, Moon, Star, Cloud, Sea, Ship, Whale, Houses, Rain, Bolt, Mountain, Ark, Animal, Ant, AntHill, Grass, Light, Txt, Bubble, Banner, Gourd } from './StoryKit';
import { STORY_ART2 } from './StoryArt2';

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

Object.assign(STORY_ART, STORY_ART2);

export default function StoryArt({ id }) {
  const f = STORY_ART[id];
  if (!f) return null;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" style={{ position: 'absolute', inset: 0, display: 'block' }}>{f()}</svg>;
}
