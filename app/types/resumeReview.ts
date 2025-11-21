export type ResumeReview = {
  strengths: string[];
  weaknesses: string[];
  firstImpression: string;

  extractedSkills: {
    technical: string[];
    interpersonal: string[];
    leadership: string[];
    domain: string[];
    transferable: string[];
  };

  directionAlignment: {
    directionId: string;
    directionName: string;
    alignmentScore: number;
    strongPoints: string[];
    skillGaps: string[];
    recommendations: string[];
  }[];

  bulletAnalysis: {
    original: string;
    issues: string[];
    improved: string;
  }[];

  improvedSummary: string;
};
