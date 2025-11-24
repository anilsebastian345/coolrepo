"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from 'next-auth/react';
import { useUserProfile } from "../hooks/useUserProfile";
import RecentRolesWidget from "../components/RecentRolesWidget";

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

  return parts[0];
};

function TopNav({ activeTab, firstName }: { activeTab: string; firstName?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/profile' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/resume-intel' },
    { id: 'rolefit', label: 'Role Fit', href: '/job-match' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = firstName || session?.user?.name?.split(' ')[0] || 'User';

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#7A8E50]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Sage</span>
          </Link>
          
          {/* Nav Items & User Dropdown */}
          <div className="flex items-center gap-4">
            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-[#7A8E50] text-white shadow-sm'
                      : 'text-[#4A4A4A] hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                <span className="text-sm font-medium text-[#4A4A4A]">{displayName}</span>
                <svg
                  className={`w-4 h-4 text-[#6F6F6F] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      router.push('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      router.push('/preview-onboarding');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Update profile inputs
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      // Clear all user-specific data
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
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg text-[#4A4A4A] hover:bg-gray-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface FeatureTileProps {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  available: boolean;
}

function FeatureTile({ title, subtitle, icon, href, available }: FeatureTileProps) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => available && router.push(href)}
      disabled={!available}
      className={`
        group relative p-6 rounded-xl border text-left transition-all duration-200
        ${available 
          ? 'bg-white hover:shadow-md hover:border-[#7A8E50]/30 cursor-pointer border-[#E5E5E5]' 
          : 'bg-gray-50 cursor-not-allowed border-[#E5E5E5] opacity-60'
        }
      `}
    >
      {/* Icon */}
      <div className={`text-3xl mb-4 transition-transform duration-200 ${available ? 'group-hover:scale-105' : ''}`}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm text-[#6F6F6F] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {subtitle}
      </p>
      
      {/* CTA */}
      {available && (
        <div className="flex items-center text-[#7A8E50] text-sm font-medium group-hover:text-[#55613b]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          <span>Explore</span>
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      {!available && (
        <div className="text-sm text-[#8F8F8F] font-light" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          Complete onboarding first
        </div>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { userProfile, isLoading } = useUserProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedStrengths, setExpandedStrengths] = useState<Set<number>>(new Set());
  const [expandedRisks, setExpandedRisks] = useState<Set<number>>(new Set());

  // Derive state from userProfile and localStorage
  const hasResume = !!userProfile?.resumeText;
  const hasLinkedIn = !!userProfile?.linkedInSummary;
  const [hasProfile, setHasProfile] = useState(false);

  // Debug logging
  useEffect(() => {
    if (userProfile) {
      console.log('Dashboard - userProfile:', {
        hasResumeText: !!userProfile.resumeText,
        resumeTextLength: userProfile.resumeText?.length,
        hasLinkedInSummary: !!userProfile.linkedInSummary,
        linkedInLength: userProfile.linkedInSummary?.length,
        keys: Object.keys(userProfile)
      });
      console.log('Dashboard - Full userProfile object:', userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (firstName) {
      return;
    }

    // Authenticated users: always use session name
    if (session?.user?.name) {
      setFirstName(session.user.name.split(' ')[0]);
      return;
    }

    // Guest users: use extracted name from resume/LinkedIn or 'Guest User'
    if (userProfile?.name) {
      setFirstName(userProfile.name.split(' ')[0]);
      return;
    }

    // Final fallback for guests
    setFirstName('Guest User');
  }, [firstName, session?.user?.name, userProfile?.name]);

  useEffect(() => {
    console.log('Dashboard state:', {
      hasResume,
      hasLinkedIn,
      hasProfile,
      isLoading
    });
  }, [hasResume, hasLinkedIn, hasProfile, isLoading]);

  useEffect(() => {
    // Priority 1: Load profile from userProfile (server-side, for authenticated users)
    if (userProfile?.psychographicProfile) {
      console.log('Loading dashboard from server profile');
      setProfile(userProfile.psychographicProfile);
      setHasProfile(true);
      
      const extractedName = extractFirstNameFromTitle(userProfile.psychographicProfile.title);
      if (extractedName) {
        setFirstName(extractedName);
      }
      return;
    }
    
    // Priority 2: Fallback to localStorage (for guest users)
    if (typeof window !== 'undefined') {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      
      if (profileJson) {
        try {
          const parsed = JSON.parse(profileJson);
          setProfile(parsed);
          setHasProfile(true);
          
          const extractedName = extractFirstNameFromTitle(parsed.title);
          if (extractedName) {
            setFirstName(extractedName);
          }
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
    }
  }, [userProfile]);

  // Extract bullet points for profile snapshot
  const getProfileBullets = () => {
    if (!profile) return [];
    
    const bullets = [];
    
    if (profile.core_drives_and_values) {
      const firstSentence = profile.core_drives_and_values.split('.')[0] + '.';
      bullets.push(firstSentence);
    }
    
    if (profile.leadership_style) {
      bullets.push(profile.leadership_style);
    }
    
    if (profile.growth_and_blind_spots) {
      const firstSentence = profile.growth_and_blind_spots.split('.')[0] + '.';
      bullets.push(firstSentence);
    }
    
    return bullets.slice(0, 3);
  };

  const features = [
    {
      title: 'Career Direction Map',
      subtitle: 'Explore roles where your strengths naturally fit.',
      icon: '🧭',
      href: '/career-map',
      available: hasProfile
    },
    {
      title: 'Resume & Profile Analysis',
      subtitle: 'Refine how your professional story shows up on resume and LinkedIn.',
      icon: '✨',
      href: '/resume-intel',
      available: hasResume || hasLinkedIn
    },
    {
      title: 'Job Match & Skill Gaps',
      subtitle: 'See how you stack up against a role and what skills to build next.',
      icon: '🎯',
      href: '/job-match',
      available: hasProfile && (hasResume || hasLinkedIn)
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      <TopNav activeTab="dashboard" firstName={firstName} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Your hub for professional clarity.
            </p>
          </div>
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2.5 text-sm font-medium text-[#4A4A4A] bg-white border border-[#D4D4D4] rounded-lg hover:bg-gray-50 hover:border-[#7A8E50]/40 transition-all flex items-center gap-2 shadow-sm"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Update my info</span>
          </button>
        </div>

        {/* Alert if no resume */}
        {!hasResume && !hasLinkedIn && (
          <div className="mb-10 bg-white border border-[#E5E5E5] rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#7A8E50] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📄</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Upload your resume to unlock all features</h3>
              <p className="text-sm text-[#6F6F6F] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Get AI-powered resume analysis, job matching, and personalized career insights.
              </p>
              <button
                onClick={() => router.push('/preview-onboarding')}
                className="px-4 py-2 bg-[#7A8E50] text-white text-sm font-medium rounded-lg hover:bg-[#55613b] transition-colors shadow-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Upload Resume
              </button>
            </div>
          </div>
        )}

        {/* Profile Snapshot Card */}
        {profile && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] mb-12 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Your Profile Snapshot</h2>
                <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-light" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Based on your profile and past inputs</p>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-[#7A8E50] hover:text-[#55613b] font-medium flex items-center gap-1 transition-colors"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                <span>View details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Core Theme Header - Enhanced */}
            {(profile.core_theme || profile.archetype || profile.summary) && (
              <div className="mx-8 mb-6 bg-[#F4F7EF] rounded-xl p-6 border border-[#E5E5E5]">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7A8E50] to-[#55613b] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xl">🧩</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xs text-[#6F6F6F] uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          Core theme
                        </h3>
                        <p className="text-lg font-bold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {profile.core_theme || profile.archetype || 'The Strategic Transformer'}
                        </p>
                        {/* Enhanced Summary - 1-2 sentences */}
                        {(profile.summary || profile.leadership_style || profile.cognitive_style) && (
                          <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {profile.summary 
                              ? (profile.summary.split('.').slice(0, 2).join('.') + (profile.summary.split('.').length > 2 ? '.' : ''))
                              : (profile.leadership_style || profile.cognitive_style || '')}
                          </p>
                        )}
                      </div>
                      
                      {/* Trait Pills */}
                      <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                        {profile.strength_signatures && profile.strength_signatures.length > 0 && (
                          <>
                            {profile.strength_signatures.slice(0, 3).map((strength, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-[#D4D4D4] rounded-full text-xs font-medium text-[#4A4A4A] whitespace-nowrap shadow-sm"
                                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                              >
                                {strength.trait}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Two-Column Layout - Strengths vs Risks (Expandable Cards) */}
            <div className="px-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Top Strengths */}
                {profile.strength_signatures && Array.isArray(profile.strength_signatures) && profile.strength_signatures.length > 0 && (
                  <div className="bg-gradient-to-br from-[#F5F7F4] to-[#FAFAF6] rounded-xl p-5 border border-[#E5E5E5]">
                    <h3 className="text-xs text-[#6F6F6F] uppercase tracking-wider font-semibold mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Top strengths
                    </h3>
                    <div className="space-y-3">
                      {profile.strength_signatures.slice(0, 3).map((strength, idx) => {
                        const icons = ['🧩', '⚡', '🤝'];
                        const isExpanded = expandedStrengths.has(idx);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              const newSet = new Set(expandedStrengths);
                              if (isExpanded) {
                                newSet.delete(idx);
                              } else {
                                newSet.add(idx);
                              }
                              setExpandedStrengths(newSet);
                            }}
                            className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg flex-shrink-0">{icons[idx] || '✨'}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#232323] text-sm mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                  {strength.trait}
                                </h4>
                                
                                {/* Collapsed View */}
                                {!isExpanded && (
                                  <>
                                    <p className="text-xs text-[#6F6F6F] leading-relaxed mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                      {strength.evidence.length > 80 ? strength.evidence.substring(0, 80) + '...' : strength.evidence}
                                    </p>
                                    <p className="text-xs text-[#7A8E50] font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                      💡 {strength.why_it_matters.length > 60 ? strength.why_it_matters.substring(0, 60) + '...' : strength.why_it_matters}
                                    </p>
                                  </>
                                )}
                                
                                {/* Expanded View */}
                                {isExpanded && (
                                  <div className="space-y-3 animate-fadeIn">
                                    <div className="bg-[#F7F7F2] rounded-lg p-3 border-l-2 border-[#7A8E50]">
                                      <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        Evidence
                                      </p>
                                      <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        {strength.evidence}
                                      </p>
                                    </div>
                                    <div className="bg-[#F4F7EF] rounded-lg p-3 border-l-2 border-[#7A8E50]">
                                      <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        Why it matters
                                      </p>
                                      <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        {strength.why_it_matters}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Expand/Collapse Indicator */}
                                <div className="mt-2 flex items-center gap-1 text-xs text-[#8F8F8F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                  <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                                  <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Right Column: Blind Spots & Risks */}
                {profile.latent_risks_and_blind_spots && Array.isArray(profile.latent_risks_and_blind_spots) && profile.latent_risks_and_blind_spots.length > 0 && (
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FAFAF6] rounded-xl p-5 border border-[#F5E6D3]">
                    <h3 className="text-xs text-[#6F6F6F] uppercase tracking-wider font-semibold mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Blind spots & risks
                    </h3>
                    <div className="space-y-3">
                      {profile.latent_risks_and_blind_spots.slice(0, 3).map((risk, idx) => {
                        const isExpanded = expandedRisks.has(idx);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              const newSet = new Set(expandedRisks);
                              if (isExpanded) {
                                newSet.delete(idx);
                              } else {
                                newSet.add(idx);
                              }
                              setExpandedRisks(newSet);
                            }}
                            className="bg-white rounded-xl p-4 border border-[#F5E6D3] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg flex-shrink-0 text-amber-600">⚠️</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#232323] text-sm mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                  {risk.pattern}
                                </h4>
                                
                                {/* Collapsed View */}
                                {!isExpanded && (
                                  <>
                                    <p className="text-xs text-[#6F6F6F] leading-relaxed mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                      {risk.risk.length > 80 ? risk.risk.substring(0, 80) + '...' : risk.risk}
                                    </p>
                                    {risk.coaching_prompt && (
                                      <p className="text-xs text-[#D97706] italic leading-snug flex items-start gap-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        <span className="flex-shrink-0">💬</span>
                                        <span>{risk.coaching_prompt.length > 60 ? risk.coaching_prompt.substring(0, 60) + '...' : risk.coaching_prompt}</span>
                                      </p>
                                    )}
                                  </>
                                )}
                                
                                {/* Expanded View */}
                                {isExpanded && (
                                  <div className="space-y-3 animate-fadeIn">
                                    <div className="bg-[#FFF9F0] rounded-lg p-3 border-l-2 border-amber-500">
                                      <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        Risk
                                      </p>
                                      <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                        {risk.risk}
                                      </p>
                                    </div>
                                    {risk.coaching_prompt && (
                                      <div className="bg-[#FEF3E7] rounded-lg p-3 border-l-2 border-[#D97706]">
                                        <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-medium mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                          Coaching prompt
                                        </p>
                                        <p className="text-xs text-[#4A4A4A] leading-relaxed italic flex items-start gap-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                          <span className="flex-shrink-0">💬</span>
                                          <span>{risk.coaching_prompt}</span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Expand/Collapse Indicator */}
                                <div className="mt-2 flex items-center gap-1 text-xs text-[#8F8F8F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                  <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                                  <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fallback to old format if new fields don't exist */}
            {(!profile.strength_signatures || !profile.latent_risks_and_blind_spots) && (
              <div className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {getProfileBullets().slice(0, 4).map((bullet, idx) => (
                    <div key={idx} className="bg-[#F5F7F4] rounded-lg p-5 border border-[#E5E5E5]">
                      <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Tiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <FeatureTile key={feature.title} {...feature} />
          ))}
        </div>

        {/* Recent Roles Widget */}
        {hasProfile && (hasResume || hasLinkedIn) && (
          <div className="mb-12">
            <RecentRolesWidget />
          </div>
        )}

        {/* Onboarding Prompt if no profile */}
        {!hasProfile && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7A8E50] to-[#55613b] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Complete Your Profile for Full Access</h3>
                <p className="text-[#6F6F6F] mb-5 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Generate your psychographic profile to unlock all career intelligence features.
                </p>
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="px-6 py-2.5 bg-[#7A8E50] text-white rounded-lg hover:bg-[#55613b] transition-colors font-medium shadow-sm"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Info Confirmation Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-semibold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Update your profile?</h3>
            <p className="text-[#6F6F6F] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              This will let you upload a new resume or LinkedIn profile and regenerate your psychographic profile.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-[#4A4A4A] bg-white border border-[#D4D4D4] rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  router.push('/preview-onboarding?mode=edit');
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#7A8E50] rounded-lg hover:bg-[#55613b] transition-colors shadow-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
