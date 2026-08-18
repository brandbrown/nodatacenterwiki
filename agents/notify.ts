import { Resend } from 'resend';
import { changesSince } from './lib/changelog';
import { loadState, saveState } from './lib/state';
import type { ChangeEntry } from './lib/types';

function recipients(): string[] {
  return (process.env.DIGEST_RECIPIENTS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderHtml(entries: ChangeEntry[], siteUrl: string): string {
  const items = entries
    .map((e) => {
      const date = new Date(e.date).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const domains = (e.domains ?? []).length ? ` · ${(e.domains ?? []).join(', ')}` : '';
      const link = e.url
        ? `<div><a href="${e.url}">View source</a></div>`
        : '';
      return `
        <li style="margin-bottom:16px;">
          <div style="color:#6b7889;font-size:12px;">${date} · ${e.source}${domains}</div>
          <div style="font-weight:600;font-size:15px;">${e.title}</div>
          <div style="color:#333;font-size:14px;">${e.summary}</div>
          ${link}
        </li>`;
    })
    .join('');

  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;">
    <h2 style="margin-bottom:4px;">Ahwatukee Data Center Watchdog — Update</h2>
    <p style="color:#6b7889;font-size:13px;margin-top:0;">
      ${entries.length} new change${entries.length === 1 ? '' : 's'} detected across monitored sources
      (City of Phoenix, Maricopa County Air Quality, ADEQ, developer, and news).
    </p>
    <ul style="list-style:none;padding:0;">${items}</ul>
    <hr style="border:none;border-top:1px solid #e2e2e2;" />
    <p style="color:#6b7889;font-size:12px;">
      Full timeline: <a href="${siteUrl}">${siteUrl}</a><br/>
      Strategic and legal leads for these changes are in the repository under
      <code>internal/leads/</code> (not published). Legal items are research leads for the
      attorney to vet — not advice. This digest is auto-generated; verify time-sensitive items
      (like permit comment windows) against the official source.
    </p>
  </div>`;
}

async function main() {
  const state = loadState();
  const entries = changesSince(state.lastNotifiedAt);

  if (entries.length === 0) {
    console.log('[notify] no new changes since last digest — not sending.');
    return;
  }

  const to = recipients();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DIGEST_FROM ?? 'watchdog@nodatacenterahwatukee.org';
  const siteUrl = process.env.SITE_PUBLIC_URL ?? 'https://nodatacenterahwatukee.org';

  if (!apiKey || to.length === 0) {
    console.log(
      `[notify] would send digest of ${entries.length} change(s) to ${to.length} recipient(s), ` +
        `but ${!apiKey ? 'RESEND_API_KEY' : 'DIGEST_RECIPIENTS'} is not set. Skipping send.`,
    );
    for (const e of entries) console.log(`  - ${e.title}`);
    return;
  }

  const resend = new Resend(apiKey);
  const subject = `Watchdog: ${entries.length} update${entries.length === 1 ? '' : 's'} on the Ahwatukee data center`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: renderHtml(entries, siteUrl),
  });

  if (error) {
    console.error('[notify] Resend error:', error);
    process.exit(1);
  }

  state.lastNotifiedAt = new Date().toISOString();
  saveState(state);
  console.log(`[notify] sent digest of ${entries.length} change(s) to ${to.length} recipient(s).`);
}

main().catch((err) => {
  console.error('[notify] fatal:', err);
  process.exit(1);
});
