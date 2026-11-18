// مناطق جزيرة النور — المواقع بالنسبة المئوية على خريطة النهار
export const REGIONS = [
  { id: 'iman', name: 'وادي الإيمان', x: 80.2, y: 20, color: '#9D7CFF', sky: 'lilac', bg: 'stories/yunus/env_beach', lessons: ['creation'], intro: 'هنا بنتعرف على ربنا اللي خلق كل حاجة حلوة حوالينا.' },
  { id: 'salah', name: 'مدينة الصلاة', x: 49.6, y: 21.5, color: '#FFB020', sky: 'warm', bg: 'games/puzzles/mosque', lessons: ['wudu', 'prayer', 'pillars'], intro: 'هنا بنتعلم الوضوء والصلاة خطوة بخطوة.' },
  { id: 'quran', name: 'نهر القرآن', x: 49.3, y: 43, color: '#1EC8BE', sky: 'mint', bg: 'games/puzzles/garden', lessons: [], intro: 'نهر القرآن بيتجهّز… قريب هنحفظ فيه السور القصيرة.' },
  { id: 'akhlaq', name: 'بستان الأخلاق', x: 86.4, y: 51, color: '#4FCB6B', sky: 'mint', bg: 'games/puzzles/garden', lessons: ['amana'], intro: 'في البستان بنزرع الأخلاق الحلوة ونجمع شرارات الخير.' },
  { id: 'hadith', name: 'مكتبة الحديث', x: 18.6, y: 33, color: '#FF8FC8', sky: 'warm', bg: 'games/puzzles/mosque', lessons: [], intro: 'المكتبة بتتجهّز بأحاديث قصيرة سهلة.' },
  { id: 'hikayat', name: 'بحر الحكايات', x: 46.3, y: 86, color: '#3FA9F5', sky: 'default', bg: 'games/puzzles/harbor', lessons: ['yunus'], intro: 'تعالى نسمع حكايات القرآن الحلوة.' },
];
export const SPOTS = [
  { id: 'games', name: 'سوق الألعاب', x: 21.5, y: 69, color: '#FF7B6B', to: 'games' },
  { id: 'album', name: 'شاطئ الكنوز', x: 80.7, y: 78, color: '#FFC233', to: 'album' },
];

export const SPARKS = [
  { id: 'sidq', name: 'الصدق', color: '#4FC3F7' },
  { id: 'amana', name: 'الأمانة', color: '#FFC233' },
  { id: 'rahma', name: 'الرحمة', color: '#FF8FC8' },
  { id: 'taawun', name: 'التعاون', color: '#4FCB6B' },
  { id: 'sabr', name: 'الصبر', color: '#9D7CFF' },
  { id: 'birr', name: 'بر الوالدين', color: '#FF9A3C' },
  { id: 'shukr', name: 'الشكر', color: '#1EC8BE' },
];
export const STICKERS = ['mosque', 'kaaba', 'whale', 'ship', 'gourd', 'camel', 'ark', 'ant', 'hoopoe', 'web', 'lighthouse', 'iftar'];
export const STICKER_NAMES = { mosque: 'المسجد', kaaba: 'الكعبة', whale: 'الحوت', ship: 'السفينة', gourd: 'شجرة اليقطين', camel: 'الناقة', ark: 'سفينة نوح', ant: 'النملة', hoopoe: 'الهدهد', web: 'بيت العنكبوت', lighthouse: 'المنارة', iftar: 'فطار رمضان' };

const W = (n) => 'lessons/wudu/' + n;
const P = (n) => 'lessons/prayer/' + n;

export const LESSONS = {
  wudu: {
    title: 'الوضوء خطوة بخطوة', region: 'salah', icon: 'stories/yunus/fx_spray', reward: { sticker: 'mosque', light: 8 },
    intro: 'قبل ما نصلي لازم نتوضى. يلا نتعلم الوضوء مع بعض!',
    steps: [
      { t: 'النية', img: W('niyya'), say: 'ننوي بقلبنا إننا هنتوضى عشان ربنا، ونقول: بسم الله.', act: { kind: 'tap', n: 1, label: 'قول: بسم الله', icon: 'heart' } },
      { t: 'غسل الكفّين', img: W('hands'), say: 'نغسل الكفّين الاتنين لحد الرسغ… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'المضمضة', img: W('mouth'), say: 'ناخد مية في بُقّنا ونلفّها ونرميها… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'الاستنشاق', img: W('nose'), say: 'ندخّل مية في مناخيرنا بهدوء ونطلّعها… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'غسل الوش', img: W('face'), say: 'نغسل الوش كله، من أول الشعر لحد الدقن، ومن الودن للودن… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'غسل الإيدين للكوع', img: W('arms'), say: 'نغسل الإيد اليمين لحد الكوع وبعدها الشمال… كل إيد تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'مسح الراس', img: W('head'), say: 'نبلّ إيدينا ونمسح على راسنا من قدّام لورا ونرجع… مرة واحدة.', act: { kind: 'tap', n: 1, icon: 'hand' } },
      { t: 'مسح الودان', img: W('ears'), say: 'نمسح الودنين من جوّه ومن بره… مرة واحدة.', act: { kind: 'tap', n: 1, icon: 'hand' } },
      { t: 'غسل الرجلين', img: W('feet'), say: 'نغسل الرجل اليمين لحد الكعب وبعدها الشمال… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'خلّصنا الوضوء!', img: W('done'), say: 'بعد الوضوء نقول: أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمدًا عبده ورسوله.', act: { kind: 'tap', n: 1, label: 'قولها مع سراج', icon: 'heart' } },
    ],
    quiz: [
      { q: 'أول حاجة بنعملها في الوضوء؟', a: ['النية ونقول بسم الله', 'نغسل الرجلين'], c: 0 },
      { q: 'بنغسل الوش كام مرة؟', a: ['مرة واحدة', 'تلات مرات'], c: 1 },
      { q: 'الراس بنغسلها ولا بنمسحها؟', a: ['بنمسحها مرة واحدة', 'بنغسلها تلات مرات'], c: 0 },
    ],
  },
  prayer: {
    title: 'حركات الصلاة', region: 'salah', icon: 'lessons/prayer/p1_qiyam', reward: { sticker: 'kaaba', light: 10 },
    intro: 'الصلاة نور! تعالى نتعلم حركات ركعة واحدة.',
    steps: [
      { t: 'القيام', img: P('p1_qiyam'), say: 'نقف مستقيمين ووشّنا ناحية القبلة، وننوي بقلبنا الصلاة.', act: { kind: 'tap', n: 1, label: 'اتّجهت للقبلة', icon: 'heart' } },
      { t: 'تكبيرة الإحرام', img: P('p2_takbir'), say: 'نرفع إيدينا ونقول: الله أكبر.', act: { kind: 'tap', n: 1, label: 'الله أكبر', icon: 'hand' } },
      { t: 'القراءة', img: P('p3_qiraa'), say: 'نحط الإيد اليمين على الشمال ونقرا الفاتحة، وبعدها سورة قصيرة.', act: { kind: 'tap', n: 1, label: 'قريت الفاتحة', icon: 'heart' } },
      { t: 'الركوع', img: P('p4_ruku'), say: 'نوطّي وإيدينا على ركبنا ونقول: سبحان ربي العظيم… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'star' } },
      { t: 'الرفع من الركوع', img: P('p5_itidal'), say: 'نقوم ونقول: سمع الله لمن حمده، ربنا ولك الحمد.', act: { kind: 'tap', n: 1, label: 'ربنا ولك الحمد', icon: 'heart' } },
      { t: 'السجود', img: P('p6_sujud'), say: 'نسجد على جبهتنا ومناخيرنا وإيدينا وركبنا وصوابع رجلينا، ونقول: سبحان ربي الأعلى… تلات مرات.', act: { kind: 'tap', n: 3, icon: 'star' } },
      { t: 'الجلوس بين السجدتين', img: P('p7_julus'), say: 'نقعد بهدوء ونقول: رب اغفر لي.', act: { kind: 'tap', n: 1, label: 'رب اغفر لي', icon: 'heart' } },
      { t: 'السجدة التانية', img: P('p8_sujud2'), say: 'نسجد تاني ونقول: سبحان ربي الأعلى… تلات مرات. كده خلّصنا ركعة!', act: { kind: 'tap', n: 3, icon: 'star' } },
    ],
    quiz: [
      { q: 'أول ما نبدأ الصلاة بنقول إيه؟', a: ['الله أكبر', 'السلام عليكم'], c: 0 },
      { q: 'في الركوع بنقول إيه؟', a: ['سبحان ربي الأعلى', 'سبحان ربي العظيم'], c: 1 },
      { q: 'في السجود بنقول إيه؟', a: ['سبحان ربي الأعلى', 'سبحان ربي العظيم'], c: 0 },
    ],
  },
  pillars: {
    title: 'أركان الإسلام الخمسة', region: 'salah', icon: 'lessons/islam-pillars/salah', reward: { sticker: 'iftar', light: 8 },
    intro: 'الإسلام مبني على خمس حاجات… تعالى نعرفهم!',
    steps: [
      { t: 'الشهادتان', img: 'lessons/islam-pillars/shahada', say: 'نشهد إن لا إله إلا الله، وإن سيدنا محمد رسول الله.', act: { kind: 'tap', n: 1, label: 'أشهد', icon: 'heart' } },
      { t: 'الصلاة', img: 'lessons/islam-pillars/salah', say: 'نصلي خمس صلوات كل يوم: الفجر والظهر والعصر والمغرب والعشاء.', act: { kind: 'tap', n: 5, icon: 'star' } },
      { t: 'الزكاة', img: 'lessons/islam-pillars/zakat', say: 'الكبار اللي معاهم فلوس كتير بيدّوا جزء منها للمحتاجين.', act: { kind: 'tap', n: 1, label: 'فهمت', icon: 'heart' } },
      { t: 'الصيام', img: 'lessons/islam-pillars/sawm', say: 'نصوم شهر رمضان من الفجر لحد المغرب.', act: { kind: 'tap', n: 1, label: 'فهمت', icon: 'heart' } },
      { t: 'الحج', img: 'lessons/islam-pillars/hajj', say: 'نزور بيت الله الحرام في مكة مرة في العمر لمن يقدر.', act: { kind: 'tap', n: 1, label: 'فهمت', icon: 'heart' } },
    ],
    quiz: [
      { q: 'أركان الإسلام كام ركن؟', a: ['خمسة', 'تلاتة'], c: 0 },
      { q: 'بنصوم في شهر إيه؟', a: ['رمضان', 'شوال'], c: 0 },
      { q: 'بنصلي كام صلاة في اليوم؟', a: ['تلات صلوات', 'خمس صلوات'], c: 1 },
    ],
  },
  creation: {
    title: 'مين خلق؟', region: 'iman', icon: 'lessons/creation/sun', reward: { sticker: 'camel', light: 8 },
    intro: 'بص حواليك… كل الحاجات الحلوة دي مين خلقها؟',
    steps: [
      { t: 'الشمس', img: 'lessons/creation/sun', say: 'مين خلق الشمس اللي بتنوّر وتدفّي الدنيا؟ الله سبحانه وتعالى.', act: { kind: 'tap', n: 1, label: 'الله خلقها', icon: 'heart' } },
      { t: 'المطر', img: 'lessons/creation/rain', say: 'مين بينزّل المطر فيطلع الزرع؟ الله سبحانه وتعالى.', act: { kind: 'tap', n: 3, icon: 'drop' } },
      { t: 'الحيوانات', img: 'lessons/creation/animals', say: 'الأسد والفيل والزرافة والأرنب… كلهم ربنا خلقهم بأشكال مختلفة.', act: { kind: 'tap', n: 1, label: 'سبحان الله', icon: 'heart' } },
      { t: 'البحر', img: 'lessons/creation/sea', say: 'البحر الكبير والسمك الملوّن… ربنا خلقهم.', act: { kind: 'tap', n: 1, label: 'سبحان الله', icon: 'heart' } },
      { t: 'النجوم', img: 'lessons/creation/stars', say: 'النجوم بتزيّن السما بالليل، وربنا هو اللي خلقها.', act: { kind: 'tap', n: 3, icon: 'star' } },
      { t: 'الفاكهة والزرع', img: 'lessons/creation/plants', say: 'التفاح والعنب والموز… ربنا خلقهم عشان ناكل ونشكره.', act: { kind: 'tap', n: 1, label: 'الحمد لله', icon: 'heart' } },
    ],
    quiz: [
      { q: 'مين خلق الشمس والقمر؟', a: ['الله سبحانه وتعالى', 'الناس'], c: 0 },
      { q: 'لما ناكل فاكهة حلوة نقول إيه؟', a: ['الحمد لله', 'ولا حاجة'], c: 0 },
    ],
  },
};
export const lessonOf = (id) => LESSONS[id];
import { STORIES } from './stories';
export const ITEM = (id) => LESSONS[id] || STORIES[id];
