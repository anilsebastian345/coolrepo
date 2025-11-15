"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SageLogo() {
  return (
    <Link href="/" className="flex flex-col items-center mb-8 hover:scale-105 transition-transform duration-200">
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-xl bg-white/30 border border-white/40 backdrop-blur-md animate-profile-pop">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-md">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '14%', right: '14%' }}>
          <div className="w-2 h-2 rounded-full bg-[#ffd700] shadow" />
        </div>
      </div>
      <h1 className="mt-4 text-lg text-[#7a7a7a] font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </Link>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  available: boolean;
}

function FeatureCard({ title, description, icon, href, color, available }: FeatureCardProps) {
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
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300
        ${available ? 'group-hover:scale-110' : ''}
      `} style={{ 
        background: available ? color : '#e5e7eb'
      }}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed mb-4">
        {description}
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
          Coming Soon
        </div>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check for onboarding completion
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('onboarding_psych_profile');
      const resume = localStorage.getItem('onboarding_resume_text');
      const linkedin = localStorage.getItem('onboarding_linkedin_text');
      
      setHasProfile(!!profile);
      setHasResume(!!resume);
      setHasLinkedIn(!!linkedin);
      
      // Try to extract name from profile
      if (profile) {
        try {
          const profileData = JSON.parse(profile);
          if (profileData.title) {
            const nameMatch = profileData.title.match(/^🧠\s*(.+?)\s*–/);
            if (nameMatch) {
              setUserName(nameMatch[1]);
            }
          }
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
    }
  }, []);

  const features = [
    {
      title: 'Career Direction Map',
      description: 'Discover 3-5 personalized career paths based on your psychographic profile, skills, and experience. Get actionable next steps for each path.',
      icon: '🧭',
      href: '/dashboard/career-direction',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      available: hasProfile
    },
    {
      title: 'Resume & LinkedIn Intelligence',
      description: 'Get AI-powered analysis of your resume and LinkedIn profile. Receive improved bullet points and a compelling About section.',
      icon: '✨',
      href: '/dashboard/resume-intelligence',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      available: hasResume || hasLinkedIn
    },
    {
      title: 'Job Match & Skill Gap',
      description: 'Paste any job description to see your match percentage, key strengths, skill gaps, and tailored recommendations.',
      icon: '🎯',
      href: '/dashboard/job-match',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      available: hasProfile && (hasResume || hasLinkedIn)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-[#ffffff] to-[#e8f0e3]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SageLogo />
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {userName ? `Welcome back, ${userName}` : 'Your Career Intelligence Hub'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leverage AI-powered insights to navigate your career with clarity and confidence
          </p>
        </div>

        {/* Onboarding Status */}
        {(!hasProfile || !hasResume) && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile for Full Access</h3>
                <p className="text-gray-700 mb-4">
                  {!hasProfile && "Generate your psychographic profile to unlock career recommendations. "}
                  {!hasResume && !hasLinkedIn && "Upload your resume or LinkedIn to enable all features."}
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

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/preview-onboarding')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#9DC183] hover:bg-gray-50 transition-all duration-200"
            >
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <div className="font-semibold text-gray-900">View Profile</div>
                <div className="text-sm text-gray-600">See your psychographic analysis</div>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/preview-onboarding')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#9DC183] hover:bg-gray-50 transition-all duration-200"
            >
              <span className="text-2xl">📄</span>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Update Data</div>
                <div className="text-sm text-gray-600">Refresh resume or LinkedIn</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
