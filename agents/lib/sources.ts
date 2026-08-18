import fs from 'node:fs';
import yaml from 'js-yaml';
import { SOURCES_FILE } from './paths';
import type { Source } from './types';

export function loadSources(): Source[] {
  const raw = fs.readFileSync(SOURCES_FILE, 'utf8');
  const doc = yaml.load(raw) as { sources?: Source[] };
  return doc.sources ?? [];
}

// The scanner runs sources whose phase is <= the active scan phase.
// Browser-type sources only run at phase >= 5 (they need Playwright).
export function activeSources(scanPhase: number): Source[] {
  return loadSources().filter((s) => {
    if (s.type === 'manual') return false;
    if (s.phase > scanPhase) return false;
    if (s.type === 'browser') return scanPhase >= 5;
    return true;
  });
}

// Government registries where the project name appearing is itself a strong signal
// (unlike the org/developer/news pages, which always mention it).
export const GENERIC_GOV_SOURCES = new Set([
  'maricopa-air-permits',
  'maricopa-permit-reports',
  'adeq-permits',
  'phoenix-council-agendas',
  'pdd-online-case',
]);

// Keywords that indicate the project may have surfaced on a generic government page.
export const PROJECT_KEYWORDS = [
  'thistle',
  'menlo',
  '23-1632',
  'data center',
  'datacenter',
  '4801',
  '4811',
];

export function matchProjectKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return PROJECT_KEYWORDS.filter((k) => lower.includes(k));
}
