import React, { useState, useEffect } from 'react';
import { UserProfileProvider } from './context/UserProfileContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SkillCustomizerModal } from './components/SkillCustomizerModal';
import { HomePage } from './pages/HomePage';
import { IssueListPage } from './pages/IssueListPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { GitHubIssue, fetchSingleIssue } from './services/api';
import { parseRepoInput } from './utils/format';

type ViewMode = 'home' | 'issues' | 'detail';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const [currentRepo, setCurrentRepo] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);

  // Sync hash routing: #/repo/owner/name or #/repo/owner/name/issues/123
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#/') {
        setView('home');
        return;
      }

      // Format: #/repo/:owner/:repo or #/repo/:owner/:repo/issue/:number
      const matchIssue = hash.match(/^#\/repo\/([^/]+)\/([^/]+)\/issue\/(\d+)$/);
      if (matchIssue) {
        const owner = matchIssue[1];
        const repo = matchIssue[2];
        const issueNum = parseInt(matchIssue[3], 10);
        setCurrentOwner(owner);
        setCurrentRepo(repo);
        setView('detail');

        // Fetch issue if not already selected
        if (!selectedIssue || selectedIssue.number !== issueNum) {
          fetchSingleIssue(owner, repo, issueNum)
            .then(iss => setSelectedIssue(iss))
            .catch(() => {
              // fallback to issues list
              setView('issues');
            });
        }
        return;
      }

      const matchRepo = hash.match(/^#\/repo\/([^/]+)\/([^/]+)/);
      if (matchRepo) {
        setCurrentOwner(matchRepo[1]);
        setCurrentRepo(matchRepo[2]);
        setView('issues');
        return;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSearchRepo = (owner: string, repo: string) => {
    setCurrentOwner(owner);
    setCurrentRepo(repo);
    setSelectedIssue(null);
    setView('issues');
    window.location.hash = `#/repo/${owner}/${repo}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIssue = (issue: GitHubIssue) => {
    setSelectedIssue(issue);
    setView('detail');
    window.location.hash = `#/repo/${currentOwner}/${currentRepo}/issue/${issue.number}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToIssues = () => {
    setSelectedIssue(null);
    setView('issues');
    window.location.hash = `#/repo/${currentOwner}/${currentRepo}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setView('home');
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreIssues = () => {
    if (currentOwner && currentRepo) {
      setView('issues');
      window.location.hash = `#/repo/${currentOwner}/${currentRepo}`;
    } else {
      handleSearchRepo('facebook', 'react');
    }
  };

  const handleScrollToHowItWorks = () => {
    if (view !== 'home') {
      setView('home');
      window.location.hash = '#/';
      setTimeout(() => {
        document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToPrograms = () => {
    if (view !== 'home') {
      setView('home');
      window.location.hash = '#/';
      setTimeout(() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <UserProfileProvider>
      <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#0A1428]">
        <Navbar
          currentView={view}
          onNavigateHome={handleNavigateHome}
          onHowItWorks={handleScrollToHowItWorks}
          onPrograms={handleScrollToPrograms}
          onFindIssue={handleExploreIssues}
        />

        <div className="flex-1">
          {view === 'home' && (
            <HomePage
              onSearchRepo={handleSearchRepo}
              onSelectIssue={(owner, repo, issue) => {
                setCurrentOwner(owner);
                setCurrentRepo(repo);
                handleSelectIssue(issue);
              }}
              onExplorePrograms={handleScrollToPrograms}
              onFindIssue={handleExploreIssues}
            />
          )}

          {view === 'issues' && currentOwner && currentRepo && (
            <IssueListPage
              owner={currentOwner}
              repo={currentRepo}
              onSelectIssue={handleSelectIssue}
              onChangeRepo={handleNavigateHome}
            />
          )}

          {view === 'detail' && selectedIssue && currentOwner && currentRepo && (
            <IssueDetailPage
              owner={currentOwner}
              repo={currentRepo}
              issue={selectedIssue}
              onBack={handleBackToIssues}
            />
          )}
        </div>

        <Footer
          onNavigateHome={handleNavigateHome}
          onExploreIssues={handleExploreIssues}
          onHowItWorks={handleScrollToHowItWorks}
        />

        <SkillCustomizerModal />
      </div>
    </UserProfileProvider>
  );
};

export default App;
