// الحكايات: مفيش أي تجسيد للأنبياء — المشاهد بحر وسفينة وحوت وضوء بس
const Y = (n) => 'stories/yunus/' + n;
export const STORIES = {
  yunus: {
    title: 'سيدنا يونس والحوت', sub: 'حكاية الدعاء والتوبة', cover: Y('whale'), color: '#3FA9F5', reward: { sticker: 'whale', light: 10 },
    scenes: [
      { bg: Y('env_city'), sky: 'linear-gradient(#9FDcff,#E9F7FF)', t: 'زمان، ربنا بعت سيدنا يونس عليه السلام لقومه، عشان يدعوهم يعبدوا الله وحده.' },
      { bg: Y('env_city'), sky: 'linear-gradient(#FFD9A0,#FFF1DA)', t: 'سيدنا يونس فضل ينصحهم كتير، لكنهم ما سمعوش الكلام.' },
      { bg: Y('sea_calm'), el: [{ img: Y('ship'), w: 70, x: 15, y: 18, anim: 'bob' }], sky: 'linear-gradient(#8ED8FF,#D7F2FF)', t: 'زعل سيدنا يونس وخرج من البلد، وركب سفينة مليانة ناس وحمول.' },
      { bg: Y('sea_high'), el: [{ img: Y('ship_storm'), w: 80, x: 10, y: 8, anim: 'rock' }], sky: 'linear-gradient(#5D6C9E,#9AA8C9)', t: 'وفي نص البحر، الموج علي جدًا، والسفينة بقت تقيلة وهتغرق.', fx: 'storm' },
      { bg: Y('sea_mid'), el: [{ img: Y('splash'), w: 60, x: 20, y: 30, anim: 'pop' }], sky: 'linear-gradient(#6E87B8,#B5C6E4)', t: 'ركاب السفينة عملوا قرعة، والقرعة وقعت على سيدنا يونس، فنزل في البحر.' },
      { bg: Y('sea_calm'), el: [{ img: Y('whale'), w: 82, x: 9, y: 12, anim: 'swim' }], sky: 'linear-gradient(#3C7FD0,#86C4F5)', t: 'ربنا أمر حوت كبير يبلع سيدنا يونس… من غير ما يأذيه.' },
      { bg: Y('env_in_whale'), el: [{ img: Y('fx_bubbles'), w: 40, x: 55, y: 15, anim: 'rise' }], sky: 'linear-gradient(#0E2A5A,#1B4A8A)', t: 'وفي بطن الحوت، في الضلمة، دعا سيدنا يونس ربنا وقال:', ayah: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', ref: 'سورة الأنبياء: ٨٧' },
      { bg: Y('env_beach'), el: [{ img: Y('sky_sunrise'), w: 34, x: 60, y: 4, anim: 'glow' }], sky: 'linear-gradient(#FFC98A,#FFF0D2)', t: 'ربنا استجاب دعاه، والحوت طلّعه على الشط.' },
      { bg: Y('env_gourd'), sky: 'linear-gradient(#A8F0B8,#F0FFE9)', t: 'وربنا أنبت له شجرة يقطين تظلّله، ورجع لقومه فلقاهم آمنوا كلهم.' },
    ],
    moral: 'لما نغلط نرجع لربنا ونستغفره، وربنا بيسمعنا في أي مكان، حتى في الضلمة.',
    quiz: [
      { q: 'سيدنا يونس عمل إيه وهو في بطن الحوت؟', a: ['دعا ربنا واستغفر', 'زعّق وعيّط'], c: 0 },
      { q: 'مين اللي نجّى سيدنا يونس؟', a: ['الله سبحانه وتعالى', 'ركاب السفينة'], c: 0 },
    ],
  },
  amana: {
    title: 'الأمانة في الميناء', sub: 'حكاية اختار انت', cover: 'stories/interactive/a2_bag', color: '#FFC233', choice: true, reward: { spark: 'amana', light: 10 },
    scenes: [
      { bg: 'stories/interactive/a1_port', t: 'عمر كان بيتمشى في الميناء، وبيتفرّج على السفن والصيادين.' },
      { bg: 'stories/interactive/a2_bag', t: 'فجأة… لقى كيس فلوس واقع جنب الصناديق!' },
      { bg: 'stories/interactive/a3_think', t: 'عمر وقف يفكّر: أعمل إيه دلوقتي؟ ساعده تختار!', choose: [
        { t: 'يدوّر على صاحبه ويرجّعه', good: true, img: 'characters/sparks/amana', res: 'عمر سأل الصيادين لحد ما لقى صاحب الكيس ورجّعه له. الراجل فرح جدًا ودعا له بالخير، وعمر حس بسعادة كبيرة!' },
        { t: 'يسيبه مكانه ويمشي', img: 'stories/interactive/r2_think', res: 'عمر مشي، بس فضل يفكّر في صاحب الكيس اللي ممكن يكون زعلان. كان ممكن يساعده! تعالى نختار تاني.' },
        { t: 'ياخده لنفسه', img: 'stories/interactive/r3_sad', res: 'عمر حس بقلق وضيق، لأن الحاجة دي مش بتاعته. الأمين بيرجّع الحاجة لصاحبها. تعالى نختار تاني.' },
      ] },
    ],
    moral: 'الأمين بيرجّع الحاجة لصاحبها، حتى لو محدش شايفه… وربنا شايفنا دايمًا.',
    quiz: [{ q: 'لو لقيت حاجة مش بتاعتك تعمل إيه؟', a: ['أرجّعها لصاحبها', 'آخدها'], c: 0 }],
  },
};
