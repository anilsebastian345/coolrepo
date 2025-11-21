"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from "../hooks/useUserProfile";

interface ProfileData {
  title?: string;
  archetype?: string;
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
}

function TopNav({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/preview-onboarding' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/resume-intel' },
    { id: 'jobmatch', label: 'Job Match', href: '/job-match' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#8a9a5b]">Sage</span>
          </Link>
          
          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#8a9a5b] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          ? 'bg-white hover:shadow-lg hover:border-indigo-200 cursor-pointer border-gray-200' 
          : 'bg-gray-50 cursor-not-allowed border-gray-200 opacity-60'
        }
      `}
    >
      {/* Icon */}
      <div className={`text-4xl mb-4 transition-transform duration-200 ${available ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {subtitle}
      </p>
      
      {/* Arrow indicator */}
      {available && (
        <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
          <span>Explore</span>
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      {!available && (
        <div className="text-sm text-gray-400 font-medium">
          Complete onboarding first
        </div>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { userProfile, isLoading } = useUserProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    }
  }, [userProfile]);

  useEffect(() => {
    // Load profile and extract data
    if (typeof window !== 'undefined') {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      
      if (profileJson) {
        try {
          const parsed = JSON.parse(profileJson);
          setProfile(parsed);
          setHasProfile(true);
          
          // Extract first name from title (format: "🧠 John Doe – Executive Psychographic Profile")
          if (parsed.title) {
            const nameMatch = parsed.title.match(/^🧠\s*(.+?)\s*–/);
            if (nameMatch) {
              const fullName = nameMatch[1].trim();
              const firstNameExtract = fullName.split(' ')[0];
              setFirstName(firstNameExtract);
            }
          }
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
    }
  }, []);

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
      subtitle: 'See roles that fit your strengths.',
      icon: '🧭',
      href: '/career-map',
      available: hasProfile
    },
    {
      title: 'Resume & Profile Analysis',
      subtitle: 'Improve your resume and LinkedIn story.',
      icon: '✨',
      href: '/resume-intel',
      available: hasResume || hasLinkedIn
    },
    {
      title: 'Job Match & Skill Gaps',
      subtitle: 'Compare your profile to a job description.',
      icon: '🎯',
      href: '/job-match',
      available: hasProfile && (hasResume || hasLinkedIn)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav activeTab="dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-gray-600">
              Your AI-powered career intelligence hub
            </p>
          </div>
          {hasProfile && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Update my info</span>
            </button>
          )}
        </div>

        {/* Profile Snapshot Card */}
        {profile && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl">🧠</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your Profile Snapshot</h2>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <span>View details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {getProfileBullets().slice(0, 4).map((bullet, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Tiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureTile key={feature.title} {...feature} />
          ))}
        </div>

        {/* Onboarding Prompt if no profile */}
        {!hasProfile && (
          <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile for Full Access</h3>
                <p className="text-gray-600 mb-4">
                  Generate your psychographic profile to unlock all career intelligence features.
                </p>
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Update your profile?</h3>
            <p className="text-gray-600 mb-6">
              This will let you upload a new resume or LinkedIn profile and regenerate your psychographic profile.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  router.push('/preview-onboarding?mode=edit');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Details Modal */}
      {showProfileModal && profile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.title || 'Your Psychographic Profile'}
                </h2>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {profile.archetype && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Archetype</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.archetype}</p>
                </div>
              )}
              {profile.core_drives_and_values && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Core Drives & Values</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.core_drives_and_values}</p>
                </div>
              )}
              {profile.cognitive_style && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Cognitive Style</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.cognitive_style}</p>
                </div>
              )}
              {profile.leadership_style && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Leadership Style</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.leadership_style}</p>
                </div>
              )}
              {profile.communication_style && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Communication Style</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.communication_style}</p>
                </div>
              )}
              {profile.risk_and_ambition && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Risk & Ambition</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.risk_and_ambition}</p>
                </div>
              )}
              {profile.growth_and_blind_spots && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Growth & Blind Spots</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.growth_and_blind_spots}</p>
                </div>
              )}
              {profile.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</h3>
                  <p className="text-gray-900 leading-relaxed">{profile.summary}</p>
                </div>
              )}
              {profile.strength_signatures && Array.isArray(profile.strength_signatures) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Strength Signatures</h3>
                  <div className="space-y-4">
                    {profile.strength_signatures.map((strength: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{strength.trait}</h4>
                        <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Evidence:</span> {strength.evidence}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Why it matters:</span> {strength.why_it_matters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profile.latent_risks_and_blind_spots && Array.isArray(profile.latent_risks_and_blind_spots) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Latent Risks & Blind Spots</h3>
                  <div className="space-y-4">
                    {profile.latent_risks_and_blind_spots.map((risk: any, idx: number) => (
                      <div key={idx} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{risk.pattern}</h4>
                        <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Risk:</span> {risk.risk}</p>
                        <p className="text-sm text-amber-800"><span className="font-medium">Coaching prompt:</span> {risk.coaching_prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profile.personalized_coaching_focus && Array.isArray(profile.personalized_coaching_focus) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalized Coaching Focus</h3>
                  <div className="space-y-3">
                    {profile.personalized_coaching_focus.map((focus: any, idx: number) => (
                      <div key={idx} className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-1">{focus.area}</h4>
                        <p className="text-sm text-gray-700">{focus.goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
