import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CareerStage, CareerStageUserSelected, ResumeSignals, CareerPreferences } from '@/lib/careerStage';
import { getUserProfile } from '@/lib/storage';

export const runtime = 'nodejs';

interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  onboardingComplete: boolean;
  archetype?: string;
  core_drives_and_values?: string;
  cognitive_style?: string;
  leadership_style?: string;
  communication_style?: string;
  risk_and_ambition?: string;
  growth_and_blind_spots?: string;
  summary?: string;
  last_updated?: string;
  resume?: {
    filename: string;
    uploadedAt: string;
  };
  linkedin?: {
    imported: boolean;
    importedAt?: string;
  };
  careerStageUserSelected?: CareerStageUserSelected;
  resumeSignals?: ResumeSignals;
  careerStage?: CareerStage;
  careerPreferences?: CareerPreferences;
  careerPreferencesCompleted?: boolean;
  // Additional data for AI-powered features
  psychographicProfile?: any;
  resumeText?: string;
  linkedInSummary?: string;
  questions?: any;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Require authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.email;
    const userEmail = session.user.email;
    const userName = session.user.name || undefined;
    
    // Get profile from KV storage
    let profileData: UserProfile | null = null;
    const cachedProfile = await getUserProfile(userId);
    
    console.log('=== /api/me DEBUG ===');
    console.log('Looking for user:', userId);
    console.log('Found profile?:', !!cachedProfile);
    console.log('Profile keys:', Object.keys(cachedProfile || {}));
    console.log('===================');
      
    if (cachedProfile) {
      // Extract resume text and LinkedIn summary - prioritize direct fields, fallback to inputs parsing
      let resumeText: string | undefined;
      let linkedInSummary: string | undefined;
      let psychographicProfile: any;
        
      // Debug logging
      console.log('[RESUME DEBUG] cachedProfile.resumeText:', !!cachedProfile.resumeText, 'Length:', cachedProfile.resumeText?.length || 0);
      console.log('[RESUME DEBUG] First 200 chars:', cachedProfile.resumeText?.substring(0, 200) || 'NONE');
      console.log('[RESUME DEBUG] All cachedProfile keys:', Object.keys(cachedProfile));
        
      // Get resume/LinkedIn from cache
      resumeText = cachedProfile.resumeText;
      linkedInSummary = cachedProfile.linkedInSummary;
        
      console.log('Direct fields - Resume text length:', resumeText?.length, 'LinkedIn length:', linkedInSummary?.length);
        
      // Parse psychographic profile from profile field
      if (cachedProfile.profile) {
        try {
          psychographicProfile = typeof cachedProfile.profile === 'string'
            ? JSON.parse(cachedProfile.profile)
            : cachedProfile.profile;
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
        
      profileData = {
        userId,
        email: userEmail,
        name: userName || cachedProfile.extractedName || undefined,
        onboardingComplete: cachedProfile.onboardingComplete || false,
        summary: cachedProfile.profile || undefined,
        last_updated: cachedProfile.timestamp 
          ? new Date(cachedProfile.timestamp).toISOString() 
          : undefined,
        careerStageUserSelected: cachedProfile.careerStageUserSelected as CareerStageUserSelected | undefined,
        resumeSignals: cachedProfile.resumeSignals,
        careerStage: cachedProfile.careerStage as CareerStage | undefined,
        careerPreferences: cachedProfile.careerPreferences,
        careerPreferencesCompleted: cachedProfile.careerPreferencesCompleted || false,
        resumeText,
        linkedInSummary,
        psychographicProfile,
        questions: cachedProfile.questions,
      };
    }
    
    // If no profile exists, return a new user profile
    if (!profileData) {
      profileData = {
        userId,
        email: userEmail,
        name: userName,
        onboardingComplete: false,
      };
    }

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
