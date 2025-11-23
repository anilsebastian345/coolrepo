import { kv } from '@vercel/kv';
import { JobMatchAnalysis } from '@/app/types/jobMatch';

export type FitLabel = 'Strong Fit' | 'Moderate Fit' | 'Partial Fit' | 'Low Fit';

export interface RoleFitAnalysis {
  id: string;
  userId: string;
  company: string | null;
  jobTitle: string | null;
  jobDescriptionSnippet: string | null;
  fitScore: number;
  fitLabel: FitLabel;
  strengths: string[];
  gaps: string[];
  themesToLeanInto: string[];
  createdAt: string; // ISO date string
  rawResult: JobMatchAnalysis;
}

const ROLE_FIT_PREFIX = 'rolefit:';
const ROLE_FIT_INDEX_PREFIX = 'rolefit:index:';

// Helper to determine fit label from score
export function getFitLabel(score: number): FitLabel {
  if (score >= 80) return 'Strong Fit';
  if (score >= 65) return 'Moderate Fit';
  if (score >= 50) return 'Partial Fit';
  return 'Low Fit';
}

// Helper to extract company from job description or title
export function extractCompany(jobDescription: string, jobTitle?: string): string | null {
  // Simple heuristic: look for common company patterns
  // e.g., "at Amazon", "@ Meta", "- Google"
  const patterns = [
    /\bat\s+([A-Z][a-zA-Z0-9&\s]+?)(?:\s|,|\.|$)/,
    /@\s*([A-Z][a-zA-Z0-9&\s]+?)(?:\s|,|\.|$)/,
    /\-\s*([A-Z][a-zA-Z0-9&\s]+?)(?:\s|,|\.|$)/,
    /^([A-Z][a-zA-Z0-9&\s]+?)\s*\-/,
  ];
  
  const text = `${jobTitle || ''} ${jobDescription}`;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 50);
    }
  }
  
  return null;
}

// Generate UUID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Save a role fit analysis
export async function saveRoleFitAnalysis(
  userId: string,
  jobTitle: string | null,
  jobDescription: string,
  analysis: JobMatchAnalysis
): Promise<RoleFitAnalysis> {
  try {
    const id = generateId();
    const fitScore = Math.round(analysis.overallMatchScore);
    const fitLabel = getFitLabel(fitScore);
    const company = extractCompany(jobDescription, jobTitle || undefined);
    
    // Extract snippet (first 250 chars)
    const snippet = jobDescription.trim().substring(0, 250);
    
    // Build themes from recommended skills or extract from analysis
    const themesToLeanInto = analysis.recommendedSkills?.slice(0, 5) || [];
    
    const record: RoleFitAnalysis = {
      id,
      userId,
      company,
      jobTitle: jobTitle || null,
      jobDescriptionSnippet: snippet,
      fitScore,
      fitLabel,
      strengths: analysis.strengths || [],
      gaps: analysis.gaps || [],
      themesToLeanInto,
      createdAt: new Date().toISOString(),
      rawResult: analysis,
    };
    
    // Store the record
    await kv.set(`${ROLE_FIT_PREFIX}${id}`, record);
    
    // Add to user's index (sorted set by timestamp)
    const timestamp = Date.now();
    await kv.zadd(`${ROLE_FIT_INDEX_PREFIX}${userId}`, {
      score: timestamp,
      member: id,
    });
    
    return record;
  } catch (error) {
    console.error('Error saving role fit analysis:', error);
    throw error;
  }
}

// Get recent analyses for a user (limit N, most recent first)
export async function getRecentRoleFitAnalyses(
  userId: string,
  limit: number = 20
): Promise<RoleFitAnalysis[]> {
  try {
    // Get IDs from sorted set (most recent first)
    const ids = await kv.zrange(`${ROLE_FIT_INDEX_PREFIX}${userId}`, 0, limit - 1, {
      rev: true,
    });
    
    if (!ids || ids.length === 0) {
      return [];
    }
    
    // Fetch all records
    const records = await Promise.all(
      ids.map(id => kv.get<RoleFitAnalysis>(`${ROLE_FIT_PREFIX}${id}`))
    );
    
    // Filter out nulls and return
    return records.filter((r): r is RoleFitAnalysis => r !== null);
  } catch (error) {
    console.error('Error getting recent role fit analyses:', error);
    return [];
  }
}

// Get all analyses for a user
export async function getAllRoleFitAnalyses(userId: string): Promise<RoleFitAnalysis[]> {
  try {
    // Get all IDs from sorted set
    const ids = await kv.zrange(`${ROLE_FIT_INDEX_PREFIX}${userId}`, 0, -1, {
      rev: true,
    });
    
    if (!ids || ids.length === 0) {
      return [];
    }
    
    // Fetch all records
    const records = await Promise.all(
      ids.map(id => kv.get<RoleFitAnalysis>(`${ROLE_FIT_PREFIX}${id}`))
    );
    
    // Filter out nulls and return
    return records.filter((r): r is RoleFitAnalysis => r !== null);
  } catch (error) {
    console.error('Error getting all role fit analyses:', error);
    return [];
  }
}

// Get a single analysis by ID
export async function getRoleFitAnalysisById(id: string): Promise<RoleFitAnalysis | null> {
  try {
    return await kv.get<RoleFitAnalysis>(`${ROLE_FIT_PREFIX}${id}`);
  } catch (error) {
    console.error('Error getting role fit analysis by ID:', error);
    return null;
  }
}
