import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { CareerStage, CareerStageUserSelected, ResumeSignals, CareerPreferences } from '@/lib/careerStage';

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
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    
    // Check if profile exists
    const profilePath = join(process.cwd(), 'profile_cache.json');
    let profileData: UserProfile | null = null;
    
    if (existsSync(profilePath)) {
      const profileContent = await readFile(profilePath, 'utf-8');
      const allProfiles = JSON.parse(profileContent);
      
      // Try to find profile by email first, then fallback to temp-user-id for development
      let cachedProfile = allProfiles[userId] || allProfiles['temp-user-id'];
      
      // If user's profile doesn't have inputs, also check temp-user-id for resume data
      const tempProfile = allProfiles['temp-user-id'];
      const hasInputsInTemp = tempProfile?.inputs;
      
      console.log('Found cached profile for:', userId);
      console.log('Profile keys:', Object.keys(cachedProfile || {}));
      console.log('Has inputs in user profile?:', !!cachedProfile?.inputs);
      console.log('Has inputs in temp profile?:', !!hasInputsInTemp);
      
      if (cachedProfile) {
        // Extract resume text and LinkedIn summary from inputs if available
        let resumeText: string | undefined;
        let linkedInSummary: string | undefined;
        let psychographicProfile: any;
        
        // Try user profile first, then temp profile for inputs
        const inputSource = cachedProfile.inputs ? cachedProfile : tempProfile;
        
        if (inputSource?.inputs) {
          try {
            // Clean up the inputs string if it has a suffix
            let inputsString = typeof inputSource.inputs === 'string' 
              ? inputSource.inputs 
              : JSON.stringify(inputSource.inputs);
            
            // Remove any _prompt_updated suffix that might be appended
            inputsString = inputsString.replace(/_prompt_updated_\d+$/, '');
            
            const inputs = JSON.parse(inputsString);
            resumeText = inputs.resume;
            linkedInSummary = inputs.linkedin;
            console.log('Parsed inputs - Resume text length:', resumeText?.length, 'LinkedIn length:', linkedInSummary?.length);
          } catch (e) {
            console.error('Error parsing inputs:', e);
          }
        } else {
          console.log('No inputs found in cached profile or temp profile');
        }
        
        // Parse psychographic profile from profile field (try both sources)
        const profileSource = cachedProfile.profile ? cachedProfile : tempProfile;
        if (profileSource?.profile) {
          try {
            psychographicProfile = typeof profileSource.profile === 'string'
              ? JSON.parse(profileSource.profile)
              : profileSource.profile;
          } catch (e) {
            console.error('Error parsing profile:', e);
          }
        }
        
        profileData = {
          userId,
          email: session.user.email,
          name: session.user.name || undefined,
          onboardingComplete: cachedProfile.onboardingComplete || tempProfile?.onboardingComplete || false,
          // Parse profile text to extract structured data if available
          summary: cachedProfile.profile || tempProfile?.profile || undefined,
          last_updated: cachedProfile.timestamp 
            ? new Date(cachedProfile.timestamp).toISOString() 
            : tempProfile?.timestamp 
              ? new Date(tempProfile.timestamp).toISOString()
              : undefined,
          // Career stage fields (fallback to temp profile)
          careerStageUserSelected: cachedProfile.careerStageUserSelected || tempProfile?.careerStageUserSelected,
          resumeSignals: cachedProfile.resumeSignals || tempProfile?.resumeSignals,
          careerStage: cachedProfile.careerStage || tempProfile?.careerStage,
          // Career preferences fields
          careerPreferences: cachedProfile.careerPreferences,
          careerPreferencesCompleted: cachedProfile.careerPreferencesCompleted || false,
          // Additional data for AI-powered features
          resumeText,
          linkedInSummary,
          psychographicProfile,
        };
      }
    }
    
    // Check for uploaded resume
    const resumeMetadataPath = join(process.cwd(), 'uploads', 'resumes', 'metadata.json');
    if (existsSync(resumeMetadataPath)) {
      try {
        const resumeMetadata = JSON.parse(await readFile(resumeMetadataPath, 'utf-8'));
        // Find resume for this user (check both actual userId and temp-user-id)
        const userResume = resumeMetadata.find((r: any) => 
          r.userId === userId || r.userId === 'temp-user-id'
        );
        if (userResume && profileData) {
          profileData.resume = {
            filename: userResume.originalName,
            uploadedAt: userResume.uploadedAt,
          };
        }
      } catch (e) {
        console.error('Error reading resume metadata:', e);
      }
    }
    
    // Check for LinkedIn import
    const linkedinDir = join(process.cwd(), 'uploads', 'linkedin_profiles');
    if (existsSync(linkedinDir)) {
      try {
        const files = await readFile(linkedinDir, 'utf-8');
        // Simple check if any LinkedIn files exist
        if (profileData) {
          profileData.linkedin = {
            imported: true,
            importedAt: new Date().toISOString(),
          };
        }
      } catch (e) {
        // LinkedIn directory might not exist or be empty
      }
    }
    
    // If no profile exists, return a new user profile
    if (!profileData) {
      profileData = {
        userId,
        email: session.user.email,
        name: session.user.name || undefined,
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
