import * as cheerio from 'cheerio';
import { normalizeText } from './util';
import type { Source } from './types';

const USER_AGENT =
  'NoDataCenterAhwatukeeWatchdog/0.1 (+https://nodatacenterahwatukee.org; community watchdog)';

export interface FetchOk {
  ok: true;
  text: string;
  raw: string;
  status: number;
}
export interface FetchErr {
  ok: false;
  error: string;
  status?: number;
}
export type FetchResult = FetchOk | FetchErr;

async function httpGet(url: string, timeoutMs = 25000): Promise<{ status: number; body: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/json,*/*' },
      signal: controller.signal,
      redirect: 'follow',
    });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

// Fetch a source and return the meaningful, normalized text used for change detection.
export async function fetchSource(source: Source): Promise<FetchResult> {
  try {
    const { status, body } = await httpGet(source.url);
    if (status >= 400) {
      return { ok: false, error: `HTTP ${status}`, status };
    }

    if (source.type === 'http-json') {
      // Stable stringify: normalize whitespace of the raw JSON text.
      return { ok: true, status, raw: body, text: normalizeText(body) };
    }

    if (source.type === 'http-raw') {
      return { ok: true, status, raw: body, text: normalizeText(body) };
    }

    // http-html: extract text from the selector (default: body).
    const $ = cheerio.load(body);
    $('script, style, noscript, svg').remove();
    const selector = source.selector && source.selector.trim() ? source.selector : 'body';
    const scope = $(selector);
    const text = normalizeText((scope.length ? scope : $('body')).text());
    return { ok: true, status, raw: body, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
