export interface ExportSections {
  summary: boolean;
  strengths: boolean;
  skills: boolean;
  bullets: boolean;
  careerDirections: boolean;
}

export interface PDFExportData {
  sections: ExportSections;
  data: {
    firstName?: string;
    firstImpression?: string;
    improvedSummary?: string;
    strengths?: string[];
    weaknesses?: string[];
    extractedSkills?: Record<string, string[]>;
    bulletAnalysis?: Array<{
      original: string;
      improved: string;
    }>;
    careerDirections?: Array<{
      name: string;
      summary: string;
      fitScore: number;
    }>;
  };
}
