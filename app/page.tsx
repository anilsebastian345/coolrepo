'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from 'next-auth/react';

function getInitials(name: string | undefined) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
}

// Add SageLogo component from onboarding
function SageLogo({ vertical = false, size = 'lg' }: { vertical?: boolean; size?: 'sm' | 'lg' }) {
  const logoSize = size === 'sm' ? 'w-12 h-12' : 'w-20 h-20';
  const innerSize = size === 'sm' ? 'w-7 h-7' : 'w-12 h-12';
  const svgSize = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  const textSize = size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'}`}>
      <div className={`relative flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-[#f3f4f6] to-[#ececec] group hover:animate-logo-pulse transition-all ${logoSize}`}>
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center ${innerSize} group-hover:animate-logo-glow transition-all`}>
          <svg className={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: size === 'sm' ? '18%' : '18%', right: size === 'sm' ? '18%' : '18%' }}>
          {/* Decorative dot or accent if needed */}
        </div>
      </div>
      <span className={`font-semibold text-[#8a9a5b] mt-2 ${vertical ? '' : 'ml-2'} ${textSize}`}>Sage</span>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const welcomeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      localStorage.setItem('userName', session.user.name);
    }
    if (welcomeRef.current) {
      welcomeRef.current.classList.add('fade-in');
    }
  }, [session]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google');
    setIsLoading(false);
  };

  const handleGuestSignIn = async () => {
    console.log('Guest sign-in clicked');
    setIsLoading(true);
    try {
      // Create a guest session by setting localStorage and redirecting
      localStorage.setItem('userName', 'Guest User');
      localStorage.setItem('guestMode', 'true');
      console.log('localStorage set, navigating to /preview-onboarding');
      router.push('/preview-onboarding');
    } catch (error) {
      console.error('Error in guest sign-in:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 relative">
      {/* Profile Icon & Welcome */}
      {session ? (
        <>
          <div className="flex flex-col items-center mb-8">
            {/* Animated Profile Icon */}
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#e0e7ef] to-[#c8e6c9] shadow-xl animate-float">
              {session.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt="Profile" 
                  width={64} 
                  height={64}
                  className="rounded-full object-cover z-10" 
                  unoptimized
                />
              ) : (
                <span className="z-10 text-3xl font-semibold text-green-900 select-none">
                  {getInitials(session.user?.name ?? undefined)}
                </span>
              )}
            </div>
            {/* Welcome message in black */}
            <h1 className="text-2xl font-semibold mb-2 text-black">Welcome {session.user?.name?.split(' ')[0]}!</h1>
            <div className="mb-6" />
            {/* Line break and subtext */}
            <div className="mb-4 text-base text-[#55613b]">Sage is ready to pick up where you left off</div>
            <div className="mb-6" />
            {/* Break and review info link */}
            <div className="mb-4">
              <Link href="/preview-onboarding" className="text-gray-600 underline underline-offset-2 hover:text-amber-700 transition text-sm flex items-center justify-center space-x-1">
                <span>Review the information you have shared with me</span>
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {/* Break and larger Let's Chat button */}
            <div className="mb-4 flex flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#8a9a5b] to-[#55613b] shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 text-white text-base font-semibold"
              >
                <span className="text-lg">🎯</span>
                <span className="text-base">Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#e0e7ef] to-[#c8e6c9] shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 text-[#55613b] text-base font-semibold"
              >
                <span className="text-lg">💬</span>
                <span className="text-base">Let's chat</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      {/* Sage Logo - top-left if signed in, centered if signed out */}
      {session ? (
        <>
          <div className="fixed top-6 left-6 z-30">
            <SageLogo size="sm" />
          </div>
          <button
            onClick={() => signOut()}
            className="fixed top-6 right-6 flex items-center justify-center p-3 rounded-full bg-white/60 backdrop-blur-md shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 text-gray-700 z-30"
            title="Sign out"
            aria-label="Sign out"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <SageLogo vertical />
        </div>
      )}

      {/* Social Login Buttons */}
      {!session && (
        <div className="flex space-x-6 mb-10">
          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-14 h-14 bg-white rounded-[8px] border border-gray-200 border-[0.5px] flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <g>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </g>
            </svg>
          </button>
          {/* Guest */}
          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="px-6 py-3 bg-white rounded-[8px] border border-gray-200 border-[0.5px] flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition disabled:opacity-50"
          >
            <span className="text-gray-700 font-medium">Guest</span>
          </button>
        </div>
      )}

      {/* Divider and Secure Label */}
      <div className="flex items-center w-full max-w-md mx-auto my-8">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-xs text-gray-400 tracking-widest font-semibold">SECURE & PRIVATE</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Privacy Text */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-400">Your data is encrypted and never shared with third parties</p>
      </div>

      {/* Carousel Dots */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        <span className="w-2 h-2 rounded-full" style={{ background: '#d4dbc8' }}></span>
        <span className="w-2 h-2 rounded-full" style={{ background: '#8a9a5b' }}></span>
        <span className="w-2 h-2 rounded-full" style={{ background: '#55613b' }}></span>
      </div>

      

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="w-8 h-8 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text">Connecting...</p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 1.2s forwards;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 16px 4px #8a9a5b44; }
          50% { box-shadow: 0 0 32px 8px #8a9a5b99; }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
        @keyframes logo-pulse {
          0% { box-shadow: 0 0 0 0 #b2f5ea44; }
          70% { box-shadow: 0 0 24px 12px #b2f5ea44; }
          100% { box-shadow: 0 0 0 0 #b2f5ea44; }
        }
        .animate-logo-pulse:hover {
          animation: logo-pulse 1.2s infinite;
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 0 0 0 #8a9a5b44; }
          50% { box-shadow: 0 0 16px 8px #8a9a5b88; }
        }
        .animate-logo-glow {
          animation: logo-glow 1.2s infinite;
        }
      `}</style>
    </div>
  );
}