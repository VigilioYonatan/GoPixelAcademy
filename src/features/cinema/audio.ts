import audioManifestRaw from './audio-manifest.json';
import type { StudioAudioMeta } from './cinema.types';

const audioManifest = audioManifestRaw as Record<string, StudioAudioMeta>;

/** Returns pre-mastered 2-speaker neural HD studio audio metadata if available for a deck. */
export function resolveStudioAudio(deckId: string): StudioAudioMeta | undefined {
  return audioManifest[deckId];
}

export function cleanForSpeech(text: string): string {
  return text
    .replace(/fmt\.Println/g, 'efe eme te punto print line')
    .replace(/fmt\.Errorf/g, 'efe eme te punto error efe')
    .replace(/errors\.Is/g, 'errors punto is')
    .replace(/strconv\.Atoi/g, 'string conv punto a to i')
    .replace(/strings\.Builder/g, 'strings punto Builder')
    .replace(/filepath\.Clean/g, 'filepath punto Clean')
    .replace(/time\.Sleep/g, 'time punto Sleep')
    .replace(/FakeClock/g, 'reloj simulado Fake Clock')
    .replace(/<-ctx\.Done\(\)/g, 'el canal context punto done')
    .replace(/go test -race \.\/\.\.\./g, 'go test guion race en todos los paquetes')
    .replace(/go test -race/g, 'go test guion race')
    .replace(/go test -run \^\$ -bench \. -benchmem/g, 'go test guion bench con memoria')
    .replace(/"%w"/g, 'por ciento doble ve')
    .replace(/%w/g, 'por ciento doble ve')
    .replace(/P99/g, 'pe noventa y nueve')
    .replace(/TTL/g, 'té té ele')
    .replace(/ns\/op/g, 'nanosegundos por operación')
    .replace(/B\/op/g, 'bytes por operación')
    .replace(/allocs\/op/g, 'asignaciones por operación')
    .replace(/sync\/atomic/g, 'sync barra atomic')
    .replace(/sync\.Mutex/g, 'sync punto mutex');
}

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

function pickBestVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechSupported()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  const normalized = langPrefix.toLowerCase().slice(0, 2);
  const matching = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(normalized),
  );
  return (
    matching.find((v) => /natural|online|neural|google/i.test(v.name)) ??
    matching[0]
  );
}

export function stopNarration(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore browser speech cancellation quirks */
  }
}

export function speakNarration(
  text: string,
  rate = 1,
  lang = 'es-ES',
  onEnd?: () => void,
): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
    utter.lang = lang;
    utter.rate = Math.min(1.6, Math.max(0.85, rate));
    utter.pitch = 1.0;
    const best = pickBestVoice(lang);
    if (best) utter.voice = best;
    if (onEnd) {
      utter.onend = () => onEnd();
      utter.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utter);
  } catch {
    onEnd?.();
  }
}
