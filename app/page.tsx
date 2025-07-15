'use client';

import { useState } from 'react';
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-[#f3f4f6] to-[#ececec]">
          {/* Inner gradient circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
            {/* Plus sign - sharp, no glow */}
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          {/* Yellow dot - smaller, between circles */}
          <div className="absolute" style={{ top: '14%', right: '14%' }}>
            <div className="w-3 h-3 rounded-full bg-[#ffe082] shadow" />
          </div>
        </div>
        <h1 className="mt-6 text-3xl text-text font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
      </div>

      {/* Social Login Buttons */}
      <div className="flex space-x-6 mb-10">
        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-14 h-14 bg-white rounded-lg border border-gray-200 border-[0.5px] flex items-center justify-center hover:shadow transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <g>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </g>
          </svg>
        </button>
        {/* Facebook */}
        <button
          onClick={handleFacebookSignIn}
          disabled={isLoading}
          className="w-14 h-14 bg-white rounded-lg border border-gray-200 border-[0.5px] flex items-center justify-center hover:shadow transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="#1877F3" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        {/* Apple */}
        <button
          onClick={handleAppleSignIn}
          disabled={isLoading}
          className="w-14 h-14 bg-white rounded-lg border border-gray-200 border-[0.5px] flex items-center justify-center hover:shadow transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="#000" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>
      </div>

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

      {/* Preview Onboarding Link */}
      <Link href="/preview-onboarding" className="text-gray-500 underline underline-offset-2 hover:text-amber-700 transition text-sm flex items-center justify-center space-x-1">
        <span>Preview Onboarding</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="w-8 h-8 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text">Connecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}