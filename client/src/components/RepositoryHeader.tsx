import React from 'react';
import { GitFork, Star, CircleDot, ExternalLink, RefreshCw } from 'lucide-react';
import { GitHubRepo } from '../services/api';
import { formatNumber } from '../utils/format';

interface RepositoryHeaderProps {
  repo: GitHubRepo;
  onChangeRepo?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  repo,
  onChangeRepo,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Repo title and stats */}
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {repo.fullName}
            </h1>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {repo.primaryLanguage && (
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {repo.primaryLanguage}
              </span>
            )}
          </div>

          {repo.description && (
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mb-3">
              {repo.description}
            </p>
          )}

          {/* Repo stats badge bar */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{formatNumber(repo.stars)} stars</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatNumber(repo.forks)} forks</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5 text-emerald-500" />
              <span>{formatNumber(repo.openIssuesCount)} open issues</span>
            </span>
          </div>
          {(repo.license || repo.defaultBranch) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              {repo.license && <span>License: {repo.license}</span>}
              {repo.defaultBranch && <span>Default branch: {repo.defaultBranch}</span>}
              {repo.homepage && <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Project homepage</a>}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
              title="Refresh issues list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}

          {onChangeRepo && (
            <button
              onClick={onChangeRepo}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Change repository</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
