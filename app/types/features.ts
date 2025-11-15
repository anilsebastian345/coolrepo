// Type definitions for all features

// F1 - Career Direction Map
export interface CareerPath {
  title: string;
  matchScore: number; // 0-100
  description: string;
  keyStrengths: string[];
  requiredSkills: string[];
  growthAreas: string[];
  nextSteps: string[];
}

export interface CareerDirectionResponse {
  recommendedPaths: CareerPath[];
  reasoning: string;
}

// Career Map Page Type
export interface CareerRecommendation {
  id: string;
  roleTitle: string;
  fitScore: number;
  whyItFits: string[];
  strengthsUsed: string[];
  keySkills: string[];
  description: string;
  responsibilities: string[];
  gaps: string[];
  nextSteps: string[];
}

// Resume Intel Page Type
export interface ResumeIntel {
  strengths: string[];
  gaps: string[];
  improvedBullets: { original: string; improved: string }[];
  improvedLinkedInSummary: string;
}

// Job Match Page Type (Simplified)
export interface JobMatchAnalysis {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestedActions: string[];
  tailoredBullets: string[];
}

// F2 - Resume & LinkedIn Intelligence
export interface ResumeAnalysis {
  strengths: {
    category: string;
    items: string[];
  }[];
  gaps: {
    category: string;
    items: string[];
  }[];
  improvedBullets: {
    original: string;
    improved: string;
    reasoning: string;
  }[];
  linkedinAbout: {
    current?: string;
    improved: string;
    highlights: string[];
  };
}

// F3 - Job Match & Skill Gap Engine
export interface JobMatchResult {
  matchPercentage: number;
  overallAssessment: string;
  strengths: {
    skill: string;
    evidence: string;
    impact: string;
  }[];
  gaps: {
    skill: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    suggestion: string;
  }[];
  recommendations: string[];
}
