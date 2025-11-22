'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from 'next-auth/react';

function getInitials(name: string | undefined) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showValuePanel, setShowValuePanel] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.name) {
      localStorage.setItem('userName', session.user.name);
    }
  }, [session]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google');
  };

  const handleGuestSignIn = () => {
    setIsLoading(true);
    localStorage.setItem('userName', 'Guest User');
    localStorage.setItem('guestMode', 'true');
    // Use window.location for a hard navigation to ensure clean state
    window.location.href = '/onboarding/questions';
  };

  // If user is already signed in, redirect based on profile existence
  useEffect(() => {
    if (session) {
      // Check if user has a psychographic profile
      const hasProfile = typeof window !== 'undefined' && localStorage.getItem('onboarding_psych_profile');
      
      if (hasProfile) {
        // Returning user with profile - go to dashboard
        router.push('/dashboard');
      } else {
        // New user without profile - go to onboarding
        router.push('/preview-onboarding');
      }
    }
  }, [session, router]);

  // Show loading while redirecting
  if (session) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#f3f4f6] to-[#e8e8e8] shadow-md animate-pulse">
            <div className="absolute w-11 h-11 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center px-6">
      {/* Main Content - Centered with generous spacing */}
      <div className="flex flex-col items-center w-full max-w-sm">
        
        {/* 1. Logo */}
        <div className="mb-8">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#f3f4f6] to-[#e8e8e8] shadow-md">
            <div className="absolute w-11 h-11 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Product Name */}
        <h1 
          className="mb-6 text-[32px] font-semibold text-gray-900 tracking-tight" 
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          Sage
        </h1>

        {/* 3. Tagline */}
        <h2 
          className="mb-3 text-lg font-medium text-[#232323] text-center tracking-tight" 
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          Clarity for your professional journey.
        </h2>

        {/* 4. Subline */}
        <p 
          className="mb-12 text-sm font-light text-gray-500 text-center max-w-[340px] leading-relaxed" 
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          Personalized insights, reflection, and guidance — built around you.
        </p>

        {/* 5. Buttons */}
        <div className="w-full flex flex-col space-y-5 mb-8">
          {/* Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[15px] font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Continue as Guest */}
          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-white border border-[#D4D4D4] rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            <span className="text-[15px] font-medium text-gray-700">Continue as Guest</span>
          </button>
        </div>

        {/* 6. Privacy Section */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <p 
            className="text-[11px] font-medium text-gray-400 uppercase tracking-widest" 
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Secure & Private
          </p>
          <p 
            className="text-xs text-gray-400 max-w-[300px] leading-relaxed" 
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Your data is encrypted and never shared with third parties.
          </p>
        </div>

        {/* 7. What can Sage do for me? Link */}
        <div className="mt-8 w-full flex justify-center">
          <button
            onClick={() => setShowValuePanel(!showValuePanel)}
            className="text-sm text-[#7A8E50] hover:text-[#55613b] font-medium transition-colors"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            What can Sage do for me?
          </button>
        </div>

          {/* Value Panel */}
          {showValuePanel && (
            <div className="mt-4 bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-lg animate-fade-in-up">
              {/* Aspirational Value Statement */}
              <p className="text-base font-medium text-[#232323] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Understand your strengths. Make confident career decisions.
              </p>
              
              {/* Benefit List */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#7A8E50] mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Understand your strengths
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#7A8E50] mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Explore best-fit roles
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#7A8E50] mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Refine your resume & story
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#7A8E50] mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    See how you match real roles
                  </p>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
