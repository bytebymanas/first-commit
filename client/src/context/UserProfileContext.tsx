import React, { createContext, useContext, useState, useEffect } from 'react';

export const POPULAR_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'HTML/CSS',
  'Markdown',
  'Documentation',
  'Git',
  'GitHub Flow',
  'Vue.js',
  'Next.js',
  'Tailwind CSS',
  'Rust',
  'Go',
  'C++',
  'Docker',
  'Testing/Jest',
];

export interface SkillMatchResult {
  matched: string[];
  missing: string[];
  percentage: number;
  isGoodMatch: boolean;
}

interface UserProfileContextType {
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  toggleSkill: (skill: string) => void;
  resetSkills: () => void;
  checkSkillMatch: (requiredSkills: string[]) => SkillMatchResult;
  isCustomizingSkills: boolean;
  setIsCustomizingSkills: (open: boolean) => void;
}

const DEFAULT_SKILLS = ['JavaScript', 'HTML/CSS', 'Markdown', 'Git', 'GitHub Flow'];

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('firstcommit_user_skills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SKILLS;
  });

  const [isCustomizingSkills, setIsCustomizingSkills] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('firstcommit_user_skills', JSON.stringify(skills));
    } catch {
      // ignore
    }
  }, [skills]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills(prev => [...prev, trimmed]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s.toLowerCase() !== skill.toLowerCase()));
  };

  const toggleSkill = (skill: string) => {
    const exists = skills.some(s => s.toLowerCase() === skill.toLowerCase());
    if (exists) {
      removeSkill(skill);
    } else {
      addSkill(skill);
    }
  };

  const resetSkills = () => {
    setSkills(DEFAULT_SKILLS);
  };

  const checkSkillMatch = (requiredSkills: string[] = []): SkillMatchResult => {
    if (!requiredSkills || requiredSkills.length === 0) {
      return { matched: [], missing: [], percentage: 100, isGoodMatch: true };
    }

    const matched: string[] = [];
    const missing: string[] = [];

    const userSkillsLower = skills.map(s => s.toLowerCase());

    requiredSkills.forEach(req => {
      const reqLower = req.toLowerCase();
      // Fuzzy/flexible matching (e.g. "React.js" matches "React", "Docs" matches "Documentation")
      const isMatch = userSkillsLower.some(u => {
        if (u === reqLower) return true;
        if (u.includes(reqLower) || reqLower.includes(u)) return true;
        if ((u.includes('doc') || u === 'markdown') && (reqLower.includes('doc') || reqLower === 'markdown')) return true;
        if (u.includes('git') && reqLower.includes('git')) return true;
        return false;
      });

      if (isMatch) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    });

    const percentage = Math.round((matched.length / requiredSkills.length) * 100);
    const isGoodMatch = percentage >= 50;

    return {
      matched,
      missing,
      percentage,
      isGoodMatch,
    };
  };

  return (
    <UserProfileContext.Provider
      value={{
        skills,
        addSkill,
        removeSkill,
        toggleSkill,
        resetSkills,
        checkSkillMatch,
        isCustomizingSkills,
        setIsCustomizingSkills,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
