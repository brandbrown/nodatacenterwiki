# Phase 5: headless-browser sources

Some sources cannot be read with a plain HTTP GET:

- **SHAPE PHX** (`shapephx.phoenix.gov`) is a Salesforce Lightning single-page app;
  status only appears after JavaScript runs.
- **ADEQ** (`azdeq.gov`) sits behind a WAF that returns `403` to non-browser clients.

These are marked `type: browser`, `phase: 5` in `data/sources.yaml` and are handled by
`fetchBrowser.ts` using Playwright.

## Enable

```bash
npm i -D playwright
npx playwright install --with-deps chromium
SCAN_PHASE=5 npm run scan
```

In CI, run the `Daily scan` workflow with the `scan_phase` input set to `5` (after adding
the Playwright install steps), or add a dedicated weekly workflow.

## Notes

- SHAPE PHX lookup is best-effort: it fills the first search box with the site address and
  reads the results region. Selectors may need tuning as the portal changes.
- Keep Phase 5 on a slower cadence (e.g., weekly) than the Phase 2 HTTP scan to limit cost
  and flakiness.
