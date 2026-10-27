import { config } from '../config/env.js';
import { GitHubRepo, GitHubIssue, IssuesResponse, RateLimitInfo, RepositoryDocs, RepositoryDocument } from '../models/github.js';
import { logger } from '../utils/logger.js';

export class GitHubService {
  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FirstCommit-Onboarding-App',
    };

    if (config.githubToken) {
      headers['Authorization'] = `Bearer ${config.githubToken}`;
    }

    return headers;
  }

  private static parseRateLimit(response: globalThis.Response): RateLimitInfo | undefined {
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
    return undefined;
  }

  /**
   * Fetch repository metadata
   */
  public static async fetchRepo(owner: string, repo: string): Promise<{ repo: GitHubRepo; rateLimit?: RateLimitInfo }> {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    logger.info(`Fetching repository metadata: ${url}`);

    const response = await fetch(url, { headers: this.getHeaders() });
    const rateLimit = this.parseRateLimit(response);

    if (response.status === 404) {
      const err: any = new Error(`Repository "${owner}/${repo}" was not found on GitHub.`);
      err.statusCode = 404;
      throw err;
    }

    if (response.status === 403 || response.status === 429) {
      const err: any = new Error('GitHub API rate limit exceeded. Please wait or set a GITHUB_TOKEN.');
      err.statusCode = response.status;
      err.isRateLimit = true;
      throw err;
    }

    if (!response.ok) {
      const err: any = new Error(`GitHub API responded with status ${response.status}`);
      err.statusCode = response.status;
      throw err;
    }

    const data: any = await response.json();

    const repoData: GitHubRepo = {
      owner: data.owner?.login || owner,
      name: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      description: data.description || null,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssuesCount: data.open_issues_count || 0,
      primaryLanguage: data.language || null,
      url: data.html_url || `https://github.com/${owner}/${repo}`,
      homepage: data.homepage || null,
      license: data.license?.name || null,
      defaultBranch: data.default_branch,
      updatedAt: data.updated_at,
    };

    return { repo: repoData, rateLimit };
  }

  /** Fetch README and the first available common contribution guide path. */
  public static async fetchRepositoryDocs(owner: string, repo: string): Promise<RepositoryDocs> {
    const baseUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const getDocument = async (endpoint: string): Promise<RepositoryDocument | null> => {
      const response = await fetch(`${baseUrl}/${endpoint}`, { headers: this.getHeaders() });
      if (response.status === 404) return null;
      if (response.status === 403 || response.status === 429) {
        const err = new Error('GitHub API rate limit exceeded. Please wait or set a GITHUB_TOKEN.') as Error & { statusCode: number; isRateLimit: boolean };
        err.statusCode = response.status;
        err.isRateLimit = true;
        throw err;
      }
      if (!response.ok) {
        const err = new Error(`GitHub API responded with status ${response.status}`) as Error & { statusCode: number };
        err.statusCode = response.status;
        throw err;
      }
      const data = await response.json() as { name: string; path: string; content?: string; encoding?: string; html_url: string };
      const content = data.encoding === 'base64' && data.content ? Buffer.from(data.content, 'base64').toString('utf8') : (data.content || '');
      return { name: data.name, path: data.path, content, url: data.html_url };
    };

    const readme = await getDocument('readme');
    let contributing: RepositoryDocument | null = null;
    for (const path of ['CONTRIBUTING.md', '.github/CONTRIBUTING.md', 'docs/CONTRIBUTING.md']) {
      contributing = await getDocument(`contents/${path.split('/').map(encodeURIComponent).join('/')}`);
      if (contributing) break;
    }
    return { readme, contributing };
  }

  /**
   * Fetch open issues for a repository
   */
  public static async fetchIssues(
    owner: string,
    repo: string,
    label?: string,
    page: number = 1,
    perPage: number = 30
  ): Promise<IssuesResponse> {
    const { repo: repository, rateLimit } = await this.fetchRepo(owner, repo);

    const params = new URLSearchParams({
      state: 'open',
      sort: 'updated',
      direction: 'desc',
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (label && label.toLowerCase() !== 'all') {
      params.set('labels', label);
    }

    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?${params.toString()}`;
    logger.info(`Fetching issues from: ${url}`);

    const response = await fetch(url, { headers: this.getHeaders() });
    const issuesRateLimit = this.parseRateLimit(response) || rateLimit;

    if (!response.ok) {
      const err: any = new Error(`Failed to fetch issues: GitHub returned ${response.status}`);
      err.statusCode = response.status;
      throw err;
    }

    const rawData: any = await response.json();

    if (!Array.isArray(rawData)) {
      return {
        repository,
        issues: [],
        totalCount: 0,
        rateLimit: issuesRateLimit,
      };
    }

    // Filter out pull requests (GitHub issues endpoint includes PRs unless filtered)
    const issues: GitHubIssue[] = rawData
      .filter((item: any) => !item.pull_request)
      .map((item: any) => ({
        id: item.id,
        number: item.number,
        title: item.title,
        body: item.body || null,
        state: item.state,
        url: item.html_url,
        labels: (item.labels || []).map((l: any) => ({
          name: typeof l === 'string' ? l : l.name,
          color: typeof l === 'object' ? l.color : undefined,
          description: typeof l === 'object' ? l.description : undefined,
        })),
        commentsCount: item.comments || 0,
        createdAt: item.created_at,
        author: {
          username: item.user?.login || 'unknown',
          avatarUrl: item.user?.avatar_url,
        },
        isPullRequest: false,
      }));

    return {
      repository,
      issues,
      totalCount: issues.length,
      rateLimit: issuesRateLimit,
    };
  }

  /** Search open issues in a selected public repository using GitHub's issue index. */
  public static async searchIssues(
    owner: string,
    repo: string,
    query: string,
    label?: string,
    page: number = 1
  ): Promise<IssuesResponse> {
    const { repo: repository } = await this.fetchRepo(owner, repo);
    const safeQuery = query.trim().replace(/["\\]/g, ' ').replace(/\s+/g, ' ');
    const isRepositoryLanguage = repository.primaryLanguage?.toLowerCase() === query.trim().toLowerCase();
    const terms = [
      ...(isRepositoryLanguage ? [] : [`"${safeQuery}"`]),
      `repo:${repository.fullName}`,
      'is:issue',
      'is:open',
    ];
    if (label && label.toLowerCase() !== 'all') {
      terms.push(`label:"${label.replace(/["\\]/g, '')}"`);
    }

    const params = new URLSearchParams({ q: terms.join(' '), sort: 'updated', order: 'desc', page: String(page), per_page: '30' });
    const response = await fetch(`https://api.github.com/search/issues?${params}`, { headers: this.getHeaders() });
    const rateLimit = this.parseRateLimit(response);
    if (response.status === 403 || response.status === 429) {
      const err = new Error('GitHub issue search is rate limited. Please wait for the search quota to reset.') as Error & { statusCode: number; isRateLimit: boolean };
      err.statusCode = response.status;
      err.isRateLimit = true;
      throw err;
    }
    if (!response.ok) {
      const err = new Error(`GitHub issue search returned status ${response.status}.`) as Error & { statusCode: number };
      err.statusCode = response.status;
      throw err;
    }

    const data = await response.json() as { total_count?: number; items?: any[] };
    const issues: GitHubIssue[] = (data.items || []).map((item: any) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      body: item.body || null,
      state: item.state,
      url: item.html_url,
      labels: (item.labels || []).map((entry: any) => ({
        name: typeof entry === 'string' ? entry : entry.name,
        color: typeof entry === 'object' ? entry.color : undefined,
        description: typeof entry === 'object' ? entry.description : undefined,
      })),
      commentsCount: item.comments || 0,
      createdAt: item.created_at,
      author: { username: item.user?.login || 'unknown', avatarUrl: item.user?.avatar_url },
      isPullRequest: Boolean(item.pull_request),
    }));

    return { repository, issues, totalCount: data.total_count || 0, rateLimit };
  }

  /**
   * Fetch a single issue by number
   */
  public static async fetchIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (response.status === 404) {
      const err: any = new Error(`Issue #${issueNumber} not found in ${owner}/${repo}`);
      err.statusCode = 404;
      throw err;
    }

    if (!response.ok) {
      const err: any = new Error(`GitHub API responded with status ${response.status}`);
      err.statusCode = response.status;
      throw err;
    }

    const item: any = await response.json();

    return {
      id: item.id,
      number: item.number,
      title: item.title,
      body: item.body || null,
      state: item.state,
      url: item.html_url,
      labels: (item.labels || []).map((l: any) => ({
        name: typeof l === 'string' ? l : l.name,
        color: typeof l === 'object' ? l.color : undefined,
        description: typeof l === 'object' ? l.description : undefined,
      })),
      commentsCount: item.comments || 0,
      createdAt: item.created_at,
      author: {
        username: item.user?.login || 'unknown',
        avatarUrl: item.user?.avatar_url,
      },
      isPullRequest: !!item.pull_request,
    };
  }
}
