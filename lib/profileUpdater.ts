import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface UserProfile {
  archetype: string;
  core_drives_and_values: string;
  cognitive_style: string;
  leadership_style: string;
  communication_style: string;
  risk_and_ambition: string;
  growth_and_blind_spots: string;
  summary: string;
  last_updated?: string;
  update_count?: number;
  next_update_due?: string;
}

interface ProfileUpdateData {
  userId: string;
  meaningfulChats: number;
  lastProfileUpdate: string;
  updateTriggerCount: number;
  pendingInsights: Array<{
    timestamp: string;
    content: string;
    category: 'leadership' | 'communication' | 'growth' | 'behavior' | 'values';
    confidence: number;
  }>;
}

const PROFILE_UPDATE_THRESHOLDS = {
  MEANINGFUL_CHATS: 7, // Update after 7 meaningful chats
  TIME_BASED_DAYS: 30, // Or after 30 days
  MIN_CONFIDENCE: 0.7, // Minimum confidence for insights
} as const;

export class ProfileUpdater {
  private static async loadProfileUpdateData(userId: string): Promise<ProfileUpdateData> {
    try {
      const updatePath = join(process.cwd(), `profile_updates_${userId}.json`);
      if (existsSync(updatePath)) {
        const data = await readFile(updatePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading profile update data:', error);
    }
    
    return {
      userId,
      meaningfulChats: 0,
      lastProfileUpdate: new Date().toISOString(),
      updateTriggerCount: 0,
      pendingInsights: []
    };
  }

  private static async saveProfileUpdateData(data: ProfileUpdateData): Promise<void> {
    try {
      const updatePath = join(process.cwd(), `profile_updates_${data.userId}.json`);
      await writeFile(updatePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving profile update data:', error);
    }
  }

  static async recordMeaningfulChat(
    userId: string, 
    userMessage: string, 
    aiResponse: string
  ): Promise<boolean> {
    const updateData = await this.loadProfileUpdateData(userId);
    
    // Analyze if this was a meaningful chat
    const isMeaningful = this.isMeaningfulInteraction(userMessage, aiResponse);
    
    if (isMeaningful) {
      updateData.meaningfulChats++;
      
      // Extract insights from the conversation
      const insights = await this.extractInsights(userMessage, aiResponse);
      updateData.pendingInsights.push(...insights);
      
      await this.saveProfileUpdateData(updateData);
      
      // Check if update is needed
      return this.shouldUpdateProfile(updateData);
    }
    
    return false;
  }

  private static isMeaningfulInteraction(userMessage: string, aiResponse: string): boolean {
    // Consider a chat meaningful if:
    // 1. User message is substantial (>50 characters)
    // 2. Contains personal/professional content
    // 3. AI response is coaching-oriented (>100 characters)
    
    if (userMessage.length < 50 || aiResponse.length < 100) {
      return false;
    }
    
    const meaningfulKeywords = [
      'team', 'leadership', 'challenge', 'decision', 'feedback', 'conflict',
      'goal', 'career', 'manager', 'colleague', 'stress', 'growth',
      'meeting', 'presentation', 'project', 'strategy', 'performance'
    ];
    
    const hasKeywords = meaningfulKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    return hasKeywords;
  }

  private static async extractInsights(
    userMessage: string, 
    aiResponse: string
  ): Promise<Array<{timestamp: string, content: string, category: 'leadership' | 'communication' | 'growth' | 'behavior' | 'values', confidence: number}>> {
    const insights: Array<{timestamp: string, content: string, category: 'leadership' | 'communication' | 'growth' | 'behavior' | 'values', confidence: number}> = [];
    const timestamp = new Date().toISOString();
    
    // Leadership insights
    if (userMessage.match(/leading|managing|team|decision/i)) {
      insights.push({
        timestamp,
        content: `Leadership behavior: ${userMessage.substring(0, 100)}...`,
        category: 'leadership',
        confidence: 0.8
      });
    }
    
    // Communication insights
    if (userMessage.match(/meeting|presentation|conversation|communicate/i)) {
      insights.push({
        timestamp,
        content: `Communication pattern: ${userMessage.substring(0, 100)}...`,
        category: 'communication',
        confidence: 0.75
      });
    }
    
    // Growth insights
    if (userMessage.match(/learning|feedback|improve|develop|grow/i)) {
      insights.push({
        timestamp,
        content: `Growth orientation: ${userMessage.substring(0, 100)}...`,
        category: 'growth',
        confidence: 0.8
      });
    }
    
    // Behavioral insights
    if (userMessage.match(/stressed|frustrated|excited|confident|worried/i)) {
      insights.push({
        timestamp,
        content: `Emotional pattern: ${userMessage.substring(0, 100)}...`,
        category: 'behavior',
        confidence: 0.7
      });
    }
    
    // Values insights
    if (userMessage.match(/important|value|principle|believe|ethics/i)) {
      insights.push({
        timestamp,
        content: `Values expression: ${userMessage.substring(0, 100)}...`,
        category: 'values',
        confidence: 0.85
      });
    }
    
    return insights;
  }

  private static shouldUpdateProfile(updateData: ProfileUpdateData): boolean {
    const daysSinceLastUpdate = (Date.now() - new Date(updateData.lastProfileUpdate).getTime()) / (1000 * 60 * 60 * 24);
    
    return (
      updateData.meaningfulChats >= PROFILE_UPDATE_THRESHOLDS.MEANINGFUL_CHATS ||
      daysSinceLastUpdate >= PROFILE_UPDATE_THRESHOLDS.TIME_BASED_DAYS
    );
  }

  static async updateProfile(userId: string): Promise<UserProfile | null> {
    try {
      const updateData = await this.loadProfileUpdateData(userId);
      const currentProfile = await this.loadCurrentProfile(userId);
      
      if (!currentProfile) {
        console.log('No current profile found for user:', userId);
        return null;
      }
      
      // Filter high-confidence insights
      const highConfidenceInsights = updateData.pendingInsights
        .filter(insight => insight.confidence >= PROFILE_UPDATE_THRESHOLDS.MIN_CONFIDENCE);
      
      if (highConfidenceInsights.length === 0) {
        console.log('No high-confidence insights for profile update');
        return null;
      }
      
      // Generate updated profile using insights
      const updatedProfile = await this.generateUpdatedProfile(currentProfile, highConfidenceInsights);
      
      // Save updated profile
      await this.saveUpdatedProfile(userId, updatedProfile);
      
      // Reset counters
      updateData.meaningfulChats = 0;
      updateData.lastProfileUpdate = new Date().toISOString();
      updateData.updateTriggerCount++;
      updateData.pendingInsights = [];
      
      await this.saveProfileUpdateData(updateData);
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  private static async loadCurrentProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Try to load from localStorage cache or profile file
      const profilePath = join(process.cwd(), `user_profile_${userId}.json`);
      if (existsSync(profilePath)) {
        const data = await readFile(profilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading current profile:', error);
    }
    return null;
  }

  private static async generateUpdatedProfile(
    currentProfile: UserProfile, 
    insights: Array<{timestamp: string, content: string, category: string, confidence: number}>
  ): Promise<UserProfile> {
    // This would ideally call OpenAI to generate an updated profile
    // For now, we'll do basic updates based on insights
    
    const insightsByCategory = insights.reduce((acc, insight) => {
      if (!acc[insight.category]) acc[insight.category] = [];
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, typeof insights>);
    
    const updatedProfile = { ...currentProfile };
    
    // Update based on insights
    if (insightsByCategory.leadership && insightsByCategory.leadership.length >= 2) {
      updatedProfile.leadership_style += ` Recent observations show increased leadership engagement and decision-making responsibility.`;
    }
    
    if (insightsByCategory.communication && insightsByCategory.communication.length >= 2) {
      updatedProfile.communication_style += ` Shows active communication patterns in meetings and presentations.`;
    }
    
    if (insightsByCategory.growth && insightsByCategory.growth.length >= 2) {
      updatedProfile.growth_and_blind_spots += ` Demonstrates continued focus on learning and development.`;
    }
    
    updatedProfile.last_updated = new Date().toISOString();
    updatedProfile.update_count = (updatedProfile.update_count || 0) + 1;
    
    return updatedProfile;
  }

  private static async saveUpdatedProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      const profilePath = join(process.cwd(), `user_profile_${userId}.json`);
      await writeFile(profilePath, JSON.stringify(profile, null, 2));
      
      // Also update the cache
      const cachePath = join(process.cwd(), 'profile_cache.json');
      if (existsSync(cachePath)) {
        const cache = JSON.parse(await readFile(cachePath, 'utf-8'));
        if (cache[userId]) {
          cache[userId].profile = JSON.stringify(profile);
          cache[userId].timestamp = Date.now();
          await writeFile(cachePath, JSON.stringify(cache, null, 2));
        }
      }
    } catch (error) {
      console.error('Error saving updated profile:', error);
    }
  }
}
