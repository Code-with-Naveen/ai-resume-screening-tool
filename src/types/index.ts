import { JobPosition, CandidateResume } from '../data/defaultData.ts';

export type { JobPosition, CandidateResume };

export interface ScreeningResult {
  candidateId: string;
  overallScore: number;
  breakdown: {
    skillsScore: number;
    experienceScore: number;
    semanticScore: number;
    educationScore: number;
    cosineSimilarityPct: number;
    jaccardSimilarityPct: number;
    nlpComposite: number;
  };
  nlpDetails: {
    cosine: {
      score: number;
      dotProduct: number;
      magnitude1: number;
      magnitude2: number;
      sharedTokens: { token: string; weightDoc1: number; weightDoc2: number }[];
    };
    jaccard: {
      score: number;
      intersection: string[];
      union: string[];
    };
    matchedRequiredSkills: string[];
    missingRequiredSkills: string[];
    cleaningInspection?: {
      rawLength: number;
      rawWordsCount: number;
      cleanedTextSample: string;
      rawTokenCount: number;
      filteredTokenCount: number;
      removedStopwordsCount: number;
      extractedSkills: string[];
      topTerms: { term: string; freq: number }[];
    };
  };
  aiEvaluation: {
    strengths: string[];
    gaps: string[];
    interviewQuestions: {
      question: string;
      category: string;
      whyAsk: string;
    }[];
    summary: string;
    recommendation: 'Strong Match' | 'Good Match' | 'Borderline / Review' | 'Not a Match';
  };
  screenedAt?: string;
}

export type ActiveTab = 'leaderboard' | 'job_spec' | 'nlp_lab' | 'compare';
