import { kv } from '@vercel/kv';

// User profile storage using Vercel KV
export interface UserProfileData {
  profile?: string;
  timestamp?: number;
  inputs?: string;
  onboardingComplete?: boolean;
  careerStageUserSelected?: string;
  resumeSignals?: any;
  careerStage?: string;
  resumeText?: string;
  linkedInSummary?: string;
  questions?: any;
  careerPreferences?: any;
  careerPreferencesCompleted?: boolean;
  last_updated?: string;
  extractedName?: string;
}

const PROFILE_PREFIX = 'profile:';

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const profile = await kv.get<UserProfileData>(`${PROFILE_PREFIX}${userId}`);
    return profile;
  } catch (error) {
    console.error('Error getting user profile from KV:', error);
    return null;
  }
}

export async function saveUserProfile(userId: string, data: UserProfileData): Promise<void> {
  try {
    await kv.set(`${PROFILE_PREFIX}${userId}`, data);
  } catch (error) {
    console.error('Error saving user profile to KV:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfileData>): Promise<void> {
  try {
    const existing = await getUserProfile(userId) || {};
    const merged = { ...existing, ...updates };
    await saveUserProfile(userId, merged);
  } catch (error) {
    console.error('Error updating user profile in KV:', error);
    throw error;
  }
}

export async function getAllProfileKeys(): Promise<string[]> {
  try {
    // Scan for all profile keys
    const keys = await kv.keys(`${PROFILE_PREFIX}*`);
    return keys;
  } catch (error) {
    console.error('Error getting all profile keys from KV:', error);
    return [];
  }
}
