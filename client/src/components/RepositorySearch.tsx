import React, { useState } from 'react';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { parseRepoInput } from '../utils/format';

interface RepositorySearchProps {
  onSearch: (owner: string, repo: string) => void;
  initialValue?: string;
  placeholder?: string;
  size?: 'normal' | 'large';
  autoFocus?: boolean;
  theme?: 'dark' | 'light';
}

const EXAMPLE_REPOS = [
  'facebook/react',
  'expressjs/express',
  'vitejs/vite',
  'freeCodeCamp/freeCodeCamp',
];

export const RepositorySearch: React.FC<RepositorySearchProps> = ({
  onSearch,
  initialValue = '',
  placeholder = 'e.g., facebook/react or https://github.com/facebook/react',
  size = 'large',
  autoFocus = false,
  theme = 'light',
}) => {
  const [input, setInput] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError('Please enter a valid repository format, e.g. "owner/repo" or "https://github.com/owner/repo"');
      return;
    }

    onSearch(parsed.owner, parsed.repo);
  };

  const handleChipClick = (repoSlug: string) => {
    setInput(repoSlug);
    setError(null);
    const parsed = parseRepoInput(repoSlug);
    if (parsed) {
      onSearch(parsed.owner, parsed.repo);
    }
  };

  const isLarge = size === 'large';
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`relative flex items-center rounded-xl border transition-all ${
            isDark
              ? 'bg-[#181A1D] border-[#28292B] focus-within:border-[#D4FF00] focus-within:ring-1 focus-within:ring-[#D4FF00]'
              : 'bg-white border-[#E6E1D8] focus-within:border-[#111214] focus-within:ring-1 focus-within:ring-[#111214] shadow-sm'
          } ${error ? '!border-rose-500 !ring-rose-500/20' : ''}`}
        >
          <div className="pl-4 pr-2 text-[#74777D]">
            <Search className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full bg-transparent font-mono focus:outline-none ${
              isDark
                ? 'text-[#F5F4F0] placeholder:text-[#5F6268]'
                : 'text-[#151619] placeholder:text-[#8A8D93]'
            } ${isLarge ? 'py-4 text-base' : 'py-2.5 text-sm'}`}
            aria-label="GitHub Repository URL"
            aria-invalid={!!error}
          />

          <div className="pr-2">
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors ${
                isDark
                  ? 'bg-[#D4FF00] hover:bg-[#C2EB00] text-[#111214]'
                  : 'bg-[#111214] hover:bg-[#28292B] text-[#F5F4F0]'
              } ${isLarge ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs'}`}
            >
              <span>Find Issues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-2 pl-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Suggested Quick Picks */}
      <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
        <span className={`font-mono ${isDark ? 'text-[#74777D]' : 'text-[#8A8D93]'}`}>
          Popular:
        </span>
        {EXAMPLE_REPOS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => handleChipClick(slug)}
            className={`font-mono px-2 py-0.5 rounded text-[11px] transition-colors border ${
              isDark
                ? 'bg-[#181A1D] hover:bg-[#28292B] text-[#A0A3A8] hover:text-[#F5F4F0] border-[#28292B]'
                : 'bg-[#F1EFEA] hover:bg-[#E6E1D8] text-[#151619] border-[#E6E1D8]'
            }`}
          >
            {slug}
          </button>
        ))}
      </div>
    </div>
  );
};
