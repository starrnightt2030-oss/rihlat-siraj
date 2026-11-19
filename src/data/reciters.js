// القرّاء: كل الآيات اللي في التطبيق متخزّنة جوّاه (بتشتغل من غير نت)
// العفاسي والحصري والسديس: QuranHub — الشاطري والدوسري: The-Quran-Project
export const RECITERS = [
  { id: 'alafasy', name: 'مشاري العفاسي', note: 'صوت ندي ومحبوب', dir: 'quran', c: '#3A8FE0' },
  { id: 'husary', name: 'محمود خليل الحصري', note: 'هادي وواضح… الأنسب للتعليم', dir: 'q/husary', c: '#2FB383' },
  { id: 'sudais', name: 'عبد الرحمن السديس', note: 'إمام الحرم المكي', dir: 'q/sudais', c: '#F5A623' },
  { id: 'shatri', name: 'أبو بكر الشاطري', note: 'ترتيل جميل وهادي', dir: 'q/shatri', c: '#7B5CE0' },
  { id: 'dosari', name: 'ياسر الدوسري', note: 'إمام الحرم المكي', dir: 'q/dosari', c: '#E0609E' },
];
export const reciterById = (id) => RECITERS.find((r) => r.id === id) || RECITERS[0];
