import React, { useState } from 'react';
import { X, Check, RotateCcw, Wrench } from 'lucide-react';
import { useUserProfile, POPULAR_SKILLS } from '../context/UserProfileContext';

export const SkillCustomizerModal: React.FC = () => {
  const {
    skills,
    toggleSkill,
    addSkill,
    resetSkills,
    isCustomizingSkills,
    setIsCustomizingSkills,
  } = useUserProfile();

  const [customInput, setCustomInput] = useState('');

  if (!isCustomizingSkills) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      addSkill(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 id="skill-modal-title" className="text-base font-semibold text-slate-900">
                Your Developer Skills
              </h3>
              <p className="text-xs text-slate-500">
                Select the languages and tools you know to get personalized issue matches.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomizingSkills(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close skills dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected count info */}
        <div className="py-4">
          <span className="text-xs font-medium text-slate-700 block mb-2">
            Selected Skills ({skills.length}):
          </span>

          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = skills.some(
                s => s.toLowerCase() === skill.toLowerCase()
              );

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom skill add */}
        <form onSubmit={handleAddCustom} className="pt-2 pb-4 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add another skill (e.g. GraphQL, Svelte)..."
            className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={resetSkills}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizingSkills(false)}
            className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
