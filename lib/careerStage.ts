export type CareerStage =
  | 'college'
  | 'recent_grad'
  | 'early_career'
  | 'mid_career'
  | 'senior'
  | 'unknown';

export type CareerStageUserSelected = CareerStage | 'prefer_not_to_say';

export interface ResumeSignals {
  yearsExperience: number | null;
  roleCount: number | null;
  titles: string[];
  graduationYear: number | null;
  seniorityHints: string[];
}

export const CAREER_STAGE_OPTIONS = [
  { value: 'college', label: 'College student' },
  { value: 'recent_grad', label: 'Recent graduate (0–2 years)' },
  { value: 'early_career', label: 'Early career (2–7 years)' },
  { value: 'mid_career', label: 'Mid-career (7–15 years)' },
  { value: 'senior', label: 'Senior (15+ years)' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

/**
 * Determines the user's career stage based on their selection and resume signals.
 * 
 * Priority order:
 * 1. User's explicit selection (if not "prefer not to say")
 * 2. Years of experience from resume
 * 3. Role count from resume
 * 4. Job titles from resume
 * 5. Graduation year from resume
 * 6. Falls back to 'unknown' if no data available
 */
export function determineCareerStage(
  userSelected: CareerStageUserSelected,
  resumeSignals: ResumeSignals
): CareerStage {

  // 1. If user selected a stage AND it's reasonable → trust it
  if (userSelected !== 'prefer_not_to_say') {
    return userSelected as CareerStage;
  }

  // 2. Infer from years of experience
  if (resumeSignals.yearsExperience != null) {
    const y = resumeSignals.yearsExperience;
    if (y <= 0) return 'college';
    if (y > 0 && y <= 2) return 'recent_grad';
    if (y > 2 && y <= 7) return 'early_career';
    if (y > 7 && y <= 15) return 'mid_career';
    if (y > 15) return 'senior';
  }

  // 3. Infer from role count
  if (resumeSignals.roleCount != null) {
    const rc = resumeSignals.roleCount;
    if (rc === 0) return 'college';
    if (rc <= 2) return 'recent_grad';
    if (rc <= 4) return 'early_career';
    if (rc <= 6) return 'mid_career';
    if (rc > 6) return 'senior';
  }

  // 4. Infer from titles (fallback)
  const titlesString = resumeSignals.titles.join(' ').toLowerCase();
  if (titlesString.includes('intern')) return 'college';
  if (titlesString.includes('junior') || titlesString.includes('assistant')) return 'recent_grad';
  if (titlesString.includes('senior')) return 'mid_career';
  if (
    titlesString.includes('manager') ||
    titlesString.includes('lead') ||
    titlesString.includes('consultant')
  )
    return 'mid_career';
  if (
    titlesString.includes('director') ||
    titlesString.includes('head') ||
    titlesString.includes('vp') ||
    titlesString.includes('founder')
  )
    return 'senior';

  // 5. Graduation year fallback
  if (resumeSignals.graduationYear != null) {
    const yrsAgo = new Date().getFullYear() - resumeSignals.graduationYear;
    if (yrsAgo <= 1) return 'recent_grad';
    if (yrsAgo <= 7) return 'early_career';
    if (yrsAgo <= 15) return 'mid_career';
    return 'senior';
  }

  // 6. Last fallback if no data
  return 'unknown';
}

/**
 * Gets a human-readable label for a career stage
 */
export function getCareerStageLabel(stage: CareerStage): string {
  const option = CAREER_STAGE_OPTIONS.find(opt => opt.value === stage);
  return option?.label || 'Unknown';
}

/**
 * Creates an empty ResumeSignals object
 */
export function createEmptyResumeSignals(): ResumeSignals {
  return {
    yearsExperience: null,
    roleCount: null,
    titles: [],
    graduationYear: null,
    seniorityHints: [],
  };
}
