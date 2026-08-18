import path from 'node:path';

// Agents are always invoked from the repo root (see package.json scripts).
export const ROOT = process.cwd();

export const DATA_DIR = path.join(ROOT, 'data');
export const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshots');
export const CHANGELOG_DIR = path.join(DATA_DIR, 'changelog');
export const SOURCES_FILE = path.join(DATA_DIR, 'sources.yaml');
export const TIMELINE_FILE = path.join(DATA_DIR, 'timeline.yaml');
export const STATE_FILE = path.join(DATA_DIR, 'state.json');

export const CONTENT_WIKI_DIR = path.join(ROOT, 'content', 'wiki');
export const INTERNAL_LEADS_DIR = path.join(ROOT, 'internal', 'leads');
