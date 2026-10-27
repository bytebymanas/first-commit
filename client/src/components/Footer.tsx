import React from 'react';
import { GitCommit, Github, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onExploreIssues: () => void;
  onHowItWorks: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onExploreIssues,
  onHowItWorks,
}) => {
  return (
    <footer id="about-section" className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-3">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                <GitCommit className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold text-[#0A1428] font-sans">
                FirstCommit
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              An AI-powered open-source onboarding platform that helps beginner developers discover GitHub issues, understand unfamiliar codebases, assess their skills, and follow a step-by-step contribution roadmap.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Product
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={onHowItWorks}
                  className="hover:text-blue-600 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={onExploreIssues}
                  className="hover:text-blue-600 transition-colors"
                >
                  Explore Issues
                </button>
              </li>
              <li>
                <a
                  href="#preview-section"
                  className="hover:text-blue-600 transition-colors"
                >
                  Interactive Preview
                </a>
              </li>
            </ul>
          </div>

          {/* Project & Community links */}
          <div>
            <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Source Code
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a
                  href="https://github.com/bytebymanas/first-commit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="text-slate-400">Public Open-Source Project</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FirstCommit. Free and open source.</p>
          <p className="inline-flex items-center gap-1 text-slate-400">
            <span>Built for the open-source community</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
          </p>
        </div>
      </div>
    </footer>
  );
};
