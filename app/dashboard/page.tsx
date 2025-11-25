"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from 'next-auth/react';
import { useUserProfile } from "../hooks/useUserProfile";
import { RoleFitAnalysis } from '@/lib/roleFitHistory';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';

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

interface RoleFitInsights {
  recurringStrengths: string[];
  recurringGaps: string[];
  bestFitPatterns: string[];
  weakerFitPatterns: string[];
  recommendations: string[];
  message?: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { userProfile, isLoading } = useUserProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Cross-feature data states
  const [recentRoles, setRecentRoles] = useState<RoleFitAnalysis[]>([]);
  const [roleFitInsights, setRoleFitInsights] = useState<RoleFitInsights | null>(null);
  const [careerDirections, setCareerDirections] = useState<CareerDirectionRecommendation[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingDirections, setLoadingDirections] = useState(true);

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
    // Load profile from userProfile (server-side)
    if (userProfile?.psychographicProfile) {
      console.log('Loading dashboard from server profile');
      setProfile(userProfile.psychographicProfile);
      setHasProfile(true);
      return;
    }
    
    // For guest users only: fallback to localStorage
    if (typeof window !== 'undefined' && !session) {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      
      if (profileJson) {
        try {
          const parsed = JSON.parse(profileJson);
          setProfile(parsed);
          setHasProfile(true);
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
    }
  }, [userProfile, session]);

  // Fetch cross-feature data
  useEffect(() => {
    if (!hasProfile) return;

    // Fetch recent roles
    const fetchRecentRoles = async () => {
      try {
        const response = await fetch('/api/role-fit-history');
        if (response.ok) {
          const data = await response.json();
          setRecentRoles((data.analyses || []).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching recent roles:', err);
      } finally {
        setLoadingRoles(false);
      }
    };

    // Fetch role fit insights
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/role-fit-insights');
        if (response.ok) {
          const data = await response.json();
          setRoleFitInsights(data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoadingInsights(false);
      }
    };

    // Fetch career directions
    const fetchCareerDirections = async () => {
      if (!userProfile) {
        setLoadingDirections(false);
        return;
      }

      try {
        const response = await fetch('/api/career-directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: {
              careerStage: userProfile.careerStage,
              careerPreferences: userProfile.careerPreferences,
              psychographicProfile: userProfile.psychographicProfile,
              resumeText: userProfile.resumeText,
              linkedInSummary: userProfile.linkedInSummary,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCareerDirections(data.directions || []);
        }
      } catch (err) {
        console.error('Error fetching career directions:', err);
      } finally {
        setLoadingDirections(false);
      }
    };

    fetchRecentRoles();
    fetchInsights();
    fetchCareerDirections();
  }, [hasProfile, userProfile]);

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

        {/* BAND 1: TODAY AT A GLANCE */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Today at a glance
            </h2>

            {/* Condensed Profile Snapshot */}
            <div className="grid md:grid-cols-3 gap-6 pb-6 mb-6 border-b border-gray-100">
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Your profile snapshot
                </p>
                <h3 className="text-xl font-bold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.core_theme || profile.archetype || 'Your Career Profile'}
                </h3>
                <p className="text-sm text-[#4A4A4A] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {profile.summary 
                    ? (profile.summary.split('.').slice(0, 1).join('.') + '.')
                    : (profile.leadership_style || profile.cognitive_style || '')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.strength_signatures && profile.strength_signatures.length > 0 && (
                    <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-800" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      ✓ Top strength: {profile.strength_signatures[0].trait}
                    </div>
                  )}
                  {profile.latent_risks_and_blind_spots && profile.latent_risks_and_blind_spots.length > 0 && (
                    <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      ⚠ Watch out for: {profile.latent_risks_and_blind_spots[0].pattern}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start justify-end">
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
            </div>

            {/* Three Summary Tiles */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* F1: Career Direction Map */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧭</span>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Best-fitting role themes
                    </h4>
                  </div>
                  {loadingDirections ? (
                    <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Loading...</p>
                  ) : careerDirections.length > 0 ? (
                    <p className="text-sm text-gray-800 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      You tend to fit best with: {careerDirections.slice(0, 2).map(d => d.name).join(' · ')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Run your first direction analysis to see where you naturally fit.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/career-map')}
                  className="text-xs text-[#7A8E50] hover:text-[#55613b] font-medium flex items-center gap-1 self-end transition-colors"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  <span>Explore</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* F2: Resume & Profile Analysis */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Resume & profile signal
                    </h4>
                  </div>
                  {hasResume || hasLinkedIn ? (
                    <p className="text-sm text-gray-800 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Overall: Solid foundation; refine storytelling for stronger impact.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Analyze your resume to see how your story shows up on paper.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/resume-intel')}
                  className="text-xs text-[#7A8E50] hover:text-[#55613b] font-medium flex items-center gap-1 self-end transition-colors"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  <span>Explore</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* F3: Job Match & Skill Gaps */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Job match & search signal
                    </h4>
                  </div>
                  {loadingRoles ? (
                    <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Loading...</p>
                  ) : recentRoles.length > 0 ? (
                    <p className="text-sm text-gray-800 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {recentRoles.length} roles analyzed · Avg fit {Math.round(recentRoles.reduce((sum, r) => sum + r.fitScore, 0) / recentRoles.length)}% · Mostly moderate matches.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Compare your profile to a role to see how well you match.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/job-match')}
                  className="text-xs text-[#7A8E50] hover:text-[#55613b] font-medium flex items-center gap-1 self-end transition-colors"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  <span>Explore</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BAND 2: MOST IMPORTANT NEXT STEPS */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Your most important next steps
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-800" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {/* Action 1: Target roles from F1 */}
              {careerDirections.length > 0 ? (
                <li className="leading-relaxed">
                  <strong>Focus your search on:</strong> {careerDirections.slice(0, 3).map(d => d.name).join(' / ')} roles.
                </li>
              ) : (
                <li className="leading-relaxed text-gray-600">
                  Run your Career Direction Map to identify the best role themes for your strengths.
                </li>
              )}

              {/* Action 2: Upgrade profile/resume from F2 */}
              {hasResume || hasLinkedIn ? (
                <li className="leading-relaxed">
                  <strong>Upgrade your profile/resume:</strong> Add 2 concrete wins with metrics to your resume and LinkedIn headline.
                </li>
              ) : (
                <li className="leading-relaxed text-gray-600">
                  Analyze your resume to get tailored suggestions on how to strengthen your story.
                </li>
              )}

              {/* Action 3: Build specific skill from F3 */}
              {roleFitInsights && roleFitInsights.recurringGaps && roleFitInsights.recurringGaps.length > 0 ? (
                <li className="leading-relaxed">
                  <strong>Build one specific skill/domain:</strong> {roleFitInsights.recurringGaps[0]}
                </li>
              ) : recentRoles.length >= 3 ? (
                <li className="leading-relaxed">
                  <strong>Build one specific skill/domain:</strong> Deepen hands-on experience in one area with a real project or certification.
                </li>
              ) : (
                <li className="leading-relaxed text-gray-600">
                  Analyze a few roles to discover patterns in skill gaps you should address.
                </li>
              )}
            </ol>
          </div>
        )}

        {/* BAND 3: IN PROGRESS */}
        {profile && (
          <div className="space-y-6">
            {/* Recent Roles (Condensed) */}
            {recentRoles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Recent roles you explored
                </h3>
                {recentRoles.length >= 3 && (
                  <p className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    You're currently testing: {Array.from(new Set(recentRoles.map(r => r.company || 'Unknown'))).slice(0, 3).join(' · ')} roles.
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  {recentRoles.slice(0, 3).map((role) => (
                    <div
                      key={role.id}
                      onClick={() => router.push('/job-match?tab=insights')}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                          {role.company?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#232323] truncate" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {role.company || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-600 truncate" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {role.jobTitle || 'Untitled role'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ml-2 ${
                        role.fitLabel === 'Strong Fit' ? 'text-green-700' :
                        role.fitLabel === 'Moderate Fit' ? 'text-blue-700' :
                        role.fitLabel === 'Partial Fit' ? 'text-amber-700' :
                        'text-gray-700'
                      }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {role.fitLabel.replace(' Fit', '')} ({role.fitScore})
                      </span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => router.push('/job-match?tab=insights')}
                  className="w-full px-4 py-2 text-sm font-medium text-[#7A8E50] hover:text-[#55613b] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  <span>View all roles & patterns</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Quick Access Tool Cards */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Quick access
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/career-map')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-[#7A8E50]/30 transition-all"
                >
                  <div className="text-2xl mb-2">🧭</div>
                  <h4 className="text-sm font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Career Direction Map
                  </h4>
                  <p className="text-xs text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Explore roles where your strengths fit
                  </p>
                  <span className="text-xs text-[#7A8E50] font-medium flex items-center gap-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Open tool →
                  </span>
                </button>

                <button
                  onClick={() => router.push('/resume-intel')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-[#7A8E50]/30 transition-all"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <h4 className="text-sm font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Resume & Profile Analysis
                  </h4>
                  <p className="text-xs text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Refine your professional story
                  </p>
                  <span className="text-xs text-[#7A8E50] font-medium flex items-center gap-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Open tool →
                  </span>
                </button>

                <button
                  onClick={() => router.push('/job-match')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-[#7A8E50]/30 transition-all"
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="text-sm font-semibold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Job Match & Skill Gaps
                  </h4>
                  <p className="text-xs text-gray-600 mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    See how you stack up against roles
                  </p>
                  <span className="text-xs text-[#7A8E50] font-medium flex items-center gap-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Open tool →
                  </span>
                </button>
              </div>
            </div>
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
