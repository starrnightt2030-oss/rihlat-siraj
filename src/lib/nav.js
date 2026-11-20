// التنقّل بالـ hash مع سجل للصفحات اللي اتفتحت،
// عشان «رجوع» و«الرئيسية» يرجعوا فعلًا لورا، مش يفتحوا صفحة جديدة فوق القديمة (ويعلّقوا الطفل في لفّة)
const stack = [location.hash || '#/'];
let replacing = false;
export function track() {
  const h = location.hash || '#/';
  if (replacing) { replacing = false; stack[stack.length - 1] = h; return; }
  const i = stack.lastIndexOf(h);
  if (i >= 0 && i < stack.length - 1) stack.length = i + 1; else stack.push(h);
}
const url = (name, arg) => '#/' + name + (arg ? '/' + arg : '');
export const go = (name, arg) => { location.hash = url(name, arg); };
// swap: يبدّل الصفحة الحالية من غير ما يزوّد خطوة (زي «الدرس الجاي»)، فرجوع بيروح للقايمة على طول
export const swap = (name, arg) => { replacing = true; location.replace(url(name, arg)); };
export const back = () => (stack.length > 1 ? history.back() : swap('home'));
// الرئيسية: يرجع لورا لحد صفحة الرئيسية لو موجودة في السجل، وإلا يفتحها مكان الصفحة الحالية
export const home = () => {
  const i = stack.lastIndexOf('#/home');
  if (i === stack.length - 1) return;
  if (i >= 0) history.go(i - (stack.length - 1)); else swap('home');
};
