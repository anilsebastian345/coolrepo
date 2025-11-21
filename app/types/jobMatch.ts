export type JobMatchDimension =
  | 'skills'
  | 'experience'
  | 'responsibilities'
  | 'culture_environment';

export type JobMatchAnalysis = {
  jobTitle: string;
  overallMatchScore: number; // 0–100
  dimensionScores: {
    dimension: JobMatchDimension;
    score: number; // 0–100
    comment: string;
  }[];
  strengths: string[];
  gaps: string[];
  recommendedSkills: string[];
  tailoringSuggestions: {
    summary: string;
    keyBullets: {
      original?: string;
      improved: string;
      note: string;
    }[];
  };
  riskFlags: string[];
};
