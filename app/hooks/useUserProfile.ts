import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CareerStage, CareerStageUserSelected, ResumeSignals, CareerPreferences } from '@/lib/careerStage';

export interface UserProfile {
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
  // Career stage fields
  careerStageUserSelected?: CareerStageUserSelected;
  resumeSignals?: ResumeSignals;
  careerStage?: CareerStage;
  // Career preferences fields
  careerPreferences?: CareerPreferences;
  careerPreferencesCompleted?: boolean;
  // Additional data for AI-powered features
  psychographicProfile?: any;
  resumeText?: string;
  linkedInSummary?: string;
  questions?: any;
}

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { status: sessionStatus } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Check for guest mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsGuestMode(localStorage.getItem('guestMode') === 'true');
    }
  }, []);

  const fetchProfile = async () => {
    // If authenticated, clear ALL guest/onboarding localStorage (fixes bug where guest data persists after sign-in)
    if (sessionStatus === 'authenticated' && typeof window !== 'undefined') {
      const hadGuestMode = localStorage.getItem('guestMode') === 'true';
      if (hadGuestMode) {
        console.log('Clearing all guest mode data - user is now authenticated');
        // Clear all onboarding and guest-related keys
        localStorage.removeItem('guestMode');
        localStorage.removeItem('userName');
        localStorage.removeItem('onboarding_psych_profile');
        localStorage.removeItem('onboarding_questions');
        localStorage.removeItem('onboarding_questions_completed');
        localStorage.removeItem('onboarding_resume_text');
        localStorage.removeItem('onboarding_resume_uploaded');
        localStorage.removeItem('onboarding_resume_data');
        localStorage.removeItem('onboarding_linkedin_complete');
        localStorage.removeItem('onboarding_linkedin_text');
        localStorage.removeItem('onboarding_linkedin_data');
        localStorage.removeItem('onboarding_career_stage');
        setIsGuestMode(false);
      }
    }
    
    // Check if user is in guest mode (only if not authenticated)
    const guestMode = sessionStatus !== 'authenticated' && typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true';
    
    // Don't fetch if not authenticated AND not in guest mode
    if (sessionStatus !== 'authenticated' && !guestMode) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/me');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }
    
    fetchProfile();
  }, [sessionStatus, isGuestMode]);

  return {
    userProfile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
