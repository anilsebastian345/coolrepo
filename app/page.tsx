'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { signIn, useSession } from 'next-auth/react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.name) {
      localStorage.setItem('userName', session.user.name);
    }
  }, [session]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Clear any guest mode flags and onboarding data before signing in
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
    await signIn('google');
  };

  const handleGuestSignIn = () => {
    setIsLoading(true);
    // Set guest mode in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', 'Guest User');
      localStorage.setItem('guestMode', 'true');
      console.log('Guest mode enabled, redirecting to onboarding');
    }
    // Small delay to ensure localStorage is written
    setTimeout(() => {
      router.push('/preview-onboarding');
    }, 100);
  };

  const scrollToNextSection = () => {
    const howWeHelpSection = document.getElementById('how-we-help');
    howWeHelpSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // If user is already signed in, check server-side profile
  // But ONLY redirect from the landing page itself
  useEffect(() => {
    // Only run redirect logic if we're actually on the landing page
    // (not if this component accidentally renders elsewhere)
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return;
    
    if (session) {
      // Fetch user profile from server to check if onboarding is complete
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          if (data.onboardingComplete) {
            // Returning user with profile - go to dashboard
            router.push('/dashboard');
          } else {
            // New user without profile - go to onboarding
            router.push('/preview-onboarding');
          }
        })
        .catch(err => {
          console.error('Error fetching profile:', err);
          // On error, default to onboarding
          router.push('/preview-onboarding');
        });
    }
  }, [session, router]);

  // Show loading while redirecting
  if (session) {
    return (
      <div className="min-h-screen bg-[#F8F7F1] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] flex items-center justify-center shadow-md animate-pulse">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-[#4A4A4A]">Loading...</p>
        </div>
      </div>
    );
  }

  // Full marketing landing page
  return (
    <main className="bg-[#F8F7F1]">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-[560px] mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo Circle */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] flex items-center justify-center shadow-md">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="text-4xl md:text-5xl font-semibold text-[#222222] tracking-tight">
            Sage
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-[#222222] font-medium">
            Clarity for your professional journey.
          </p>

          {/* Supporting Line */}
          <p className="text-sm md:text-base text-[#4A4A4A] max-w-md mx-auto">
            Personalized insights, reflection, and guidance — built around you.
          </p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full md:w-56 py-2.5 px-5 bg-[#E8EDE0] text-[#4A4A4A] rounded-full font-semibold flex items-center justify-center gap-3 shadow-sm hover:bg-[#D9E2C8] hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A8E50]"
              type="button"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[14px]">Continue with Google</span>
            </button>

            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full md:w-56 py-2.5 px-5 bg-white border border-gray-300 rounded-full text-[#4A4A4A] font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
              type="button"
            >
              <span className="text-[14px]">Continue as Guest</span>
            </button>
          </div>

          {/* Privacy Section */}
          <div className="pt-8 space-y-3">
            <p className="text-xs font-semibold tracking-widest text-[#999999] uppercase">
              Secure & Private
            </p>
            <p className="text-xs text-[#4A4A4A] max-w-sm mx-auto">
              Your data is encrypted and never shared with third parties.
            </p>
            <button
              onClick={scrollToNextSection}
              className="text-sm text-[#7C9151] hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151] rounded"
              type="button"
            >
              What can Sage do for me?
            </button>
          </div>
        </div>
      </section>

      {/* HOW WE HELP YOU GROW */}
      <section id="how-we-help" className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4">
              How we help you grow
            </h2>
            <p className="text-base md:text-lg text-[#4A4A4A]">
              Professional coaching tailored to your unique journey and aspirations
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 cursor-default ${
                hoveredCard === 1 ? '-translate-y-1 shadow-lg' : ''
              }`}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="w-12 h-12 rounded-lg bg-[#E8F0DC] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#7C9151]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                Career Direction
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                Find clarity on your career path with personalized assessments and strategic planning.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 cursor-default ${
                hoveredCard === 2 ? '-translate-y-1 shadow-lg' : ''
              }`}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="w-12 h-12 rounded-lg bg-[#E8F0DC] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#7C9151]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                Skills Development
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                Identify and develop the skills needed to achieve your professional goals.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 cursor-default ${
                hoveredCard === 3 ? '-translate-y-1 shadow-lg' : ''
              }`}
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="w-12 h-12 rounded-lg bg-[#E8F0DC] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#7C9151]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                Growth Strategy
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                Create actionable plans to accelerate your career progression and reach new milestones.
              </p>
            </div>

            {/* Card 4 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 cursor-default ${
                hoveredCard === 4 ? '-translate-y-1 shadow-lg' : ''
              }`}
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="w-12 h-12 rounded-lg bg-[#E8F0DC] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#7C9151]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                Leadership Coaching
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                Build confidence and capabilities to lead teams and drive meaningful impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[#F2F3EA] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4">
              Trusted by professionals
            </h2>
            <p className="text-base md:text-lg text-[#4A4A4A]">
              Hear from those who've transformed their careers with Sage
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-[#7C9151] text-3xl font-serif">"</div>
              <p className="text-[#4A4A4A] leading-relaxed">
                Sage helped me navigate a career transition with confidence. The personalized guidance made all the difference.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-semibold text-[#222222]">Sarah Chen</p>
                <p className="text-sm text-[#4A4A4A]">Marketing Manager</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-[#7C9151] text-3xl font-serif">"</div>
              <p className="text-[#4A4A4A] leading-relaxed">
                The clarity I gained from coaching sessions transformed my approach to career development. Highly recommend.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-semibold text-[#222222]">Michael Rodriguez</p>
                <p className="text-sm text-[#4A4A4A]">Software Engineer</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-[#7C9151] text-3xl font-serif">"</div>
              <p className="text-[#4A4A4A] leading-relaxed">
                Working with Sage gave me the tools and confidence to pursue leadership opportunities I never thought possible.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-semibold text-[#222222]">Emily Johnson</p>
                <p className="text-sm text-[#4A4A4A]">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-[640px] mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222222]">
            Ready to take the next step?
          </h2>
          <p className="text-base md:text-lg text-[#4A4A4A]">
            Join thousands of professionals who have found clarity and direction through Sage.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-[#7C9151] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151]"
              type="button"
            >
              Get Started Today
            </button>
            <button
              onClick={scrollToNextSection}
              className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-[#7C9151] text-[#7C9151] font-medium rounded-full hover:bg-[#F8F7F1] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151]"
              type="button"
            >
              Learn More
            </button>
          </div>

          <p className="text-sm text-[#4A4A4A] pt-4">
            Free initial consultation • No commitment required
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo and Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8C686] to-[#7C9151] flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#222222]">Sage</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              <a href="#about" className="text-sm text-[#4A4A4A] hover:text-[#7C9151] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151] rounded">
                About
              </a>
              <a href="#services" className="text-sm text-[#4A4A4A] hover:text-[#7C9151] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151] rounded">
                Services
              </a>
              <a href="#privacy" className="text-sm text-[#4A4A4A] hover:text-[#7C9151] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151] rounded">
                Privacy
              </a>
              <a href="#terms" className="text-sm text-[#4A4A4A] hover:text-[#7C9151] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C9151] rounded">
                Terms
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#999999]">
              © 2024 Sage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}
