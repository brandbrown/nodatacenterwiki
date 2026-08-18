import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type Status =
  | 'done'
  | 'in_progress'
  | 'pending'
  | 'contested'
  | 'blocked';

export interface Checkpoint {
  title: string;
  status: Status;
  date?: string;
  note?: string;
  sources?: string[];
}

export interface CommunityAction {
  title: string;
  how: string;
  priority?: 'high' | 'normal';
}

export interface LegalNote {
  title: string;
  note: string;
}

export interface Stage {
  id: string;
  title: string;
  status: Status;
  summary?: string;
  checkpoints: Checkpoint[];
  community?: CommunityAction[];
  legal?: LegalNote[];
}

export interface ProjectMeta {
  name: string;
  case: string;
  address: string;
  developer: string;
  scale: string;
  developer_targets?: string;
  summary: string;
  last_updated: string;
}

export interface Timeline {
  project: ProjectMeta;
  stages: Stage[];
}

export function loadTimeline(): Timeline {
  const file = path.resolve(process.cwd(), '../data/timeline.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  return yaml.load(raw) as Timeline;
}

export function progress(timeline: Timeline): {
  done: number;
  total: number;
  pct: number;
} {
  let done = 0;
  let total = 0;
  for (const stage of timeline.stages) {
    for (const cp of stage.checkpoints ?? []) {
      total += 1;
      if (cp.status === 'done') done += 1;
    }
  }
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

export const STATUS_LABEL: Record<Status, string> = {
  done: 'Complete',
  in_progress: 'In correction / review',
  pending: 'Not yet reached',
  contested: 'Contested',
  blocked: 'Denied / stalled',
};

export const STATUS_LEGEND: { status: Status; label: string }[] = [
  { status: 'done', label: 'Complete' },
  { status: 'in_progress', label: 'In review' },
  { status: 'pending', label: 'Upcoming' },
  { status: 'blocked', label: 'Denied / stalled' },
];

export function openCommunityActions(timeline: Timeline): {
  stage: Stage;
  action: CommunityAction;
}[] {
  const items: { stage: Stage; action: CommunityAction }[] = [];
  for (const stage of timeline.stages) {
    if (stage.status === 'done') continue;
    for (const action of stage.community ?? []) {
      items.push({ stage, action });
    }
  }
  return items.sort((a, b) => {
    const pa = a.action.priority === 'high' ? 0 : 1;
    const pb = b.action.priority === 'high' ? 0 : 1;
    return pa - pb;
  });
}
