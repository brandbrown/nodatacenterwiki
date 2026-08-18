import crypto from 'node:crypto';
import fs from 'node:fs';

export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Collapse whitespace so trivial reformatting doesn't trigger false "changes".
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Filesystem-safe timestamp for filenames, e.g. 2026-08-17T21-05-33.
export function fsTimestamp(d = new Date()): string {
  return d.toISOString().replace(/:/g, '-').replace(/\..+$/, '');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
