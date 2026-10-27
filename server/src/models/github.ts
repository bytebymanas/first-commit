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
