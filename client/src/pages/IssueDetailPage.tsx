import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  HelpCircle,
  RotateCw,
  MessageSquare,
  User,
  GitPullRequest,
} from 'lucide-react';
import { GitHubIssue, AIAnalysis, analyzeIssue, ApiError } from '../services/api';
import { StepList } from '../components/StepList';
import { SkillBadge } from '../components/SkillBadge';
import { ChatAssistant } from '../components/ChatAssistant';
import { formatRelativeTime, getLabelStyle, getDifficultyColor, isBeginnerLabel } from '../utils/format';
import { useUserProfile } from '../context/UserProfileContext';

interface IssueDetailPageProps {
  owner: string;
  repo: string;
  issue: GitHubIssue;
  onBack: () => void;
}

export const IssueDetailPage: React.FC<IssueDetailPageProps> = ({
  owner,
  repo,
  issue,
  onBack,
}) => {
  const { skills } = useUserProfile();

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [language, setLanguage] = useState<'english' | 'hinglish'>('english');

  const performAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1500);

    try {
      const result = await analyzeIssue({
        owner,
        repo,
        issueNumber: issue.number,
        issueTitle: issue.title,
        issueBody: issue.body || '',
        labels: issue.labels.map((l) => l.name),
        userSkills: skills,
        language,
      });

      setAnalysis(result);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to complete AI analysis. You can try again.');
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  // Automatically trigger AI analysis when entering detail page
  useEffect(() => {
    performAnalysis();
  }, [owner, repo, issue.number, language]);

  const diffColor = analysis
    ? getDifficultyColor(analysis.difficulty)
    : getDifficultyColor('Beginner');

  return (
    <div className="w-full min-h-screen bg-[#FBFBF9] pb-24">
      {/* Top Breadcrumb & Action Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to issues</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 hidden sm:inline">
              {owner}/{repo}
            </span>
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Issue Overview Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-mono text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
              #{issue.number}
            </span>

            {issue.labels.some((l) => isBeginnerLabel(l.name)) && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Maintainer-marked beginner-friendly
              </span>
            )}

            <span className="text-xs text-slate-500">
              Opened by <span className="font-medium text-slate-700">{issue.author.username}</span> • {formatRelativeTime(issue.createdAt)}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-snug">
            {issue.title}
          </h1>

          {/* Labels */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {issue.labels.map((label, idx) => {
              const style = getLabelStyle(label.name, label.color);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs border font-mono tracking-tight ${style.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {label.name}
                </span>
              );
            })}
          </div>

          {/* Original issue body (collapsible preview) */}
          {issue.body ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
              <span className="font-mono text-[11px] font-semibold text-slate-500 block mb-1">
                Original Issue Description:
              </span>
              <p className="whitespace-pre-line font-sans">{issue.body}</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 italic">
              No description was provided in this GitHub issue.
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                AI Issue Breakdown & Guidance
              </h2>
            </div>

            {!isLoading && (
              <button
                onClick={performAnalysis}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 hover:text-blue-600 transition-colors"
                title="Re-run AI analysis"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-analyze</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4" aria-label="Explanation language">
            <span className="text-xs text-slate-500">Explain in</span>
            <button type="button" onClick={() => setLanguage('english')} aria-pressed={language === 'english'} className={`text-xs px-3 py-1.5 rounded-lg border ${language === 'english' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>Simple English</button>
            <button type="button" onClick={() => setLanguage('hinglish')} aria-pressed={language === 'hinglish'} className={`text-xs px-3 py-1.5 rounded-lg border ${language === 'hinglish' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>Hinglish</button>
          </div>

          {/* Loading Animation with Progressive Steps */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-spin">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">
                Analyzing issue with AI...
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                The configured AI provider is explaining the fetched issue details. It has not inspected the repository source.
              </p>

              <div className="space-y-2 text-xs font-mono text-left max-w-xs mx-auto">
                <div className={`flex items-center gap-2 ${loadingStep >= 1 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Reading issue description and tags</span>
                </div>
                <div className={`flex items-center gap-2 ${loadingStep >= 2 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Assessing required developer skills</span>
                </div>
                <div className={`flex items-center gap-2 ${loadingStep >= 3 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3. Building step-by-step contribution roadmap</span>
                </div>
              </div>
            </div>
          )}

          {/* Error & Retry State */}
          {error && !isLoading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">AI Analysis currently unavailable</h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={performAnalysis}
                className="text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 rounded-lg transition-colors shrink-0 shadow-xs"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Structured AI Analysis Content */}
          {analysis && !isLoading && (
            <div className="space-y-6">
              {/* Top Grid: Summary and Difficulty & Match */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Beginner Summary (2 Cols) */}
                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-2">
                      Beginner Summary
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed mb-4">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* What needs to be done */}
                  <div className="mt-2 pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-900 block mb-1.5">
                      What needs to be done:
                    </span>
                    <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      {analysis.whatNeedsToBeDone}
                    </div>
                  </div>
                </div>

                {/* Difficulty & Personalized Match Card (1 Col) */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
                  <div>
                    {/* Difficulty */}
                    <div className="mb-5">
                      <span className="text-xs font-mono text-slate-400 block mb-1">
                        Estimated Difficulty
                      </span>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${diffColor.badge}`}>
                          <span className={`w-2 h-2 rounded-full ${diffColor.indicator}`} />
                          {analysis.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {analysis.difficultyRationale}
                      </p>
                    </div>

                    {/* Skill Match Rationale */}
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-xs font-mono text-slate-400 block mb-1">
                        Why this matches you
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {analysis.matchingExplanation}
                      </p>

                      {/* Required skills badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.requiredSkills.map((sk) => {
                          const isKnown = skills.some(
                            (s) => s.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <SkillBadge
                              key={sk}
                              skill={sk}
                              status={isKnown ? 'matched' : 'missing'}
                              size="sm"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Prerequisites if any */}
                  {analysis.prerequisites && analysis.prerequisites.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 block mb-0.5">Prerequisites:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {analysis.prerequisites.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {((analysis.terms && analysis.terms.length > 0) || (analysis.clarifyingQuestions && analysis.clarifyingQuestions.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.terms && analysis.terms.length > 0 && (
                    <section className="bg-white rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Technical terms</h3>
                      <dl className="space-y-3">
                        {analysis.terms.map((entry) => <div key={entry.term}><dt className="text-xs font-semibold text-slate-700">{entry.term}</dt><dd className="text-xs text-slate-600 mt-0.5">{entry.definition}</dd></div>)}
                      </dl>
                    </section>
                  )}
                  {analysis.clarifyingQuestions && analysis.clarifyingQuestions.length > 0 && (
                    <section className="bg-white rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Questions to clarify with maintainers</h3>
                      <ul className="list-disc pl-4 space-y-2 text-xs text-slate-600">{analysis.clarifyingQuestions.map((question, index) => <li key={index}>{question}</li>)}</ul>
                    </section>
                  )}
                </div>
              )}

              {/* Relevant Files Evidence Table */}
              {analysis.relevantFiles && analysis.relevantFiles.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Relevant Repository Files & Docs
                    </h4>
                  </div>
                    <p className="text-xs text-slate-500 mb-4">
                    The issue text may mention these paths. Confirm them in the repository before making changes; no source files were inspected here.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">File Path</th>
                          <th className="py-2.5 px-4 font-medium">Confidence</th>
                          <th className="py-2.5 px-4 font-medium">Why it's relevant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysis.relevantFiles.map((rf, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-4 font-mono font-medium text-blue-700">
                              {rf.path}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`font-mono text-[11px] px-2 py-0.5 rounded capitalize ${
                                  rf.confidence === 'high'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : rf.confidence === 'medium'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {rf.confidence}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 leading-relaxed">
                              {rf.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Contribution Roadmap Component */}
              {analysis.roadmap && analysis.roadmap.length > 0 && (
                <StepList
                  steps={analysis.roadmap}
                  issueId={`${owner}_${repo}_${issue.number}`}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Contextual Chat Assistant */}
      <ChatAssistant
        currentContext={{
          owner,
          repo,
          issueNumber: issue.number,
          title: issue.title,
        }}
      />
    </div>
  );
};
