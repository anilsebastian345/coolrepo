"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function ProfileInsightsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Load profile from localStorage
    if (typeof window !== 'undefined') {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      
      if (profileJson) {
        try {
          const parsed = JSON.parse(profileJson);
          setProfile(parsed);
          
          // Extract name from title
          if (parsed.title) {
            const nameMatch = parsed.title.match(/^🧠\s*(.+?)\s*–/);
            if (nameMatch) {
              setUserName(nameMatch[1].trim());
            }
          }
        } catch (e) {
          console.error('Error parsing profile:', e);
          router.push('/dashboard');
        }
      } else {
        // No profile found, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [router]);

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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#6F6F6F] hover:text-[#7A8E50] transition-colors mb-8"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Section 1: Core Strengths */}
        {profile.strength_signatures && Array.isArray(profile.strength_signatures) && profile.strength_signatures.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Core Strengths
              </h2>
              <div className="w-16 h-1 bg-[#7A8E50] rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              {profile.strength_signatures.map((strength, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#E5E5E5] p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {strength.trait}
                  </h3>
                  
                  <div className="mb-5">
                    <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      What this looks like in action
                    </h4>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {strength.evidence}
                    </p>
                  </div>
                  
                  <div className="bg-[#F5F7F4] rounded-lg p-4 border-l-4 border-[#7A8E50]">
                    <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Why it matters
                    </h4>
                    <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {strength.why_it_matters}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Latent Risks & Blind Spots */}
        {profile.latent_risks_and_blind_spots && Array.isArray(profile.latent_risks_and_blind_spots) && profile.latent_risks_and_blind_spots.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Latent Risks & Blind Spots
              </h2>
              <div className="w-16 h-1 bg-[#7A8E50] rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              {profile.latent_risks_and_blind_spots.map((risk, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#E5E5E5] p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {risk.pattern}
                  </h3>
                  
                  <div className="mb-5">
                    <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Risk
                    </h4>
                    <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {risk.risk}
                    </p>
                  </div>
                  
                  <div className="bg-[#FFF9F0] rounded-lg p-5 border-l-4 border-[#D97706]">
                    <h4 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Coaching prompt
                    </h4>
                    <blockquote className="text-sm text-[#4A4A4A] leading-relaxed italic" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {risk.coaching_prompt}
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Personalized Coaching Focus */}
        {profile.personalized_coaching_focus && Array.isArray(profile.personalized_coaching_focus) && profile.personalized_coaching_focus.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Personalized Coaching Focus
              </h2>
              <div className="w-16 h-1 bg-[#7A8E50] rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {profile.personalized_coaching_focus.map((focus, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A8E50] to-[#55613b] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">{idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#232323] flex-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {focus.area}
                    </h3>
                  </div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed ml-11" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {focus.goal}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Profile Fields */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Additional Insights
            </h2>
            <div className="w-16 h-1 bg-[#7A8E50] rounded-full"></div>
          </div>

          <div className="space-y-6">
            {profile.archetype && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Archetype
                </h3>
                <p className="text-[#232323] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.archetype}
                </p>
              </div>
            )}

            {profile.core_drives_and_values && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Core Drives & Values
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.core_drives_and_values}
                </p>
              </div>
            )}

            {profile.cognitive_style && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Cognitive Style
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.cognitive_style}
                </p>
              </div>
            )}

            {profile.leadership_style && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Leadership Style
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.leadership_style}
                </p>
              </div>
            )}

            {profile.communication_style && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Communication Style
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.communication_style}
                </p>
              </div>
            )}

            {profile.risk_and_ambition && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Risk & Ambition
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.risk_and_ambition}
                </p>
              </div>
            )}

            {profile.summary && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
                <h3 className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Summary
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.summary}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Back to Dashboard CTA */}
        <div className="text-center py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A8E50] text-white rounded-lg hover:bg-[#55613b] transition-colors font-medium shadow-sm"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
