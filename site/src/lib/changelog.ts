import fs from 'node:fs';
import path from 'node:path';

export interface ChangeEntry {
  id: string;
  date: string; // ISO 8601
  source: string;
  kind: 'genesis' | 'change' | 'new-document' | 'status-change' | string;
  title: string;
  summary: string;
  url?: string;
  domains?: string[];
}

export function loadChangelog(): ChangeEntry[] {
  const dir = path.resolve(process.cwd(), '../data/changelog');
  if (!fs.existsSync(dir)) return [];
  const entries = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as ChangeEntry);
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
