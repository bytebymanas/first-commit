export interface RelevantFile {
  path: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  step: number;
  title: string;
  instruction: string;
  estimatedMinutes?: number;
  fileReference?: string | null;
}

export interface AIAnalysis {
  summary: string;
  whatNeedsToBeDone: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyRationale: string;
  requiredSkills: string[];
  matchingExplanation: string;
  missingSkills: string[];
  prerequisites: string[];
  relevantFiles: RelevantFile[];
  roadmap: RoadmapStep[];
  model?: string;
  isAiGenerated?: boolean;
  terms?: { term: string; definition: string }[];
  clarifyingQuestions?: string[];
  language?: 'english' | 'hinglish';
}

export interface AnalyzeRequest {
  owner: string;
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody?: string;
  labels?: string[];
  userSkills?: string[];
  language?: 'english' | 'hinglish';
  repositoryDescription?: string | null;
  primaryLanguage?: string | null;
  repositoryStars?: number;
  readmeExcerpt?: string | null;
  contributingGuideExcerpt?: string | null;
}

export interface ChatRequest {
  message: string;
  issueContext?: {
    owner: string;
    repo: string;
    issueNumber: number;
    title: string;
  };
  history?: { role: 'user' | 'assistant'; content: string }[];
}
