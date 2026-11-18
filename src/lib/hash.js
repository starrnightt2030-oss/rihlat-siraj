// FNV-1a: نفس الحساب في التطبيق وفي سكريبت توليد الصوت
export const lineHash = (t) => { let h = 0x811c9dc5; for (const ch of t.trim()) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
