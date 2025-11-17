import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { CareerStage, CareerStageUserSelected, ResumeSignals } from '@/lib/careerStage';

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
      const cachedProfile = allProfiles[userId] || allProfiles['temp-user-id'];
      
      if (cachedProfile) {
        profileData = {
          userId,
          email: session.user.email,
          name: session.user.name || undefined,
          onboardingComplete: cachedProfile.onboardingComplete || false,
          // Parse profile text to extract structured data if available
          summary: cachedProfile.profile || undefined,
          last_updated: cachedProfile.timestamp 
            ? new Date(cachedProfile.timestamp).toISOString() 
            : undefined,
          // Career stage fields
          careerStageUserSelected: cachedProfile.careerStageUserSelected,
          resumeSignals: cachedProfile.resumeSignals,
          careerStage: cachedProfile.careerStage,
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
