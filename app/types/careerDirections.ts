export type CareerDirectionCluster = {
  id: string;
  name: string;
  summary: string;
  examplePaths: {
    id: string;
    name: string;
    stageHint: 'college' | 'recent_grad' | 'early_career' | 'mid_career' | 'senior' | 'any';
    description: string;
  }[];
};

export type CareerDirectionRecommendation = {
  id: string;
  name: string;
  fitScore: number;
  summary: string;
  whyItFits: string[];
  clusters: CareerDirectionCluster[];
  stageNote: string;
};
