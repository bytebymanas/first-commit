import React, { useState, useEffect } from 'react';
import { Check, Clock, FileCode, RotateCcw, PartyPopper } from 'lucide-react';
import { RoadmapStep } from '../services/api';

interface StepListProps {
  steps: RoadmapStep[];
  issueId?: number | string;
  onAllCompleted?: () => void;
}

export const StepList: React.FC<StepListProps> = ({
  steps,
  issueId,
  onAllCompleted,
}) => {
  const storageKey = issueId ? `firstcommit_steps_${issueId}` : null;

  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(completedSteps));
      } catch {
        // ignore
      }
    }
  }, [completedSteps, storageKey]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepNumber]: !prev[stepNumber] };
      const completedCount = steps.filter(s => updated[s.step]).length;
      if (completedCount === steps.length && onAllCompleted) {
        onAllCompleted();
      }
      return updated;
    });
  };

  const resetAll = () => {
    setCompletedSteps({});
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const completedCount = steps.filter(s => completedSteps[s.step]).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const isAllComplete = steps.length > 0 && completedCount === steps.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">
              Contribution Roadmap
            </h4>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {completedCount} of {steps.length} completed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Use this general checklist alongside the repository’s own contribution guide and setup instructions.
          </p>
        </div>

        {completedCount > 0 && (
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors self-start sm:self-auto py-1 px-2 rounded hover:bg-slate-50"
            title="Reset roadmap checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset progress</span>
          </button>
        )}
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-100 h-2 rounded-full my-5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isAllComplete ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Completion Banner */}
      {isAllComplete && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-emerald-900">
              All steps completed! You are ready to submit your PR.
            </h5>
            <p className="text-xs text-emerald-700 mt-0.5">
              Double-check that your branch is pushed and submit your pull request referencing this issue. Outstanding work!
            </p>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isDone = !!completedSteps[step.step];

          return (
            <div
              key={step.step}
              onClick={() => toggleStep(step.step)}
              className={`group flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
              }`}
              role="checkbox"
              aria-checked={isDone}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleStep(step.step);
                }
              }}
            >
              {/* Checkbox / Step Number */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-300 text-slate-500 group-hover:border-blue-500'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span className="text-xs font-mono font-medium">{step.step}</span>
                )}
              </div>

              {/* Step details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h5
                    className={`text-sm font-semibold transition-colors ${
                      isDone
                        ? 'text-slate-400 line-through'
                        : 'text-slate-900 group-hover:text-blue-700'
                    }`}
                  >
                    {step.title}
                  </h5>

                  <div className="flex items-center gap-2">
                    {step.estimatedMinutes && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        ~{step.estimatedMinutes}m
                      </span>
                    )}

                    {step.fileReference && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        <FileCode className="w-3 h-3 text-slate-500" />
                        {step.fileReference}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`text-xs leading-relaxed ${
                    isDone ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {/* Parse inline backticks cleanly */}
                  {step.instruction.split('`').map((segment, i) =>
                    i % 2 === 1 ? (
                      <code
                        key={i}
                        className="bg-slate-100 text-blue-800 px-1 py-0.5 rounded font-mono text-[11px] border border-slate-200"
                      >
                        {segment}
                      </code>
                    ) : (
                      segment
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
