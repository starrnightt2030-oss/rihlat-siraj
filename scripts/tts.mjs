// توليد صوت سراج بالعامية المصرية من Azure (يشتغل على GitHub Actions بالمفتاح المحفوظ في أسرار الريبو)
// كل جملة بتتولّد مرة واحدة، وأي جملة جديدة أو متغيّرة بس هي اللي بتتولّد تاني
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
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

const tag = lineHash(VOICE + PITCH + RATE);
const lines = allLines();
const want = new Set();
let made = 0;
for (const t of lines) {
  const name = `${lineHash(t)}-${tag}.mp3`; want.add(name);
  const file = join(out, name);
  if (existsSync(file)) continue;
  if (DRY) { console.log('«' + speakable(t).slice(0, 90) + '»'); continue; }
  await synth(speakable(t), file); made++;
  if (made % 20 === 0) console.log('اتولّد', made);
}
for (const f of readdirSync(out)) if (f.endsWith('.mp3') && !want.has(f)) unlinkSync(join(out, f));
if (!DRY) writeFileSync(join(out, 'manifest.json'), JSON.stringify({ tag, files: [...want].map((n) => n.split('-')[0]) }));
console.log(`خلاص: ${lines.length} جملة، اتولّد جديد ${made}`);
