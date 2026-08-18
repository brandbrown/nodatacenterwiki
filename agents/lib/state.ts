import { STATE_FILE } from './paths';
import { readJson, writeJson } from './util';
import type { RunState } from './types';

export function loadState(): RunState {
  return readJson<RunState>(STATE_FILE, {});
}

export function saveState(state: RunState): void {
  writeJson(STATE_FILE, state);
}
