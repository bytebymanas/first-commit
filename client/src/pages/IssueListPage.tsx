import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Info,
  GitBranch,
} from 'lucide-react';
import { RepositoryHeader } from '../components/RepositoryHeader';
import { IssueCard } from '../components/IssueCard';
import { fetchRepoIssues, fetchRepositoryDocs, RepositoryDocs, GitHubRepo, GitHubIssue, ApiError, RateLimitInfo } from '../services/api';
import { isBeginnerLabel } from '../utils/format';

interface IssueListPageProps {
  owner: string;
  repo: string;
  onSelectIssue: (issue: GitHubIssue) => void;
  onChangeRepo: () => void;
}

const FILTER_TAGS = [
  { id: 'all', label: 'All Issues' },
  { id: 'good first issue', label: 'Good First Issue' },
  { id: 'help wanted', label: 'Help Wanted' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'bug', label: 'Bugs' },
];

export const IssueListPage: React.FC<IssueListPageProps> = ({
  owner,
  repo,
  onSelectIssue,
  onChangeRepo,
}) => {
  const [repository, setRepository] = useState<GitHubRepo | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isRateLimit?: boolean; isNotFound?: boolean } | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [docs, setDocs] = useState<RepositoryDocs | null>(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  const loadIssues = async (filterLabel: string = activeFilter, query: string = submittedQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchRepoIssues(owner, repo, filterLabel, 1, query);
      setRepository(data.repository);
      setIssues(data.issues || []);
      if (data.rateLimit) {
        setRateLimit(data.rateLimit);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError({
          message: err.message,
          isRateLimit: err.isRateLimit,
          isNotFound: err.isNotFound,
        });
      } else {
        setError({
          message: err?.message || 'An unexpected error occurred while fetching issues.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues(activeFilter, submittedQuery);
  }, [owner, repo, activeFilter, submittedQuery]);

  const loadDocs = async () => {
    setDocsLoading(true);
    setDocsError(null);
    try { setDocs(await fetchRepositoryDocs(owner, repo)); }
    catch (err) { setDocsError(err instanceof Error ? err.message : 'Unable to load repository documents.'); }
    finally { setDocsLoading(false); }
  };

  useEffect(() => { loadDocs(); }, [owner, repo]);

  // Filter issues locally by search query and sort beginner-friendly issues to top
  const filteredIssues = issues
    .filter((issue) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = issue.title.toLowerCase().includes(q);
      const inBody = (issue.body || '').toLowerCase().includes(q);
      const inNumber = issue.number.toString().includes(q);
      const inLabels = issue.labels.some((l) => l.name.toLowerCase().includes(q));
      const inRepository = `${repository?.fullName || ''} ${repository?.primaryLanguage || ''}`.toLowerCase().includes(q);
      return inTitle || inBody || inNumber || inLabels || inRepository;
    })
    .sort((a, b) => {
      // Prioritize beginner labels
      const aIsBeginner = a.labels.some((l) => isBeginnerLabel(l.name));
      const bIsBeginner = b.labels.some((l) => isBeginnerLabel(l.name));
      if (aIsBeginner && !bIsBeginner) return -1;
      if (!aIsBeginner && bIsBeginner) return 1;
      return 0;
    });

  return (
    <div className="w-full min-h-screen bg-[#FBFBF9] pb-24">
      {/* Repository Header */}
      {repository ? (
        <RepositoryHeader
          repo={repository}
          onChangeRepo={onChangeRepo}
          onRefresh={() => loadIssues(activeFilter)}
          isLoading={isLoading}
        />
      ) : (
        <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <span className="font-mono text-lg font-bold text-slate-800">
                {owner}/{repo}
              </span>
            </div>
            <button
              onClick={onChangeRepo}
              className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100"
            >
              Change repo
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {repository && (
          <section className="mb-8 grid gap-4 md:grid-cols-2" aria-label="Repository documentation">
            {(['readme', 'contributing'] as const).map((kind) => {
              const document = docs?.[kind];
              const title = kind === 'readme' ? 'README' : 'Contribution guidelines';
              return (
                <details key={kind} className="group rounded-xl border border-slate-200 bg-white shadow-subtle" open={kind === 'readme'}>
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{title}</span>
                    {document && <a href={document.url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="text-xs text-blue-700 hover:underline">View on GitHub</a>}
                  </summary>
                  <div className="px-5 pb-5">
                    {docsLoading ? <p className="text-sm text-slate-500">Loading {title.toLowerCase()}…</p>
                      : docsError ? <div className="text-sm text-rose-700"><p>{docsError}</p><button onClick={loadDocs} className="mt-2 underline">Retry</button></div>
                      : document ? <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">{document.content.slice(0, 12000)}{document.content.length > 12000 ? '\n\n… Preview truncated. Open the full document on GitHub.' : ''}</pre>
                      : <p className="text-sm text-slate-500">No {title.toLowerCase()} was found in the common repository locations.</p>}
                  </div>
                </details>
              );
            })}
          </section>
        )}
        {/* Rate limit warning banner if applicable */}
        {error?.isRateLimit && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block text-sm mb-0.5">GitHub API Rate Limit Reached</span>
              <p>
                GitHub has temporarily limited this request. Wait before retrying, or configure an optional <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">GITHUB_TOKEN</code> on the server for a higher quota.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => loadIssues(activeFilter)}
                  className="font-medium text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded transition-colors"
                >
                  Retry Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Repository Not Found Error */}
        {error?.isNotFound && (
          <div className="mb-6 p-8 rounded-xl bg-white border border-slate-300 text-center max-w-lg mx-auto shadow-subtle">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Repository Not Found
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              We couldn't find a public GitHub repository at <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{owner}/{repo}</code>. Please make sure the owner and repository name are spelled correctly and the repo is publicly accessible.
            </p>
            <button
              onClick={onChangeRepo}
              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              Search Another Repository
            </button>
          </div>
        )}

        {/* Generic Error */}
        {error && !error.isRateLimit && !error.isNotFound && (
          <div className="mb-6 p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Unable to load issues</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error.message}</p>
              </div>
            </div>
            <button
              onClick={() => loadIssues(activeFilter)}
              className="text-xs font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Toolbar: Filters and Search */}
        {!error?.isNotFound && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-mono">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveFilter(tag.id)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                    activeFilter === tag.id
                      ? 'bg-[#0A1428] text-white border-[#0A1428] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Keyword search input */}
            <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(searchQuery.trim()); }} className="flex gap-2 w-full sm:w-auto shrink-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GitHub issues or technology"
                aria-label="Search GitHub issues by keyword or technology"
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSubmittedQuery(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  Clear
                </button>
              )}
            </div>
            <button type="submit" className="shrink-0 text-xs font-medium text-white bg-[#0A1428] hover:bg-slate-700 px-3 py-2 rounded-lg">Search</button>
            </form>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-12 h-4 rounded animate-shimmer" />
                  <div className="w-24 h-4 rounded-full animate-shimmer" />
                </div>
                <div className="w-3/4 h-5 rounded mb-2.5 animate-shimmer" />
                <div className="w-1/2 h-3.5 rounded mb-4 animate-shimmer" />
                <div className="flex gap-2">
                  <div className="w-16 h-4 rounded animate-shimmer" />
                  <div className="w-20 h-4 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State: No issues found */}
        {!isLoading && !error && filteredIssues.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-subtle">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-900 mb-1">
              No open issues matched your criteria
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {searchQuery
                ? `No issues matched the keyword "${searchQuery}". Try clearing your search.`
                : activeFilter !== 'all'
                ? `There are no open issues tagged with "${activeFilter}" in this repository right now.`
                : 'This repository currently has no open issues.'}
            </p>
            <div className="flex justify-center gap-3">
              {(activeFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); setSubmittedQuery(''); }}
                  className="text-xs font-mono font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors"
                >
                  Show other open issues in this repository
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-lg transition-colors"
                >
                  Clear search query
                </button>
              )}
            </div>
          </div>
        )}

        {/* Issues List */}
        {!isLoading && !error && filteredIssues.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2 px-1">
              <span>Showing {filteredIssues.length} open issues</span>
              <span className="flex items-center gap-1 text-emerald-700" title="Labels are maintainer-applied and do not guarantee issue difficulty.">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Issues with beginner-oriented labels shown first
              </span>
            </div>

            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onSelect={(iss) => onSelectIssue(iss)}
              />
            ))}
          </div>
        )}

        {/* Rate limit status pill at bottom */}
        {rateLimit && (
          <div className="mt-8 text-center">
            <span className="font-mono text-[11px] text-slate-400">
              GitHub API: {rateLimit.remaining}/{rateLimit.limit} requests remaining in this window
            </span>
          </div>
        )}
      </main>
    </div>
  );
};
