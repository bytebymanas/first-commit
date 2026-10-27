import React from 'react';
import { Check, Plus } from 'lucide-react';

interface SkillBadgeProps {
  skill: string;
  status?: 'matched' | 'missing' | 'neutral';
  variant?: 'light' | 'dark';
  interactive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  status = 'neutral',
  variant = 'light',
  interactive = false,
  onClick,
  size = 'md',
}) => {
  let styleClasses = '';
  let icon = null;

  if (variant === 'dark') {
    if (status === 'matched') {
      styleClasses = 'bg-[#D4FF00] text-[#111214] border-[#D4FF00] font-semibold';
      icon = <Check className="w-3 h-3 text-[#111214] mr-1 stroke-[2.5]" aria-hidden="true" />;
    } else if (status === 'missing') {
      styleClasses = 'bg-[#181A1D] text-[#A0A3A8] border-[#28292B]';
      icon = <Plus className="w-3 h-3 text-[#74777D] mr-1" aria-hidden="true" />;
    } else {
      styleClasses = 'bg-[#181A1D] text-[#F5F4F0] border-[#28292B]';
    }
  } else {
    // Light / warm background variant
    if (status === 'matched') {
      styleClasses = 'bg-[#D4FF00]/20 text-[#111214] border-[#D4FF00]/60 font-semibold';
      icon = <Check className="w-3 h-3 text-[#111214] mr-1 stroke-[2.5]" aria-hidden="true" />;
    } else if (status === 'missing') {
      styleClasses = 'bg-[#F1EFEA] text-[#74777D] border-[#E6E1D8]';
      icon = <Plus className="w-3 h-3 text-[#74777D] mr-1" aria-hidden="true" />;
    } else {
      styleClasses = 'bg-[#FFFFFF] text-[#151619] border-[#E6E1D8]';
    }
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-medium';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-[#111214] active:scale-95 transition-all'
    : '';

  return (
    <span
      onClick={interactive ? onClick : undefined}
      className={`inline-flex items-center rounded-md border font-mono tracking-tight transition-colors ${styleClasses} ${sizeClasses} ${interactiveClasses}`}
      title={
        status === 'matched'
          ? `Matches your skills: ${skill}`
          : status === 'missing'
          ? `Prerequisite to learn: ${skill}`
          : skill
      }
    >
      {icon}
      <span>{skill}</span>
    </span>
  );
};
