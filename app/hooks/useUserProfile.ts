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

  const fetchProfile = async () => {
    // Don't fetch if not authenticated
    if (sessionStatus !== 'authenticated') {
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
  }, [sessionStatus]);

  return {
    userProfile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
