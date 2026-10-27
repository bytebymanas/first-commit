export interface ParsedRepo {
  owner: string;
  repo: string;
}

export function validateRepo(input: string): ParsedRepo | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let cleaned = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com' || url.username || url.password || url.search || url.hash) return null;
      cleaned = url.pathname.replace(/^\//, '');
    } catch { return null; }
  } else if (/^(?:www\.)?github\.com\//i.test(trimmed)) return null;
  cleaned = cleaned.replace(/\/$/, '').replace(/\.git$/i, '');
  const parts = cleaned.split('/');
  if (parts.length !== 2) return null;
  const owner = parts[0].trim();
  const repo = parts[1].trim();

  // GitHub user/repo naming rules: alphanumeric with single hyphens/dots/underscores
  const validNameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!validNameRegex.test(owner) || !validNameRegex.test(repo)) {
    return null;
  }

  return { owner, repo };
}
