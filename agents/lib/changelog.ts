import fs from 'node:fs';
import path from 'node:path';
import { CHANGELOG_DIR } from './paths';
import { ensureDir, writeJson, readJson } from './util';
import type { ChangeEntry } from './types';

export function listChanges(): { file: string; entry: ChangeEntry }[] {
  if (!fs.existsSync(CHANGELOG_DIR)) return [];
  return fs
    .readdirSync(CHANGELOG_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const file = path.join(CHANGELOG_DIR, f);
      return { file, entry: readJson<ChangeEntry>(file, {} as ChangeEntry) };
    })
    .filter((x) => x.entry && x.entry.id)
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date));
}

export function appendChange(entry: ChangeEntry): string {
  ensureDir(CHANGELOG_DIR);
  const file = path.join(CHANGELOG_DIR, `${entry.id}.json`);
  writeJson(file, entry);
  return file;
}

export function updateChange(file: string, entry: ChangeEntry): void {
  writeJson(file, entry);
}

export function unanalyzedChanges(): { file: string; entry: ChangeEntry }[] {
  return listChanges().filter(
    (x) => x.entry.kind !== 'genesis' && x.entry.analyzed !== true,
  );
}

export function changesSince(iso: string | undefined): ChangeEntry[] {
  const all = listChanges().map((x) => x.entry).filter((e) => e.kind !== 'genesis');
  if (!iso) return all;
  return all.filter((e) => e.date > iso);
}
