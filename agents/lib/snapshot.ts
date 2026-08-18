import fs from 'node:fs';
import path from 'node:path';
import { SNAPSHOT_DIR } from './paths';
import { ensureDir, readJson, writeJson } from './util';
import type { Snapshot } from './types';

function snapshotFile(id: string): string {
  return path.join(SNAPSHOT_DIR, `${id}.json`);
}

export function readSnapshot(id: string): Snapshot | null {
  const file = snapshotFile(id);
  if (!fs.existsSync(file)) return null;
  return readJson<Snapshot | null>(file, null);
}

export function writeSnapshot(snap: Snapshot): void {
  ensureDir(SNAPSHOT_DIR);
  writeJson(snapshotFile(snap.id), snap);
}
