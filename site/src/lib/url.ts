// Build an internal href that respects the configured base path
// (needed for GitHub Pages project sites served under /<repo>/).
export function withBase(pathname: string): string {
  const base = import.meta.env.BASE_URL; // always ends with '/'
  const cleaned = pathname.replace(/^\//, '');
  return (base + cleaned).replace(/([^:]\/)\/+/g, '$1');
}
