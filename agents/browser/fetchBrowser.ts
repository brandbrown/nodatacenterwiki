import { normalizeText } from '../lib/util';
import type { Source } from '../lib/types';
import type { FetchResult } from '../lib/fetchSource';

// Phase 5 adapter for JavaScript-heavy / WAF-protected sources (SHAPE PHX's
// Salesforce SPA, ADEQ behind a bot filter). Playwright is imported lazily so
// the default pipeline stays lightweight and does not require a browser download.
//
// To enable locally / in CI:
//   npm i -D playwright && npx playwright install --with-deps chromium
export async function fetchBrowser(source: Source): Promise<FetchResult> {
  // Untyped dynamic import so the default build/typecheck doesn't require the
  // (optional, heavy) playwright dependency.
  let chromium: any;
  try {
    const pw: any = await import(/* @vite-ignore */ 'playwright' as any);
    chromium = pw.chromium;
  } catch {
    return {
      ok: false,
      error:
        'playwright not installed. Run: npm i -D playwright && npx playwright install chromium',
    };
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    });
    await page.goto(source.url, { waitUntil: 'networkidle', timeout: 45000 });

    // If a search address is provided (SHAPE PHX), attempt a best-effort lookup.
    if (source.search_address) {
      try {
        const box = page.getByRole('searchbox').first();
        await box.fill(source.search_address, { timeout: 8000 });
        await box.press('Enter');
        await page.waitForTimeout(4000);
      } catch {
        // Non-fatal: fall back to whatever the landing page shows.
      }
    }

    const selector = source.selector?.trim() || 'body';
    const raw = await page.content();
    let text: string;
    try {
      text = normalizeText((await page.locator(selector).first().innerText()) ?? '');
    } catch {
      text = normalizeText(await page.locator('body').innerText());
    }
    return { ok: true, status: 200, raw, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  } finally {
    await browser.close();
  }
}
