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

  // If user is already signed in, show welcome screen
  if (session) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#e0e7ef] to-[#c8e6c9] shadow-lg">
            {session.user?.image ? (
              <Image 
                src={session.user.image} 
                alt="Profile" 
                width={64} 
                height={64}
                className="rounded-full object-cover" 
                unoptimized
              />
            ) : (
              <span className="text-3xl font-semibold text-green-900">
                {getInitials(session.user?.name ?? undefined)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-medium text-gray-900">Welcome back, {session.user?.name?.split(' ')[0]}!</h1>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-lg bg-gradient-to-br from-[#8a9a5b] to-[#55613b] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Chat
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-8 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center px-4 relative">
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center max-w-md w-full space-y-12">
        
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#f3f4f6] to-[#e8e8e8] shadow-lg">
            <div className="absolute w-11 h-11 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>Sage</h1>
        </div>

        {/* Tagline & Subline */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <h2 className="text-xl font-medium text-gray-800 tracking-tight" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
            Clarity for your professional journey.
          </h2>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
            Personalized insight, reflection, and guidance — built around you.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full max-w-xs px-6 py-3.5 bg-white border border-gray-300 rounded-lg flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>

          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full max-w-xs px-6 py-3.5 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}
          >
            <span className="text-gray-700 font-medium">Continue as Guest</span>
          </button>
        </div>

        {/* Privacy Text */}
        <div className="flex flex-col items-center space-y-2 text-center mt-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
            Secure & Private
          </p>
          <p className="text-xs text-gray-400 max-w-xs" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
            Your data is encrypted and never shared with third parties.
          </p>
        </div>

      </div>
    </div>
  );
}
