import React, { useState, useEffect } from 'react';
import { GitCommit, Menu, X, Wrench, Sparkles, Terminal } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';

interface NavbarProps {
  currentView: string;
  onNavigateHome: () => void;
  onHowItWorks: () => void;
  onPrograms: () => void;
  onFindIssue: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onHowItWorks,
  onPrograms,
  onFindIssue,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('Checking AI setup');
  const { skills, setIsCustomizingSkills } = useUserProfile();

  useEffect(() => {
    // Check backend health for AI status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setAiStatus(data.aiConfigured ? 'AI ready' : 'AI setup needed');
      })
      .catch(() => {
        setAiStatus('AI status unavailable');
      });
  }, []);

  const handleMobileNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111214] border-b border-[#28292B] text-[#F5F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand wordmark with Lime Commit Mark */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onNavigateHome();
          }}
          aria-label="FirstCommit Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#181A1D] border border-[#28292B] flex items-center justify-center text-[#D4FF00] group-hover:border-[#D4FF00] transition-colors shadow-2xs">
            <GitCommit className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#F5F4F0]">
              FirstCommit
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#D4FF00] text-[#111214]">
              Beta
            </span>
          </div>
        </div>

        {/* Centred Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={onHowItWorks}
            className={`transition-colors hover:text-[#D4FF00] ${
              currentView === 'home' ? 'text-[#F5F4F0]' : 'text-[#8A8D93]'
            }`}
          >
            How it works
          </button>
          <button
            onClick={onPrograms}
            className={`transition-colors hover:text-[#D4FF00] ${
              currentView === 'programs' ? 'text-[#D4FF00] font-semibold' : 'text-[#8A8D93]'
            }`}
          >
            Programs
          </button>
          <button
            onClick={onFindIssue}
            className={`transition-colors hover:text-[#D4FF00] ${
              currentView === 'issues' || currentView === 'detail'
                ? 'text-[#D4FF00] font-semibold'
                : 'text-[#8A8D93]'
            }`}
          >
            Find my first issue
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* AI Status Outlined Pill */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#28292B] bg-[#181A1D] text-xs font-mono text-[#F5F4F0]"
            title="AI model engine status"
          >
            <span className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
            <span>{aiStatus}</span>
          </div>

          {/* User Skills Button */}
          <button
            onClick={() => setIsCustomizingSkills(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#28292B] bg-[#181A1D] hover:border-[#D4FF00]/60 text-xs font-mono text-[#8A8D93] hover:text-[#F5F4F0] transition-colors"
            title="Customize your developer skills"
          >
            <Wrench className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Skills ({skills.length})</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsCustomizingSkills(true)}
            className="p-1.5 rounded-lg border border-[#28292B] text-[#D4FF00] bg-[#181A1D]"
            aria-label="Customize skills"
          >
            <Wrench className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#F5F4F0] hover:bg-[#181A1D] border border-transparent hover:border-[#28292B] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#28292B] bg-[#111214] px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#28292B]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#28292B] bg-[#181A1D] text-xs font-mono text-[#F5F4F0]">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
              <span>{aiStatus}</span>
            </div>
            <span className="text-xs text-[#8A8D93] font-mono">{skills.length} skills selected</span>
          </div>

          <button
            onClick={() => handleMobileNav(onHowItWorks)}
            className="block w-full text-left py-2 text-sm font-medium text-[#F5F4F0] hover:text-[#D4FF00]"
          >
            How it works
          </button>
          <button
            onClick={() => handleMobileNav(onPrograms)}
            className="block w-full text-left py-2 text-sm font-medium text-[#F5F4F0] hover:text-[#D4FF00]"
          >
            Programs
          </button>
          <button
            onClick={() => handleMobileNav(onFindIssue)}
            className="block w-full text-left py-2 text-sm font-medium text-[#F5F4F0] hover:text-[#D4FF00]"
          >
            Find my first issue
          </button>

          <div className="pt-2 border-t border-[#28292B]">
            <button
              onClick={() => handleMobileNav(onFindIssue)}
              className="w-full text-center py-2.5 px-4 text-sm font-semibold text-[#111214] bg-[#D4FF00] hover:bg-[#C2EB00] rounded-lg transition-colors"
            >
              Find my first issue
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
