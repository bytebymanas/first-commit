import React from 'react';
import { ExternalLink, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { GitHubIssue } from '../services/api';
import { formatRelativeTime, getLabelStyle, isBeginnerLabel } from '../utils/format';

interface IssueCardProps {
  issue: GitHubIssue;
  isSelected?: boolean;
  onSelect: (issue: GitHubIssue) => void;
  compact?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isSelected = false,
  onSelect,
  compact = false,
}) => {
  const hasBeginnerTag = issue.labels.some(l => isBeginnerLabel(l.name));

  return (
    <div
      onClick={() => onSelect(issue)}
      className={`group relative rounded-xl border p-5 transition-all text-left cursor-pointer hover-card-lift ${
        isSelected
          ? 'bg-[#FFFFFF] border-[#111214] ring-2 ring-[#D4FF00] shadow-sm'
          : 'bg-[#FFFFFF] border-[#E6E1D8] hover:border-[#111214]'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(issue);
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Header metadata row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Issue Number Badge */}
              <span className="font-mono text-xs font-semibold text-[#151619] bg-[#F1EFEA] px-2 py-0.5 rounded border border-[#E6E1D8]">
                #{issue.number}
              </span>

              {hasBeginnerTag && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#D4FF00]/20 text-[#111214] border border-[#D4FF00]/50">
                  <Sparkles className="w-3 h-3 text-[#111214]" aria-hidden="true" />
                  Beginner-friendly label
                </span>
              )}

            </div>

            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#74777D] hover:text-[#111214] p-1 rounded transition-colors"
              title="View on GitHub"
              aria-label={`Open issue #${issue.number} on GitHub`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Title in Deep Black */}
          <h3 className="text-base font-semibold text-[#151619] group-hover:text-[#111214] transition-colors line-clamp-2 mb-2 leading-snug">
            {issue.title}
          </h3>

          {/* Snippet preview if available */}
          {!compact && issue.body && (
            <p className="text-xs text-[#74777D] line-clamp-2 mb-3 leading-relaxed">
              {issue.body.replace(/[#*`_\[\]()]/g, '')}
            </p>
          )}

          {/* Labels */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {issue.labels.slice(0, 4).map((label, idx) => {
              const style = getLabelStyle(label.name, label.color);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-mono tracking-tight ${style.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {label.name}
                </span>
              );
            })}
            {issue.labels.length > 4 && (
              <span className="text-xs text-[#74777D] self-center font-mono pl-1">
                +{issue.labels.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Footer info & Dark Action Button */}
        <div className="pt-3 border-t border-[#E6E1D8] flex items-center justify-between text-xs text-[#74777D]">
          <div className="flex items-center gap-3">
            <span>{formatRelativeTime(issue.createdAt)}</span>
            {issue.commentsCount > 0 && (
              <span className="inline-flex items-center gap-1 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-[#74777D]" />
                {issue.commentsCount}
              </span>
            )}
          </div>

          {/* Dark 'Understand this issue' Button per Reference 2 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111214] group-hover:bg-[#28292B] text-[#F5F4F0] text-xs font-semibold transition-all">
            <span>Understand this issue</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4FF00]" />
          </div>
        </div>
      </div>
    </div>
  );
};
