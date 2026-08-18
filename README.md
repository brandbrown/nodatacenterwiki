# Ahwatukee Data Center Watchdog

A git-backed, agent-driven watchdog that tracks the **MD-PHX1** data center
(Menlo Digital, City of Phoenix case **23-1632**) through Phoenix's zoning and
permitting pipeline. It:

- Maintains a **live timeline** of every checkpoint the project must clear.
- **Scans official + news sources daily** for new filings, documents, and status changes.
- Runs new content through **domain lenses** (acoustic, air/EPA, water, fire, legal) to
  surface compliance concerns and lawful ways to delay or stop the project.
- Publishes a **public, source-linked website** and sends an **internal digest email**
  to organizers when something actually changes.

The strategic thesis: the zoning fight is largely lost (legacy PUD entitlement +
2024 preliminary approval exempted the project from the 2025 ordinance). The real
leverage is at the **permit-compliance** level — especially **air quality permitting**
for 100+ diesel generators (Maricopa County / ADEQ), which carries public comment periods.

## Repository layout

```
content/wiki/       Public knowledge base (Markdown). Agent- and human-editable.
data/timeline.yaml  Canonical checkpoint model -> drives the timeline page.
data/sources.yaml   Sources the scanner monitors.
data/snapshots/     Last-seen hashes per source (committed; enables change detection).
data/changelog/     Dated change records (public "Latest developments" feed).
data/state.json     Scanner/notifier bookkeeping (last scan/notify timestamps).
internal/leads/     Strategic + legal leads (NOT published; feeds the internal email).
agents/             TypeScript: scan.ts, analyze.ts, notify.ts + lib/ + lenses/.
site/               Astro static site (timeline, wiki, changelog).
.github/workflows/  daily.yml (cron pipeline) + deploy.yml (GitHub Pages).
```

## Two output tiers (safety)

- **Public site**: factual, source-linked only. No legal advice.
- **Internal leads + email**: strategic/legal leads for the Alliance's attorney to vet.
  Everything AI-generated is labeled and treated as a draft pending human review.

## Local development

```bash
# Agents
npm install
npm run typecheck
npm run scan       # establish/update source baselines (needs network)
npm run pipeline   # scan -> analyze -> notify (analyze/notify no-op without keys)

# Site
cd site
npm install
ASTRO_TELEMETRY_DISABLED=1 npm run build
ASTRO_TELEMETRY_DISABLED=1 npm run preview
```

Copy `.env.example` to `.env` for local API keys.

## Deploying to GitHub Pages (temporary domain)

1. Push this repo to your personal GitHub (default branch `master`).
2. Repo **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.
3. The `Deploy site` workflow publishes to
   `https://<your-username>.github.io/<repo>/` on every push to `master` that
   touches `site/`, `content/`, or `data/`.

### Enabling scanning + email in CI

In **Settings -> Secrets and variables -> Actions**:

- Secrets: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `DIGEST_RECIPIENTS`
- Variables (optional): `DIGEST_FROM`, `SITE_PUBLIC_URL`

The `Daily scan` workflow runs at ~06:17 America/Phoenix, commits any detected
changes (which re-triggers the deploy), and emails the digest only when something changed.
It runs even without the secrets — it just skips analysis/email and still tracks changes.

## Cutover to wiki.nodatacenterahwatukee.org

When ready to host on the Alliance subdomain:

1. Add a `CNAME` DNS record: `wiki.nodatacenterahwatukee.org -> <your-username>.github.io`.
2. Repo **Settings -> Pages -> Custom domain**: enter `wiki.nodatacenterahwatukee.org`.
3. Because the site is then served from the domain root, set the deploy workflow env
   `SITE_BASE` to `/` and `SITE_URL` to `https://wiki.nodatacenterahwatukee.org`
   (or add a `public/CNAME` file and adjust the workflow).

## Roadmap

- **Phase 5**: SHAPE PHX status via headless browser (Playwright) and an ADEQ adapter
  (their site is behind a WAF that blocks plain HTTP). See `agents/browser/README.md`.
