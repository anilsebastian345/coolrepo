"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { useUserProfile } from "../hooks/useUserProfile";

interface ProfileData {
  title?: string;
  archetype?: string;
  core_theme?: string;
  core_drives_and_values?: string;
  cognitive_style?: string;
  leadership_style?: string;
  communication_style?: string;
  risk_and_ambition?: string;
  growth_and_blind_spots?: string;
  summary?: string;
  strength_signatures?: Array<{
    trait: string;
    evidence: string;
    why_it_matters: string;
  }>;
  latent_risks_and_blind_spots?: Array<{
    pattern: string;
    risk: string;
    coaching_prompt: string;
  }>;
  personalized_coaching_focus?: Array<{
    area: string;
    goal: string;
  }>;
  suggested_focus?: string;
}

const extractFirstNameFromTitle = (title?: string) => {
  if (!title) {
    return null;
  }

  const nameMatch = title.match(/^🧠\s*(.+?)\s*–/);
  if (!nameMatch) {
    return null;
  }

  const candidate = nameMatch[1].trim();
  if (!candidate) {
    return null;
  }

  const parts = candidate.split(/\s+/);
  if (parts.length < 2) {
    return null;
  }

  return candidate;
};

export default function ProfileInsightsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { userProfile } = useUserProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userName, setUserName] = useState('');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Load profile from userProfile (server-side)
    if (userProfile?.psychographicProfile) {
      console.log('Loading profile from server');
      setProfile(userProfile.psychographicProfile);
      return;
    }
    
    // For guest users only: fallback to localStorage
    if (typeof window !== 'undefined' && !session) {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      
      if (profileJson) {
        try {
          const parsed = JSON.parse(profileJson);
          setProfile(parsed);
        } catch (e) {
          console.error('Error parsing profile:', e);
          router.push('/dashboard');
        }
      } else {
        // No profile found, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [router, userProfile, session]);

  useEffect(() => {
    if (userName) {
      return;
    }

    // Authenticated users: always use session name
    if (session?.user?.name) {
      setUserName(session.user.name);
      return;
    }

    // Guest users: use extracted name from resume/LinkedIn or 'Guest User'
    if (userProfile?.name) {
      setUserName(userProfile.name);
      return;
    }

    // Final fallback for guests
    setUserName('Guest User');
  }, [userName, session?.user?.name, userProfile?.name]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Helper to register cards for animation
  const registerCard = (index: number) => (el: HTMLDivElement | null) => {
    if (el && observerRef.current) {
      el.setAttribute('data-index', index.toString());
      observerRef.current.observe(el);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7A8E50] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* Top Nav - Simple version */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#7A8E50]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Sage</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#6F6F6F] hover:text-[#7A8E50] transition-all duration-200 mb-8 group"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Executive Psychographic Profile
          </h1>
          <p className="text-lg text-[#6F6F6F] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            A deeper view of your strengths, risks, and coaching focus.
          </p>
          {userName && (
            <p className="text-sm text-[#8F8F8F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              For <span className="font-medium text-[#4A4A4A]">{userName}</span>
            </p>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
          {/* Main content column */}
          <div className="space-y-16">
            {/* Summary Section */}
            {profile.summary && (
              <div className="bg-gradient-to-r from-[#F5F7F4] to-[#FAFAF6] rounded-xl border border-[#E5E5E5] p-6 shadow-sm border-l-4 border-l-[#7A8E50]">
                <h2 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Summary
                </h2>
                <p className="text-[#232323] leading-relaxed text-base" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.summary}
                </p>
              </div>
            )}

            {/* Growth Indicators */}
            <div className="flex flex-wrap gap-2">
              {['Behavioral', 'Leadership', 'Collaboration', 'Strategic Thinking'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-xs text-[#6F6F6F] shadow-sm"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Section 1: Core Strengths */}
            {profile.strength_signatures && Array.isArray(profile.strength_signatures) && profile.strength_signatures.length > 0 && (
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[#232323] mb-3 group cursor-default" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Core Strengths
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-[#7A8E50] to-transparent rounded-full w-24 group-hover:w-32 transition-all duration-300"></div>
                </div>
                
                <div className="space-y-6">
                  {profile.strength_signatures.map((strength, idx) => {
                    const icon = idx === 0 ? '🔄' : idx === 1 ? '⚡' : idx === 2 ? '🤝' : '🧘‍♂️';
                    return (
                      <div
                        key={idx}
                        ref={registerCard(idx)}
                        className={`bg-white rounded-xl border border-[#E5E5E5] p-8 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                          visibleCards.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <span className="text-2xl opacity-60">{icon}</span>
                          <h3 className="text-xl font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {strength.trait}
                          </h3>
                        </div>
                        
                        <div className="mb-4 bg-[#F7F7F2] rounded-lg p-5 border-l-[3px] border-[#7A8E50]">
                          <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            What this looks like in action
                          </h4>
                          <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {strength.evidence}
                          </p>
                        </div>
                        
                        <div className="bg-[#F4F7EF] rounded-lg p-5 border-l-[3px] border-[#7A8E50]">
                          <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Why it matters
                          </h4>
                          <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {strength.why_it_matters}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 2: Latent Risks & Blind Spots */}
            {profile.latent_risks_and_blind_spots && Array.isArray(profile.latent_risks_and_blind_spots) && profile.latent_risks_and_blind_spots.length > 0 && (
              <section>
                <div className="mb-8 pt-12">
                  <h2 className="text-2xl font-semibold text-[#232323] mb-3 group cursor-default" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Latent Risks & Blind Spots
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-[#7A8E50] to-transparent rounded-full w-24 group-hover:w-32 transition-all duration-300"></div>
                </div>
                
                <div className="space-y-6">
                  {profile.latent_risks_and_blind_spots.map((risk, idx) => {
                    const cardIndex = (profile.strength_signatures?.length || 0) + idx;
                    return (
                      <div
                        key={idx}
                        ref={registerCard(cardIndex)}
                        className={`bg-white rounded-xl border border-[#E5E5E5] p-8 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                          visibleCards.has(cardIndex) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <span className="text-xl text-amber-600">⚠️</span>
                          <h3 className="text-xl font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {risk.pattern}
                          </h3>
                        </div>
                        
                        <div className="mb-4 bg-[#F7F7F2] rounded-lg p-5 border-l-[3px] border-amber-500">
                          <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Risk
                          </h4>
                          <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {risk.risk}
                          </p>
                        </div>
                        
                        <div className="bg-[#FFF9F0] rounded-lg p-5 border-l-[3px] border-[#D97706]">
                          <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Coaching prompt
                          </h4>
                          <blockquote className="text-sm text-[#4A4A4A] leading-relaxed italic" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {risk.coaching_prompt}
                          </blockquote>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 3: Personalized Coaching Focus */}
            {profile.personalized_coaching_focus && Array.isArray(profile.personalized_coaching_focus) && profile.personalized_coaching_focus.length > 0 && (
              <section>
                <div className="mb-8 pt-12">
                  <h2 className="text-2xl font-semibold text-[#232323] mb-3 group cursor-default" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Personalized Coaching Focus
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-[#7A8E50] to-transparent rounded-full w-24 group-hover:w-32 transition-all duration-300"></div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.personalized_coaching_focus.map((focus, idx) => {
                    const cardIndex = (profile.strength_signatures?.length || 0) + (profile.latent_risks_and_blind_spots?.length || 0) + idx;
                    return (
                      <div
                        key={idx}
                        ref={registerCard(cardIndex)}
                        className={`bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                          visibleCards.has(cardIndex) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A8E50] to-[#55613b] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-sm font-semibold">{idx + 1}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-lg">🎯</span>
                            <h3 className="text-lg font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                              {focus.area}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-[#4A4A4A] leading-relaxed ml-11" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {focus.goal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Additional Profile Fields */}
            <section>
              <div className="mb-8 pt-12">
                <h2 className="text-2xl font-semibold text-[#232323] mb-3 group cursor-default" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Additional Insights
                </h2>
                <div className="h-1 bg-gradient-to-r from-[#7A8E50] to-transparent rounded-full w-24 group-hover:w-32 transition-all duration-300"></div>
              </div>

              <div className="space-y-6">
                {profile.archetype && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Archetype
                    </h3>
                    <p className="text-[#232323] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.archetype}
                    </p>
                  </div>
                )}

                {profile.core_drives_and_values && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Core Drives & Values
                    </h3>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.core_drives_and_values}
                    </p>
                  </div>
                )}

                {profile.cognitive_style && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Cognitive Style
                    </h3>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.cognitive_style}
                    </p>
                  </div>
                )}

                {profile.leadership_style && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Leadership Style
                    </h3>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.leadership_style}
                    </p>
                  </div>
                )}

                {profile.communication_style && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Communication Style
                    </h3>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.communication_style}
                    </p>
                  </div>
                )}

                {profile.risk_and_ambition && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Risk & Ambition
                    </h3>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {profile.risk_and_ambition}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Back to Dashboard CTA */}
            <div className="text-center py-8 mt-12">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A8E50] text-white rounded-lg hover:bg-[#55613b] hover:shadow-md transition-all duration-200 font-medium shadow-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Sticky Sidebar - Right Column */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-white to-[#F5F7F4] rounded-xl border border-[#E5E5E5] p-6 shadow-md">
                <h3 className="text-sm font-semibold text-[#7A8E50] uppercase tracking-wider mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Your Snapshot
                </h3>
                
                <div className="space-y-5">
                  {/* Core Theme */}
                  {(profile.core_theme || profile.archetype) && (
                    <div>
                      <div className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Core Theme
                      </div>
                      <div className="text-sm text-[#232323] font-medium leading-snug" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {profile.core_theme || profile.archetype}
                      </div>
                    </div>
                  )}

                  {/* Top Strength */}
                  {profile.strength_signatures && profile.strength_signatures.length > 0 && (
                    <div>
                      <div className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Top Strength
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-base">🔄</span>
                        <div className="text-sm text-[#232323] font-medium leading-snug" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {profile.strength_signatures[0].trait}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Risk */}
                  {profile.latent_risks_and_blind_spots && profile.latent_risks_and_blind_spots.length > 0 && (
                    <div>
                      <div className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Top Risk
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-base text-amber-600">⚠️</span>
                        <div className="text-sm text-[#232323] font-medium leading-snug" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {profile.latent_risks_and_blind_spots[0].pattern}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coaching Priority */}
                  {profile.personalized_coaching_focus && profile.personalized_coaching_focus.length > 0 && (
                    <div>
                      <div className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Coaching Priority
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-base">🎯</span>
                        <div className="text-sm text-[#232323] font-medium leading-snug" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {profile.personalized_coaching_focus[0].area}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[#E5E5E5]"></div>

                {/* Quick actions or additional info */}
                <div className="text-xs text-[#6F6F6F] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  💡 This profile is generated from your responses and career history. Review it regularly as you grow.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
