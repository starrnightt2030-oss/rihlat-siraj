import { useMemo, useState } from 'react';
import Sky from '../components/Sky';
import { Btn, IconBtn, I } from '../components/ui';
import { useStore } from '../store';
import { ALL_CARDS } from '../data/units';
import { ar } from '../lib/asset';
import { VERSION } from '../lib/update';

export default function Parent({ go, back }) {
  const s = useStore();
  const [a, b] = useMemo(() => [3 + Math.floor(Math.random() * 6), 2 + Math.floor(Math.random() * 7)], []);
  const [ans, setAns] = useState('');
  const [open, setOpen] = useState(false);
  const [sure, setSure] = useState(false);
  const all = Object.fromEntries(ALL_CARDS.map((c) => [c.id, c]));
  const Toggle = ({ k, t }) => (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 4px', borderBottom: '2px solid #F1F4FA', fontSize: 18, fontWeight: 700 }}>
      {t}
      <input type="checkbox" checked={!!s.settings[k]} onChange={(e) => s.setSetting(k, e.target.checked)} style={{ width: 28, height: 28, accentColor: '#1EC8BE' }} />
    </label>
  );
  return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>ركن ولي الأمر</h1>
      </div>
      {!open ? (
        <div className="card" style={{ position: 'relative', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>المكان ده للكبار. حل المسألة دي:</p>
          <p style={{ fontSize: 40, fontWeight: 800 }}>{ar(a)} × {ar(b)} = ؟</p>
          <input inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)))} aria-label="الإجابة"
            style={{ height: 60, borderRadius: 18, border: '3px solid #FFE08A', fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#22306A' }} />
          <Btn className="block" tone="teal" disabled={Number(ans) !== a * b} onClick={() => setOpen(true)}>دخول</Btn>
        </div>
      ) : (
        <>
          <div className="card" style={{ position: 'relative', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800 }}>تقدّم {s.profile?.name || 'الطفل'}</h2>
            <p style={{ fontWeight: 700, color: '#5D6CA0' }}>السن: {s.profile?.age ? ar(s.profile.age.replace('-', ' – ')) : '—'} · النجوم: {ar(s.stars)} · النور: {ar(s.light)}</p>
            {Object.entries(all).map(([id, l]) => (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '2px solid #F6F7FB', fontWeight: 700 }}>
                <span>{l.title}</span><span style={{ color: id in s.done ? '#2D9C4A' : '#9AA5C6' }}>{id in s.done ? '★'.repeat(s.done[id]) : 'لسه'}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ position: 'relative', padding: 16 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>آخر ٧ أيام</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, textAlign: 'center' }}>
              {Array.from({ length: 7 }).map((_, k) => {
                const t = new Date(); const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 6 + k);
                const on = (s.days || []).includes(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
                return <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, background: on ? '#2FB383' : '#EEF1F7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{on ? '✓' : ''}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6D7896' }}>{['أحد', 'اتنين', 'تلات', 'أربع', 'خميس', 'جمعة', 'سبت'][d.getDay()]}</span></div>;
              })}
            </div>
          </div>
          <div className="card" style={{ position: 'relative', padding: '4px 16px' }}>
            <Toggle k="sound" t="أصوات التطبيق" />
            <Toggle k="voice" t="صوت سراج (قراءة الكلام)" />
            <Toggle k="quran" t="تلاوة الشيخ للآيات" />
            <Toggle k="motion" t="الحركة والمؤثرات" />
          </div>
          <div className="card" style={{ position: 'relative', padding: 14, fontSize: 15, lineHeight: 1.7, color: '#5D6CA0', fontWeight: 600 }}>
            المحتوى الشرعي مكتوب بلغة مبسّطة للأطفال، والآيات منقولة بنصّها مع ذكر السورة ورقم الآية. الأحاديث مكتوب معاها مصدرها، والتلاوة بصوت الشيخ مشاري العفاسي. رقم النسخة: <bdi dir="ltr">{VERSION}</bdi>. التطبيق لا يجسّد الأنبياء ولا الصحابة ولا الملائكة، ولا يعاقب الطفل على الغياب.
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn className="block" tone="white" onClick={() => { s.setProfile(null); go('onboard'); }}>تغيير بيانات الطفل</Btn>
            {!sure ? <Btn className="block" tone="coral" onClick={() => setSure(true)}>مسح كل التقدّم</Btn>
              : <Btn className="block" tone="coral" onClick={() => { s.reset(); go('splash'); }}>متأكد؟ اضغط تاني للمسح</Btn>}
          </div>
        </>
      )}
    </div>
  );
}
