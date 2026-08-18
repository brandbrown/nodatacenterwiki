import {
  activeSources,
  GENERIC_GOV_SOURCES,
  matchProjectKeywords,
} from './lib/sources';
import { fetchSource } from './lib/fetchSource';
import { fetchBrowser } from './browser/fetchBrowser';
import { readSnapshot, writeSnapshot } from './lib/snapshot';
import { appendChange } from './lib/changelog';
import { loadState, saveState } from './lib/state';
import { sha256, fsTimestamp } from './lib/util';
import type { ChangeEntry, Snapshot } from './lib/types';

const SCAN_PHASE = Number(process.env.SCAN_PHASE ?? '2');
const PREVIEW_LEN = 600;

async function main() {
  const sources = activeSources(SCAN_PHASE);
  console.log(`[scan] phase=${SCAN_PHASE}, sources=${sources.length}`);

  let changed = 0;
  let baselined = 0;
  let errored = 0;

  for (const source of sources) {
    const result =
      source.type === 'browser' ? await fetchBrowser(source) : await fetchSource(source);
    if (!result.ok) {
      errored += 1;
      console.warn(`[scan] ! ${source.id}: fetch failed (${result.error})`);
      continue;
    }

    const hash = sha256(result.text);
    const prev = readSnapshot(source.id);
    const snap: Snapshot = {
      id: source.id,
      url: source.url,
      hash,
      length: result.text.length,
      preview: result.text.slice(0, PREVIEW_LEN),
      fetchedAt: new Date().toISOString(),
    };

    if (!prev) {
      writeSnapshot(snap);
      baselined += 1;
      console.log(`[scan] = ${source.id}: baseline established (${snap.length} chars)`);
      continue;
    }

    if (prev.hash === hash) {
      console.log(`[scan] . ${source.id}: no change`);
      continue;
    }

    // Change detected.
    writeSnapshot(snap);
    changed += 1;

    // Escalate if the project appears to surface on a generic government page.
    const matched = GENERIC_GOV_SOURCES.has(source.id)
      ? matchProjectKeywords(result.text)
      : [];
    const isMatch = matched.length > 0;

    const id = `${fsTimestamp()}-${source.id}`;
    const entry: ChangeEntry = {
      id,
      date: new Date().toISOString(),
      source: source.title,
      sourceId: source.id,
      kind: isMatch ? 'possible-match' : 'change',
      title: isMatch
        ? `POSSIBLE PROJECT MATCH: ${source.title}`
        : `Change detected: ${source.title}`,
      summary: isMatch
        ? `This government source changed AND now mentions project keywords ` +
          `(${matched.join(', ')}). This may be a direct sign of the project advancing ` +
          `(e.g., a new filing or public notice). Review promptly. Preview: ` +
          `"${snap.preview.slice(0, 240).trim()}..."`
        : `The monitored content at this source changed since the last scan. ` +
          `Automated analysis will summarize what changed. Preview: ` +
          `"${snap.preview.slice(0, 240).trim()}..."`,
      url: source.url,
      domains: source.domains ?? [],
      analyzed: false,
    };
    appendChange(entry);
    console.log(
      `[scan] ${isMatch ? '!!' : '*'} ${source.id}: ${entry.kind.toUpperCase()} recorded -> ${id}`,
    );
  }

  const state = loadState();
  state.lastScanAt = new Date().toISOString();
  saveState(state);

  console.log(
    `[scan] done. changed=${changed} baselined=${baselined} errored=${errored}`,
  );
}

main().catch((err) => {
  console.error('[scan] fatal:', err);
  process.exit(1);
});
