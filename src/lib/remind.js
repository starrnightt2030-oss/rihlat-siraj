// تذكير الأذكار على الموبايل: الصبح والمسا وقبل النوم — بيفتح القسم على طول لما الطفل يدوس
import { Capacitor } from '@capacitor/core';
import { useStore } from '../store';
const NATIVE = Capacitor.isNativePlatform();
export const REMINDERS = [
  { id: 101, sec: 'sabah', h: 7, m: 30, title: 'صباح النور ☀️', body: 'سراج مستنيك نقول أذكار الصباح سوا!' },
  { id: 102, sec: 'masa', h: 17, m: 30, title: 'مساء الخير 🌙', body: 'يلا نقول أذكار المساء مع سراج.' },
  { id: 103, sec: 'nawm', h: 20, m: 30, title: 'قبل ما تنام ✨', body: 'قول أذكار النوم ونام وانت في حفظ الله.' },
];
let wired = false;
export async function syncReminders() {
  if (!NATIVE) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    if (!wired) {
      wired = true;
      LocalNotifications.addListener('localNotificationActionPerformed', (a) => { const sec = a?.notification?.extra?.sec; if (sec) location.hash = '#/adhkar/' + sec; });
    }
    await LocalNotifications.cancel({ notifications: REMINDERS.map((r) => ({ id: r.id })) }).catch(() => {});
    if (useStore.getState().settings.remind === false) return;
    let p = await LocalNotifications.checkPermissions();
    if (p.display !== 'granted') p = await LocalNotifications.requestPermissions();
    if (p.display !== 'granted') return;
    await LocalNotifications.schedule({ notifications: REMINDERS.map((r) => ({ id: r.id, title: r.title, body: r.body, extra: { sec: r.sec }, schedule: { on: { hour: r.h, minute: r.m }, allowWhileIdle: true } })) });
  } catch (e) { /* الإشعارات مش متاحة */ }
}
