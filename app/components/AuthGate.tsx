'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '../hooks/useUserProfile';

// Pages that don't require authentication
const PUBLIC_ROUTES = ['/'];

// Pages that require authentication but not onboarding
const AUTH_ONLY_ROUTES = ['/onboarding/questions', '/preview-onboarding'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const { userProfile, isLoading: profileLoading, error } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public routes without any checks
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }

    // Wait for session to be determined
    if (sessionStatus === 'loading') {
      return;
    }

    // If not authenticated and trying to access protected route, redirect to home
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
      return;
    }

    // If authenticated, wait for profile to load (unless on auth-only routes)
    if (sessionStatus === 'authenticated') {
      // Allow access to onboarding pages while profile loads
      if (AUTH_ONLY_ROUTES.includes(pathname)) {
        return;
      }

      // For other protected routes, wait for profile
      if (profileLoading) {
        return;
      }

      // If there's an error fetching profile, redirect to onboarding
      if (error) {
        console.error('Error loading profile, redirecting to onboarding:', error);
        router.push('/onboarding/questions');
        return;
      }

      // If profile loaded successfully, check onboarding status
      if (userProfile) {
        // All feature pages handle their own empty states
        // Don't redirect - let pages show "complete onboarding" message if needed
        // This prevents redirect loops and gives better UX
        
        // Note: We deliberately don't redirect from / to /dashboard
        // to allow users to see the welcome page and choose where to go
      }
    }
  }, [sessionStatus, profileLoading, userProfile, error, router, pathname]);

  // Allow public routes to render immediately
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Show loading spinner while determining auth state
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if unauthenticated
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // For authenticated users on auth-only routes, render immediately
  if (AUTH_ONLY_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // For other protected routes, show loading while profile loads
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Render children once everything is validated
  return <>{children}</>;
}
