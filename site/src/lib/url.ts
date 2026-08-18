// Build an internal href that respects the configured base path
// (needed for GitHub Pages project sites served under /<repo>/).
export function withBase(pathname: string): string {
  const raw = import.meta.env.BASE_URL || '/';
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  const cleaned = pathname.replace(/^\/+/, '');
  if (!cleaned) return base;
  return `${base}${cleaned}`;
}
