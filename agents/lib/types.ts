export interface Source {
  id: string;
  title: string;
  type: 'http-json' | 'http-html' | 'http-raw' | 'browser' | 'manual';
  phase: number;
  url: string;
  selector?: string;
  note?: string;
  domains?: string[];
  search_address?: string;
}

export interface Snapshot {
  id: string;
  url: string;
  hash: string;
  length: number;
  preview: string; // first N chars of extracted text, for diffing/context
  fetchedAt: string; // ISO
}

export interface ChangeEntry {
  id: string;
  date: string; // ISO
  source: string; // human label or source id
  sourceId?: string;
  kind: 'genesis' | 'change' | 'new-document' | 'status-change' | string;
  title: string;
  summary: string;
  url?: string;
  domains?: string[];
  analyzed?: boolean;
}

export interface RunState {
  lastScanAt?: string;
  lastNotifiedAt?: string;
}
