"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  title?: string;
  archetype?: string;
  core_drives_and_values?: string;
  leadership_style?: string;
  growth_and_blind_spots?: string;
  summary?: string;
}

function TopNav({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/preview-onboarding' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/dashboard/resume-intelligence' },
    { id: 'jobmatch', label: 'Job Match', href: '/dashboard/job-match' },
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
        group relative p-8 rounded-3xl border-2 text-left transition-all duration-300
        ${available 
          ? 'bg-white hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-gray-200 hover:border-[#9DC183]' 
          : 'bg-gray-50 cursor-not-allowed border-gray-100 opacity-60'
        }
      `}
    >
      {/* Icon */}
      <div className="text-5xl mb-4">{icon}</div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {subtitle}
      </p>
      
      {/* Arrow indicator */}
      {available && (
        <div className="flex items-center text-[#8a9a5b] font-medium group-hover:translate-x-2 transition-transform duration-300">
          <span>Explore</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      {!available && (
        <div className="text-gray-400 font-medium">
          Complete onboarding first
        </div>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);

  useEffect(() => {
    // Load profile and extract data
    if (typeof window !== 'undefined') {
      const profileJson = localStorage.getItem('onboarding_psych_profile');
      const resume = localStorage.getItem('onboarding_resume_text');
      const linkedin = localStorage.getItem('onboarding_linkedin_text');
      
      setHasResume(!!resume);
      setHasLinkedIn(!!linkedin);
      
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
      href: '/dashboard/resume-intelligence',
      available: hasResume || hasLinkedIn
    },
    {
      title: 'Job Match & Skill Gaps',
      subtitle: 'Compare your profile to a job description.',
      icon: '🎯',
      href: '/dashboard/job-match',
      available: hasProfile && (hasResume || hasLinkedIn)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-[#ffffff] to-[#e8f0e3]">
      <TopNav activeTab="dashboard" />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          {profile?.archetype && (
            <p className="text-xl text-gray-600">
              {profile.archetype}
            </p>
          )}
        </div>

        {/* Profile Snapshot Card */}
        {profile && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-12 shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Your Profile Snapshot
            </h2>
            <ul className="space-y-4">
              {getProfileBullets().map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#9DC183] mt-1 flex-shrink-0">●</span>
                  <span className="text-gray-700 leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <button
                onClick={() => router.push('/preview-onboarding')}
                className="text-[#8a9a5b] font-semibold hover:text-[#55613b] transition-colors flex items-center gap-2"
              >
                <span>View full profile</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Feature Tiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <FeatureTile {...feature} />
            </div>
          ))}
        </div>

        {/* Onboarding Prompt if no profile */}
        {!hasProfile && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile for Full Access</h3>
                <p className="text-gray-700 mb-4">
                  Generate your psychographic profile to unlock all career intelligence features.
                </p>
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="px-6 py-2 bg-[#8a9a5b] text-white rounded-lg hover:bg-[#55613b] transition-colors duration-200 font-medium"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
