// توليد صوت سراج بالعامية المصرية من Azure (يشتغل على GitHub Actions بالمفتاح المحفوظ في أسرار الريبو)
// كل جملة بتتولّد مرة واحدة، وأي جملة جديدة أو متغيّرة بس هي اللي بتتولّد تاني
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allLines } from '../src/data/speech.js';
import { lineHash } from '../src/lib/hash.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.AZURE_SPEECH_KEY, REGION = process.env.AZURE_SPEECH_REGION;
const VOICE = process.env.TTS_VOICE || 'ar-EG-ShakirNeural';
const PITCH = process.env.TTS_PITCH || '+22%', RATE = process.env.TTS_RATE || '-4%';
const DRY = !!process.env.DRY;
if (!DRY && (!KEY || !REGION)) { console.error('يلزم AZURE_SPEECH_KEY و AZURE_SPEECH_REGION'); process.exit(1); }
const out = join(root, 'public/audio/voice');
mkdirSync(out, { recursive: true });

const speakable = (t) => t.replace(/ﷺ/g, ' صلى الله عليه وسلم ').replace(/[«»"﴿﴾]/g, '').replace(/…/g, '، ').replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ssml = (t) => `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-EG"><voice name="${VOICE}"><prosody pitch="${PITCH}" rate="${RATE}">${esc(t)}</prosody></voice></speak>`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function synth(text, file) {
  for (let a = 1; a <= 6; a++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'rihlat-siraj-tts' }, body: ssml(text) });
    if (res.ok) { writeFileSync(file, Buffer.from(await res.arrayBuffer())); return; }
    if (res.status === 429 || res.status >= 500) { await sleep(4000 * a); continue; }
    throw new Error(`Azure ${res.status}: ${await res.text()}`);
  }
  throw new Error('فشل التوليد');
}

// الملفات المسجّلة (-r.mp3) ليها الأولوية ومبتتمسحش. التوليد بس للجمل اللي مالهاش صوت.
const tag = lineHash(VOICE + PITCH + RATE);
const mf = join(out, 'manifest.json');
const old = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')).map || {} : {};
const lines = allLines();
const map = {};
let made = 0;
for (const t of lines) {
  const h = lineHash(t);
  if (old[h] && old[h].endsWith('-r.mp3') && existsSync(join(out, old[h]))) { map[h] = old[h]; continue; }
  const name = `${h}-${tag}.mp3`; map[h] = name;
  if (existsSync(join(out, name))) continue;
  if (DRY) { console.log('«' + speakable(t).slice(0, 90) + '»'); continue; }
  await synth(speakable(t), join(out, name)); made++;
}
const keep = new Set(Object.values(map));
if (!DRY) { for (const f of readdirSync(out)) if (f.endsWith('.mp3') && !keep.has(f)) unlinkSync(join(out, f)); writeFileSync(mf, JSON.stringify({ map })); }
console.log(`خلاص: ${lines.length} جملة، اتولّد جديد ${made}`);
