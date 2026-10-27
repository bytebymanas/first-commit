import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  FileSearch,
  Globe,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  GitBranch,
  Terminal,
  Code2,
  FolderGit2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import gsap from 'gsap';
import { RepositorySearch } from '../components/RepositorySearch';
import { IssueCard } from '../components/IssueCard';
import { StepList } from '../components/StepList';
import { SkillBadge } from '../components/SkillBadge';
import { getPreviewSampleData, GitHubIssue } from '../services/api';

interface HomePageProps {
  onSearchRepo: (owner: string, repo: string) => void;
  onSelectIssue: (owner: string, repo: string, issue: GitHubIssue) => void;
  onExplorePrograms: () => void;
  onFindIssue: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearchRepo,
  onSelectIssue,
  onExplorePrograms,
  onFindIssue,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Preview sample data (isolated sandbox)
  const previewData = getPreviewSampleData();
  const [activePreviewIssue, setActivePreviewIssue] = useState<GitHubIssue>(previewData.issues[0]);

  // Quick repository explorer on the homepage
  const [isSearchingInHero, setIsSearchingInHero] = useState(false);

  // Subtle GSAP entrance animation with lifecycle cleanup & prefers-reduced-motion check
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-headline-line', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: 'power3.out',
      });

      gsap.from('.hero-subtext', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.35,
        ease: 'power2.out',
      });

      gsap.from('.hero-cta-btn', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.45,
        ease: 'power2.out',
      });

      gsap.from('.hero-journey-card', {
        scale: 0.96,
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: 'power2.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* 1. DARK EDITORIAL HERO (Strictly matching Reference 1)        */}
      {/* ============================================================== */}
      <section
        ref={heroRef}
        className="w-full bg-[#111214] text-[#F5F4F0] pt-12 sm:pt-16 pb-20 sm:pb-28 border-b border-[#28292B] px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4FF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Editorial Serif Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[84px] font-normal leading-[1.04] tracking-tight mb-6 font-serif select-none">
              <span className="hero-headline-line block">Find your</span>
              <span className="hero-headline-line block">way into</span>
              <span className="hero-headline-line block text-[#D4FF00] italic">
                open source.
              </span>
            </h1>

            {/* Clean Sans-serif Body Text */}
            <p className="hero-subtext text-base sm:text-lg text-[#8A8D93] max-w-xl leading-relaxed mb-8 font-sans">
              Discover public issues, understand what they ask for, and follow a practical checklist toward your first pull request.
            </p>

            {/* CTAs Row */}
            {!isSearchingInHero ? (
              <div className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Primary CTA: Solid lime, dark text */}
                  <button
                    onClick={() => setIsSearchingInHero(true)}
                    className="hero-cta-btn inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#D4FF00] hover:bg-[#C2EB00] text-[#111214] font-semibold text-sm transition-all shadow-sm active:scale-95"
                  >
                    <FileSearch className="w-4 h-4 text-[#111214] stroke-[2.2]" />
                    <span>Find my first issue</span>
                  </button>

                  {/* Secondary CTA 1: Explore Programs */}
                  <button
                    onClick={onExplorePrograms}
                    className="hero-cta-btn inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#181A1D] hover:bg-[#28292B] text-[#F5F4F0] border border-[#28292B] font-medium text-sm transition-all active:scale-95"
                  >
                    <Compass className="w-4 h-4 text-[#D4FF00]" />
                    <span>Explore programs</span>
                  </button>

                </div>
              </div>
            ) : (
              <div className="mb-8 max-w-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#D4FF00] uppercase tracking-wider">
                    Enter any public repository:
                  </span>
                  <button
                    onClick={() => setIsSearchingInHero(false)}
                    className="text-xs text-[#8A8D93] hover:text-[#F5F4F0] underline"
                  >
                    Show shortcuts
                  </button>
                </div>
                <RepositorySearch
                  theme="dark"
                  onSearch={onSearchRepo}
                  placeholder="e.g. facebook/react or expressjs/express"
                  size="large"
                  autoFocus
                />
              </div>
            )}

            {/* Letter-spaced Sub-tagline */}
            <div className="pt-2 flex items-center gap-3 text-[11px] font-mono tracking-[0.25em] text-[#74777D] uppercase">
              <span>Discover</span>
              <span className="text-[#D4FF00]">·</span>
              <span>Understand</span>
              <span className="text-[#D4FF00]">·</span>
              <span>Contribute</span>
            </div>
          </div>

          {/* Right Column: Striking Journey Composition (Reference 1 visual language) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="hero-journey-card w-full max-w-md bg-[#181A1D] rounded-2xl border border-[#28292B] p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle grid pattern background */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#D4FF00 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#28292B] mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28292B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28292B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28292B]" />
                  <span className="ml-2 text-xs font-mono text-[#8A8D93]">
                    contribution-roadmap.sh
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30">
                  Contribution Path
                </span>
              </div>

              {/* Connected Journey Path Visual */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#D4FF00] before:via-[#D4FF00]/60 before:to-[#28292B]">
                {/* Node 1: Explore programs */}
                <div
                  onClick={onExplorePrograms}
                  className="relative group cursor-pointer transition-all hover:translate-x-1"
                >
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#111214] border-2 border-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
                  <div className="bg-[#111214] border border-[#28292B] group-hover:border-[#D4FF00]/50 rounded-xl p-3 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F5F4F0] group-hover:text-[#D4FF00] transition-colors">
                        1. Explore programs
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#74777D] group-hover:text-[#D4FF00]" />
                    </div>
                    <p className="text-[11px] text-[#74777D] mt-0.5">
                      GSoC, Outreachy, LFX, Hacktoberfest mentorship tracks
                    </p>
                  </div>
                </div>

                {/* Node 2: Understand projects */}
                <div className="relative group">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#111214] border-2 border-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
                  <div className="bg-[#111214] border border-[#28292B] group-hover:border-[#D4FF00]/50 rounded-xl p-3 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F5F4F0] group-hover:text-[#D4FF00] transition-colors">
                        2. Understand projects
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#74777D] group-hover:text-[#D4FF00]" />
                    </div>
                    <p className="text-[11px] text-[#74777D] mt-0.5">
                      Read the project’s contribution guide and issue discussion
                    </p>
                  </div>
                </div>

                {/* Node 3: Find a good first issue */}
                <div
                  onClick={onFindIssue}
                  className="relative group cursor-pointer transition-all hover:translate-x-1"
                >
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#D4FF00] shadow-[0_0_10px_#D4FF00]" />
                  <div className="bg-[#111214] border border-[#D4FF00]/40 rounded-xl p-3 transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#D4FF00]">
                        3. Find a good first issue
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D4FF00] text-[#111214] font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A8D93] mt-0.5">
                      Start with issues carrying maintainer-added beginner labels
                    </p>
                  </div>
                </div>

                {/* Node 4: Open a pull request */}
                <div className="relative group">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#28292B] border border-[#5F6268]" />
                  <div className="bg-[#111214]/60 border border-[#28292B] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#8A8D93]">
                        4. Open a pull request
                      </span>
                      <GitPullRequest className="w-3.5 h-3.5 text-[#74777D]" />
                    </div>
                    <p className="text-[11px] text-[#5F6268] mt-0.5">
                      Follow the project’s contribution guide and submit a pull request
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom quick terminal trigger */}
              <div className="mt-5 pt-4 border-t border-[#28292B] flex items-center justify-between text-xs text-[#8A8D93] font-mono">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>git clone &amp;&amp; submit</span>
                </span>
                <span className="text-[#D4FF00] font-bold">Public GitHub data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. WARM WHITE INTERIOR (Strictly matching Reference 2)        */}
      {/* ============================================================== */}
      <div className="w-full bg-[#F8F7F3] text-[#151619] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Section A: How It Works (3 Clear Steps) */}
          <section id="how-it-works-section" className="scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#151619] px-2.5 py-1 rounded bg-[#E6E1D8]/60 inline-block mb-3">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-[#151619]">
                Three simple steps to your first pull request.
              </h2>
              <p className="text-sm text-[#74777D] mt-2 font-sans">
                No maintainer jargon. No guessing what needs to be changed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 Card */}
              <div className="bg-white rounded-xl border border-[#E6E1D8] p-6 shadow-subtle hover-card-lift flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#111214] text-[#D4FF00] flex items-center justify-center font-mono font-bold text-sm mb-5">
                    01
                  </div>
                  <h3 className="text-lg font-semibold text-[#151619] mb-2">
                    Find a repository
                  </h3>
                  <p className="text-xs text-[#74777D] leading-relaxed">
                    Enter a public GitHub repository. Open issues with maintainer-added labels such as <code className="font-mono bg-[#F1EFEA] px-1 py-0.5 rounded text-[#151619]">good first issue</code> and <code className="font-mono bg-[#F1EFEA] px-1 py-0.5 rounded text-[#151619]">help wanted</code> are sorted first when present.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex items-center justify-between text-xs font-mono text-[#74777D]">
                  <span>GitHub REST API</span>
                  <span className="text-[#151619] font-medium">Real-time</span>
                </div>
              </div>

              {/* Step 2 Card */}
              <div className="bg-white rounded-xl border border-[#E6E1D8] p-6 shadow-subtle hover-card-lift flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#111214] text-[#D4FF00] flex items-center justify-center font-mono font-bold text-sm mb-5">
                    02
                  </div>
                  <h3 className="text-lg font-semibold text-[#151619] mb-2">
                    Understand an issue with AI
                  </h3>
                  <p className="text-xs text-[#74777D] leading-relaxed">
                    When an AI provider is configured, it explains the issue, estimates relevant skills, and suggests places to investigate. Suggestions are not verified against repository source.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex items-center justify-between text-xs font-mono text-[#74777D]">
                  <span>Optional setup</span>
                  <span className="text-[#151619] font-medium">Configurable AI provider</span>
                </div>
              </div>

              {/* Step 3 Card */}
              <div className="bg-white rounded-xl border border-[#E6E1D8] p-6 shadow-subtle hover-card-lift flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#111214] text-[#D4FF00] flex items-center justify-center font-mono font-bold text-sm mb-5">
                    03
                  </div>
                  <h3 className="text-lg font-semibold text-[#151619] mb-2">
                    Follow your roadmap
                  </h3>
                  <p className="text-xs text-[#74777D] leading-relaxed">
                    Follow an interactive checklist with numbered steps: fork, branch, edit, test, and commit. Mark each step as complete and push your code with confidence.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex items-center justify-between text-xs font-mono text-[#74777D]">
                  <span>Interactive Checklist</span>
                  <span className="text-[#151619] font-medium">Editable checklist</span>
                </div>
              </div>
            </div>
          </section>

          <section id="about-section" className="pt-4 scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#74777D] mb-2">A quick introduction</p>
                <h3 className="text-2xl font-serif text-[#151619]">Open source, in a few words</h3>
                <p className="text-xs text-[#74777D] mt-2 max-w-2xl">Open-source software makes its source code available for people to use, study, and improve under the project’s license. Contributors can fix issues, improve docs, and share changes with maintainers.</p>
              </div>
              <button onClick={onFindIssue} className="shrink-0 text-xs font-medium text-[#151619] underline underline-offset-4">Skip to issues</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['Repository', 'A project’s files, history, and collaboration space on GitHub.'],
                ['Issue', 'A discussion describing a bug, question, or possible improvement.'],
                ['Fork', 'Your own GitHub copy of another repository, where you can make changes.'],
                ['Commit', 'A saved set of changes with a message describing what changed.'],
                ['Pull request', 'A proposal asking maintainers to review and merge your changes.'],
                ['Contribution', 'Code, documentation, tests, design, or helpful discussion shared with a project.'],
              ].map(([term, definition]) => (
                <article key={term} className="bg-white rounded-xl border border-[#E6E1D8] p-4">
                  <h4 className="text-sm font-semibold text-[#151619]">{term}</h4>
                  <p className="text-xs text-[#74777D] leading-relaxed mt-1.5">{definition}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Section B: Interactive Product Preview (Warm White, Black, Lime) */}
          <section id="preview-section" className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111214] text-[#D4FF00] text-xs font-mono font-medium mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
                  <span>Interactive Preview</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#151619] tracking-tight">
                  Experience FirstCommit issue breakdown
                </h3>
                <p className="text-xs text-[#74777D] mt-1 max-w-xl">
                  Illustrative sample content only; these issues are not fetched from GitHub and the sample explanation is not an AI response.
                </p>
              </div>

              <button
                onClick={() => onSearchRepo('facebook', 'react')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111214] bg-[#D4FF00] hover:bg-[#C2EB00] px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm"
              >
                <span>Explore live react repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview Frame in Warm White */}
            <div className="bg-[#FFFFFF] border border-[#E6E1D8] rounded-2xl p-4 sm:p-6 shadow-subtle">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E1D8] text-xs font-mono text-[#74777D]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6E1D8] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6E1D8] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6E1D8] inline-block" />
                  <span className="ml-2 font-medium text-[#151619]">
                    firstcommit.dev/preview/facebook/react
                  </span>
                </div>
                <span className="text-[11px] text-[#8A8D93]">Sample Sandbox</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Sample Issue Cards */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-[#151619] mb-1">
                    <span>Open Issues ({previewData.issues.length})</span>
                    <span className="text-[#74777D] font-mono text-[11px]">Select to inspect</span>
                  </div>

                  {previewData.issues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={activePreviewIssue.id === issue.id}
                      onSelect={(iss) => setActivePreviewIssue(iss)}
                      compact
                    />
                  ))}
                </div>

                {/* Right Column: AI Analysis & Roadmap Preview */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E1D8] p-5 shadow-subtle">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8] mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#111214] text-[#D4FF00] flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-sm font-semibold text-[#151619]">
                          AI Issue Breakdown
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#D4FF00]/20 text-[#111214] border border-[#D4FF00]/40">
                        Difficulty: {previewData.analysis.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-[#151619] leading-relaxed mb-4">
                      {previewData.analysis.summary}
                    </p>

                    {/* What needs to be done */}
                    <div className="bg-[#F8F7F3] rounded-lg p-3 border border-[#E6E1D8] mb-4 text-xs">
                      <span className="font-semibold text-[#151619] block mb-1">
                        What needs to be done:
                      </span>
                      <div className="text-[#74777D] whitespace-pre-line leading-relaxed font-sans">
                        {previewData.analysis.whatNeedsToBeDone}
                      </div>
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-[#74777D] font-mono mr-1">Skills:</span>
                      {previewData.analysis.requiredSkills.map((sk) => (
                        <SkillBadge key={sk} skill={sk} status="matched" size="sm" />
                      ))}
                    </div>
                  </div>

                  {/* StepList Preview */}
                  <StepList
                    steps={previewData.analysis.roadmap}
                    issueId="preview-roadmap"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section C: Curated Repositories */}
          <section className="pt-4 border-t border-[#E6E1D8]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#151619]">
                  Public repositories to explore
                </h3>
                <p className="text-xs text-[#74777D] mt-0.5">
                  These are starting points only. Current repository details and open issues load from GitHub when selected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'facebook/react', lang: 'JavaScript', desc: 'The library for web and native user interfaces.' },
                { name: 'expressjs/express', lang: 'JavaScript', desc: 'Fast, unopinionated, minimalist web framework.' },
                { name: 'vitejs/vite', lang: 'TypeScript', desc: 'Next generation frontend tooling.' },
                { name: 'freeCodeCamp/freeCodeCamp', lang: 'TypeScript', desc: 'Open-source curriculum and platform.' },
              ].map((repo) => (
                <div
                  key={repo.name}
                  onClick={() => {
                    const [o, r] = repo.name.split('/');
                    onSearchRepo(o, r);
                  }}
                  className="bg-white rounded-xl border border-[#E6E1D8] p-4 shadow-subtle hover-card-lift cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#F1EFEA] text-[#151619] border border-[#E6E1D8]">
                        {repo.lang}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#151619] group-hover:text-[#111214] font-mono mb-1.5">
                      {repo.name}
                    </h4>
                    <p className="text-xs text-[#74777D] line-clamp-2 leading-relaxed">
                      {repo.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E6E1D8] flex items-center justify-between text-xs font-semibold text-[#111214]">
                    <span>Explore issues</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="programs-section" className="pt-8 border-t border-[#E6E1D8]">
            <div className="mb-6">
              <p className="text-xs font-mono uppercase tracking-wider text-[#74777D] mb-2">Beyond your first issue</p>
              <h3 className="text-xl font-bold font-serif text-[#151619]">Open-source programs</h3>
              <p className="text-xs text-[#74777D] mt-1 max-w-2xl">
                Explore official program pages for current opportunities and eligibility. Dates and requirements can change, so check each organizer’s site.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Google Summer of Code', description: 'A global program introducing contributors to open-source development.', url: 'https://summerofcode.withgoogle.com/get-started' },
                { name: 'Outreachy', description: 'Remote internships with open-source projects and communities.', url: 'https://www.outreachy.org/apply/' },
                { name: 'Linux Foundation Mentorship', description: 'Mentorship opportunities across Linux Foundation projects.', url: 'https://www.linuxfoundation.org/about/mentorship-programs/' },
              ].map((program) => (
                <a key={program.name} href={program.url} target="_blank" rel="noreferrer" className="bg-white rounded-xl border border-[#E6E1D8] p-5 hover-card-lift group">
                  <h4 className="text-sm font-semibold text-[#151619] group-hover:underline">{program.name}</h4>
                  <p className="text-xs text-[#74777D] leading-relaxed mt-2">{program.description}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-[#151619]">Official program site <ArrowRight className="w-3.5 h-3.5" /></span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
