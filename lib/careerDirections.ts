import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { careerDirectionsConfig } from './careerDirectionsConfig';
import { OptionTag, CareerStage } from './careerStage';

interface UserProfile {
  careerStage?: CareerStage;
  careerPreferences?: {
    energizingWork: OptionTag[];
    avoidWork: OptionTag[];
    environments: OptionTag[];
    peopleVsIC: 'ic' | 'mix' | 'lead' | null;
    changeAppetite: 'stay_close' | 'pivot' | 'big_shift' | null;
  };
  psychographicProfile?: any;
  resumeText?: string;
  linkedInSummary?: string;
}

// Fallback heuristic function (used when API fails)
async function getFallbackRecommendations(
  userProfile: UserProfile
): Promise<CareerDirectionRecommendation[]> {
  // Extract preferences
  const energizing = userProfile.careerPreferences?.energizingWork || [];
  const avoid = userProfile.careerPreferences?.avoidWork || [];
  const environments = userProfile.careerPreferences?.environments || [];
  const peopleVsIC = userProfile.careerPreferences?.peopleVsIC || null;
  const changeAppetite = userProfile.careerPreferences?.changeAppetite || 'stay_close';
  const stage = userProfile.careerStage || 'unknown';

  // Calculate fit scores for each direction
  const scoredDirections = Object.values(careerDirectionsConfig).map(direction => {
    let score = 40; // Base score
    const whyItFits: string[] = [];

    // Boost score based on energizing work matches
    const tagMatches = direction.tags.filter(tag => energizing.includes(tag as OptionTag));
    score += tagMatches.length * 15;
    
    if (tagMatches.length > 0) {
      const tagNames = tagMatches.map(t => {
        if (t === 'creative') return 'creative work';
        if (t === 'people_helping') return 'helping people';
        if (t === 'analytical') return 'analytical thinking';
        if (t === 'systems_building') return 'building systems';
        if (t === 'technical_building') return 'technical building';
        if (t === 'leading') return 'leadership';
        if (t === 'hands_on') return 'hands-on work';
        return t;
      });
      whyItFits.push(`You're energized by ${tagNames.join(' and ')}, which is central to this direction.`);
    }

    // Environment matches
    const envMatches = direction.environments.filter(env => environments.includes(env as OptionTag));
    score += envMatches.length * 10;
    
    if (envMatches.length > 0) {
      const envNames = envMatches.map(e => {
        if (e === 'env_startup') return 'startup environments';
        if (e === 'env_large_org') return 'established organizations';
        if (e === 'env_mid_growth') return 'growing companies';
        if (e === 'env_public_impact') return 'public impact work';
        if (e === 'env_freelance') return 'independent/freelance work';
        if (e === 'env_research') return 'research settings';
        if (e === 'env_outdoors') return 'outdoor work';
        return e;
      });
      whyItFits.push(`This aligns with your preference for ${envNames.join(' or ')}.`);
    }

    // People vs IC adjustment
    if (peopleVsIC === 'lead' && direction.tags.includes('leading')) {
      score += 12;
      whyItFits.push('You prefer leadership roles, and this direction offers management paths.');
    } else if (peopleVsIC === 'ic' && !direction.tags.includes('leading')) {
      score += 8;
      whyItFits.push('You prefer individual contributor work, which many of these paths support.');
    } else if (peopleVsIC === 'mix') {
      score += 5;
      whyItFits.push('This direction offers both IC and leadership opportunities.');
    }

    // Change appetite adjustment
    if (changeAppetite === 'big_shift') {
      score += 5; // Slightly boost all scores for exploratory mindset
    }

    // Penalty for avoid tags (weak heuristic)
    if (avoid.includes('avoid_repetitive') && direction.id === 'operations_systems_logistics') {
      score -= 10;
    }
    if (avoid.includes('avoid_sales_pressure') && direction.id === 'business_strategy_leadership') {
      score -= 8;
    }
    if (avoid.includes('avoid_heavy_numbers') && direction.id === 'analytical_research') {
      score -= 12;
    }
    if (avoid.includes('avoid_physical_labor') && direction.id === 'hands_on_trades_craft') {
      score -= 15;
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score));

    // Generate stage note
    let stageNote = '';
    if (stage === 'college') {
      stageNote = 'As a college student, explore internships and entry-level opportunities in these areas.';
    } else if (stage === 'recent_grad') {
      stageNote = 'Early in your career, focus on building skills and trying different roles within this direction.';
    } else if (stage === 'early_career') {
      stageNote = 'With some experience, you can target more specialized roles or begin to lead small initiatives.';
    } else if (stage === 'mid_career') {
      stageNote = 'At this stage, consider senior IC roles or management positions that leverage your expertise.';
    } else if (stage === 'senior') {
      stageNote = 'With extensive experience, you might lead teams, shape strategy, or mentor the next generation.';
    } else {
      stageNote = 'Explore these paths at a level that matches your current experience.';
    }

    // Add generic fit reasons if we don't have many
    if (whyItFits.length === 0) {
      whyItFits.push('This direction matches aspects of your profile and preferences.');
    }
    if (whyItFits.length === 1) {
      whyItFits.push('The roles in this area offer diverse opportunities across industries.');
    }

    return {
      id: direction.id,
      name: direction.name,
      fitScore: score,
      summary: direction.baseSummary,
      whyItFits,
      clusters: direction.clusters,
      stageNote
    };
  });

  // Sort by fit score and return top 4
  return scoredDirections
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 4);
}

// Main API-powered function
export async function getCareerDirectionRecommendations(
  userProfile: UserProfile
): Promise<CareerDirectionRecommendation[]> {
  try {
    // Call the backend API
    const response = await fetch('/api/career-directions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userProfile: {
          careerStage: userProfile.careerStage,
          careerPreferences: userProfile.careerPreferences,
          psychographicProfile: userProfile.psychographicProfile,
          resumeText: userProfile.resumeText,
          linkedInSummary: userProfile.linkedInSummary,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Validate that directions exists and is an array
    if (data.directions && Array.isArray(data.directions) && data.directions.length > 0) {
      return data.directions;
    }

    throw new Error('Invalid response format from API');
  } catch (error) {
    console.warn('Failed to fetch AI-powered career directions, falling back to heuristics:', error);
    
    // Fall back to local heuristic approach
    return getFallbackRecommendations(userProfile);
  }
}
