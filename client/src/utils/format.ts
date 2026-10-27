export interface ParsedRepo {
  owner: string;
  repo: string;
  fullName: string;
}

/**
 * Validates and extracts owner and repo from a GitHub URL or string
 */
export function parseRepoInput(input: string): ParsedRepo | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let cleaned = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com' || url.username || url.password || url.search || url.hash) return null;
      cleaned = url.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  } else if (trimmed.includes('/') && /^(?:www\.)?github\.com\//i.test(trimmed)) {
    return null;
  }

  cleaned = cleaned.replace(/\/$/, '').replace(/\.git$/i, '');
  const match = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2];

  // Prevent reserved or empty paths
  if (!owner || !repo) return null;

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`
  };
}

/**
 * Formats numbers into human-readable compact notation (e.g. 1.2k, 45k)
 */
export function formatNumber(n: number | undefined | null): string {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString();
}

/**
 * Formats ISO date into relative or concise calendar date
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateString;
  }
}

/**
 * Checks if a label represents a beginner-friendly tag
 */
export function isBeginnerLabel(labelName: string): boolean {
  const normalized = labelName.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
  const beginnerPatterns = [
    'good first issue',
    'good first bug',
    'first timers only',
    'beginner friendly',
    'starter',
    'easy',
    'help wanted',
    'documentation',
    'docs',
    'up for grabs',
    'low hanging fruit',
    'newbie',
    'level:easy'
  ];

  return beginnerPatterns.some(pattern => normalized.includes(pattern));
}

/**
 * Returns accessible, harmonious styling classes for GitHub labels
 * Adhering to the Black + Warm White + Lime aesthetic (NO blue/purple)
 */
export function getLabelStyle(labelName: string, _hexColor?: string) {
  const lower = labelName.toLowerCase();

  if (isBeginnerLabel(labelName)) {
    return {
      bg: 'bg-[#D4FF00]/15 text-[#111214] border-[#D4FF00]/40 font-medium',
      dot: 'bg-[#D4FF00]',
      isPrimary: true
    };
  }

  if (lower.includes('bug') || lower.includes('error')) {
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      isPrimary: false
    };
  }

  if (lower.includes('feature') || lower.includes('enhancement')) {
    return {
      bg: 'bg-[#111214] text-[#F5F4F0] border-[#28292B]',
      dot: 'bg-[#D4FF00]',
      isPrimary: false
    };
  }

  if (lower.includes('doc') || lower.includes('guide')) {
    return {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      dot: 'bg-amber-500',
      isPrimary: false
    };
  }

  return {
    bg: 'bg-[#F1EFEA] text-[#151619] border-[#E6E1D8]',
    dot: 'bg-[#74777D]',
    isPrimary: false
  };
}

/**
 * Difficulty indicator styles: Lime for Beginner, warm neutral for Intermediate, Dark for Advanced
 */
export function getDifficultyColor(difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string) {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return {
        badge: 'bg-[#D4FF00]/20 text-[#111214] border-[#D4FF00]/50 font-semibold',
        text: 'text-[#111214]',
        indicator: 'bg-[#D4FF00]'
      };
    case 'intermediate':
      return {
        badge: 'bg-[#F1EFEA] text-[#151619] border-[#E6E1D8] font-medium',
        text: 'text-[#151619]',
        indicator: 'bg-[#74777D]'
      };
    case 'advanced':
      return {
        badge: 'bg-[#111214] text-[#F5F4F0] border-[#28292B] font-medium',
        text: 'text-[#F5F4F0]',
        indicator: 'bg-[#D4FF00]'
      };
    default:
      return {
        badge: 'bg-[#F1EFEA] text-[#151619] border-[#E6E1D8]',
        text: 'text-[#74777D]',
        indicator: 'bg-[#74777D]'
      };
  }
}

/**
 * Truncates string cleanly at word boundary
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  const sub = text.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 0 ? sub.slice(0, lastSpace) : sub) + '...';
}
