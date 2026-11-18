import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'src/features/cinema/audio-manifest.json');

test('gopher cinema audio manifest has 15 valid pre-mastered studio tracks (Batch 1 + 2 + 3)', () => {
  assert.ok(existsSync(manifestPath), 'audio-manifest.json must exist');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const expectedIds = [
    'HOME-INTRO',
    'SENIOR-OVERVIEW',
    'SENIOR-S01',
    'SENIOR-S02',
    'SENIOR-S03',
    'SENIOR-S04',
    'SENIOR-S05',
    'SENIOR-S06',
    'SENIOR-S07',
    'SENIOR-S08',
    'SENIOR-S09',
    'SENIOR-S10',
    'SENIOR-S11',
    'SENIOR-S12',
    'SENIOR-S13',
  ];
  for (const id of expectedIds) {
    const entry = manifest[id];
    assert.ok(entry, `Missing audio manifest entry for ${id}`);
    assert.ok(entry.totalSec > 10, `Expected duration > 10s for ${id}`);
    assert.ok(Array.isArray(entry.cues) && entry.cues.length >= 3, `Expected >= 3 cues for ${id}`);
    assert.equal(entry.cues.length, entry.speakers.length, `Speakers length must match cues for ${id}`);
    const audioFile = resolve(root, 'public', entry.src);
    assert.ok(existsSync(audioFile), `Missing generated mp3 file: ${entry.src}`);
    const sizeKB = statSync(audioFile).size / 1024;
    assert.ok(sizeKB > 80 && sizeKB < 800, `MP3 size (${sizeKB.toFixed(1)} KB) out of expected lightweight studio range`);
  }
});
