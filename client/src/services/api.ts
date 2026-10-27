export interface GitHubRepo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  primaryLanguage: string | null;
  url: string;
  homepage?: string | null;
  license?: string | null;
  defaultBranch?: string;
  updatedAt?: string;
}

export interface RepositoryDocument {
  name: string;
  path: string;
  content: string;
  url: string;
}

export interface RepositoryDocs {
  readme: RepositoryDocument | null;
  contributing: RepositoryDocument | null;
}

export interface GitHubLabel {
  name: string;
  color?: string;
  description?: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  url: string;
  labels: GitHubLabel[];
  commentsCount: number;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
  isPullRequest: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface IssuesResponse {
  repository: GitHubRepo;
  issues: GitHubIssue[];
  totalCount: number;
  rateLimit?: RateLimitInfo;
}

export interface RelevantFile {
  path: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  step: number;
  title: string;
  instruction: string;
  estimatedMinutes?: number;
  fileReference?: string | null;
}

export interface AIAnalysis {
  summary: string;
  whatNeedsToBeDone: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyRationale: string;
  requiredSkills: string[];
  matchingExplanation: string;
  missingSkills: string[];
  prerequisites: string[];
  relevantFiles: RelevantFile[];
  roadmap: RoadmapStep[];
  model?: string;
  isAiGenerated?: boolean;
  terms?: { term: string; definition: string }[];
  clarifyingQuestions?: string[];
  language?: 'english' | 'hinglish';
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function fetchRepositoryDocs(owner: string, repo: string): Promise<RepositoryDocs> {
  const response = await fetch(`${API_BASE_URL}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/docs`);
  if (!response.ok) {
    let message = `Failed to fetch repository documents (${response.status})`;
    try { const data = await response.json(); if (data.message) message = data.message; } catch { /* no JSON message */ }
    throw new ApiError(message, response.status);
  }
  return response.json();
}

export class ApiError extends Error {
  statusCode: number;
  isRateLimit: boolean;
  isNotFound: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isRateLimit = statusCode === 403 || statusCode === 429;
    this.isNotFound = statusCode === 404;
  }
}

/**
 * Fetch open issues for a repository from backend
 */
export async function fetchRepoIssues(
  owner: string,
  repo: string,
  label?: string,
  page: number = 1,
  query?: string
): Promise<IssuesResponse> {
  const params = new URLSearchParams({
    owner,
    repo,
    page: page.toString(),
  });

  if (label && label !== 'all') {
    params.set('label', label);
  }
  if (query?.trim()) {
    params.set('q', query.trim());
  }

  const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMsg = `Failed to fetch issues (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // response is not json
    }
    throw new ApiError(errorMsg, response.status);
  }

  const data: IssuesResponse = await response.json();
  return data;
}

/**
 * Fetch a single issue by number
 */
export async function fetchSingleIssue(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssue> {
  const response = await fetch(
    `${API_BASE_URL}/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${issueNumber}`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    let errorMsg = `Failed to fetch issue #${issueNumber}`;
    try {
      const err = await response.json();
      if (err.message) errorMsg = err.message;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

/**
 * Request AI analysis and contribution roadmap for an issue
 */
export async function analyzeIssue(params: {
  owner: string;
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  labels: string[];
  userSkills: string[];
  language?: 'english' | 'hinglish';
}): Promise<AIAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errorMsg = `Analysis failed (${response.status})`;
    try {
      const err = await response.json();
      if (err.message) errorMsg = err.message;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

/**
 * Send an assistant question to backend
 */
export async function sendChatMessage(
  message: string,
  issueContext?: { owner: string; repo: string; issueNumber: number; title: string },
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      issueContext,
      history,
    }),
  });

  if (!response.ok) {
    let message = `Assistant request failed (${response.status}).`;
    try {
      const error = await response.json();
      if (typeof error.message === 'string') message = error.message;
    } catch {
      // Keep the status-based message if the response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return data.reply;
}

/**
 * ISOLATED PREVIEW-ONLY SAMPLE DATA
 * Strictly used in the Landing Page Product Preview to show an interactive demonstration.
 * Never mixed with real API results.
 */
export function getPreviewSampleData(): {
  repo: GitHubRepo;
  issues: GitHubIssue[];
  analysis: AIAnalysis;
} {
  return {
    repo: {
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      description: 'The library for web and native user interfaces.',
      stars: 231400,
      forks: 46200,
      openIssuesCount: 940,
      primaryLanguage: 'JavaScript',
      url: 'https://github.com/facebook/react',
    },
    issues: [
      {
        id: 991,
        number: 28419,
        title: 'Fix broken link in Hooks reference documentation for useSyncExternalStore',
        body: 'In `packages/react-dom/README.md`, the anchor pointing to the `useSyncExternalStore` subscription contract documentation leads to a 404 page. It should be updated to point to the current beta documentation page.',
        state: 'open',
        url: 'https://github.com/facebook/react/issues/28419',
        labels: [
          { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
          { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' },
        ],
        commentsCount: 3,
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        author: {
          username: 'gaearon',
          avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
        },
        isPullRequest: false,
      },
      {
        id: 992,
        number: 28430,
        title: 'Improve error message when custom hook returns undefined in development build',
        body: 'When an internal debug hook receives undefined options, the console warning message is truncated. We should add a null check and provide an actionable remedy.',
        state: 'open',
        url: 'https://github.com/facebook/react/issues/28430',
        labels: [
          { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
          { name: 'Component: Developer Tools', color: 'd4c5f9', description: '' },
        ],
        commentsCount: 7,
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        author: {
          username: 'acdlite',
          avatarUrl: 'https://avatars.githubusercontent.com/u/3624098?v=4',
        },
        isPullRequest: false,
      },
      {
        id: 993,
        number: 28445,
        title: 'Add TypeScript types test for createPortal container null check',
        body: 'The type definitions for `createPortal` should verify that passing null produces a helpful TypeScript diagnostic error during compile time.',
        state: 'open',
        url: 'https://github.com/facebook/react/issues/28445',
        labels: [
          { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
          { name: 'TypeScript', color: '3178c6', description: 'TypeScript typing updates' },
        ],
        commentsCount: 2,
        createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
        author: {
          username: 'sophiebits',
          avatarUrl: 'https://avatars.githubusercontent.com/u/212022?v=4',
        },
        isPullRequest: false,
      },
    ],
    analysis: {
      summary: 'This issue fixes a broken documentation link in the React DOM package README that currently leads users to a dead 404 page when looking up `useSyncExternalStore`.',
      whatNeedsToBeDone: '1. Locate the broken anchor link in `packages/react-dom/README.md`.\n2. Replace the outdated URL with the valid documentation path.\n3. Run markdown link verification to ensure formatting standards pass.',
      difficulty: 'Beginner',
      difficultyRationale: 'This is a self-contained documentation fix with no complex runtime dependencies or breaking API considerations. Ideal for a developer making their very first open-source pull request.',
      requiredSkills: ['Markdown', 'Git', 'GitHub Flow'],
      matchingExplanation: 'Matches your current skills! You have Markdown and Git listed in your profile. You do not need deep compiler or reconciler knowledge.',
      missingSkills: [],
      prerequisites: ['Basic understanding of Git forks, feature branches, and pull requests'],
      relevantFiles: [
        { path: 'packages/react-dom/README.md', reason: 'Contains the broken anchor URL on line 42', confidence: 'high' },
        { path: 'CONTRIBUTING.md', reason: 'Explains commit message style guide and PR guidelines', confidence: 'high' },
      ],
      roadmap: [
        {
          step: 1,
          title: 'Fork and clone the repository',
          instruction: 'Click Fork on GitHub, then clone your fork locally: `git clone https://github.com/<your-username>/react.git`',
          estimatedMinutes: 5,
          fileReference: null,
        },
        {
          step: 2,
          title: 'Create an isolated feature branch',
          instruction: 'Run `git checkout -b fix-docs-usesyncexternalstore-link` to keep your main branch clean.',
          estimatedMinutes: 2,
          fileReference: null,
        },
        {
          step: 3,
          title: 'Update the link in packages/react-dom/README.md',
          instruction: 'Open `packages/react-dom/README.md`, find the old reference on line 42, and update the URL to `https://react.dev/reference/react/useSyncExternalStore`.',
          estimatedMinutes: 5,
          fileReference: 'packages/react-dom/README.md',
        },
        {
          step: 4,
          title: 'Verify links and preview formatting',
          instruction: 'Preview the markdown file in your editor or run the repo linting checks to confirm there are no syntax or lint errors.',
          estimatedMinutes: 5,
          fileReference: 'packages/react-dom/README.md',
        },
        {
          step: 5,
          title: 'Commit and open your Pull Request',
          instruction: 'Commit your changes with a descriptive message like `docs: fix useSyncExternalStore link (#28419)` and submit a Pull Request referencing issue #28419.',
          estimatedMinutes: 5,
          fileReference: null,
        },
      ],
      model: 'Illustrative sample only',
      isAiGenerated: false,
    },
  };
}
