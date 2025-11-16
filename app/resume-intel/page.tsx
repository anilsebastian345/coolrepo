"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeIntel } from "@/app/types/features";
import { getResumeIntel } from "@/lib/careerCoach";

// TopNav Component
function TopNav({ activeTab }: { activeTab: string }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/preview-onboarding' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/resume-intel' },
    { id: 'jobmatch', label: 'Job Match', href: '/job-match' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#55613b]">Sage</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#f8faf6] text-[#55613b]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Copy Button Component
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
        copied
          ? 'bg-green-100 text-green-700 border-2 border-green-200'
          : 'bg-[#f8faf6] text-[#55613b] border-2 border-[#e8f0e3] hover:bg-[#e8f0e3]'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// Main Page Component
export default function ResumeIntelPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ResumeIntel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage
    const profileData = localStorage.getItem('onboarding_psych_profile');
    const resumeData = localStorage.getItem('onboarding_resume_text');
    const linkedInData = localStorage.getItem('onboarding_linkedin_text');

    if (profileData || resumeData || linkedInData) {
      try {
        const parsed = profileData ? JSON.parse(profileData) : {};
        setUserProfile(parsed);
        
        // Fetch analysis from service
        setLoading(true);
        getResumeIntel(parsed)
          .then(intel => {
            setAnalysis(intel);
            setLoading(false);
          })
          .catch(err => {
            console.error('Failed to fetch analysis:', err);
            setLoading(false);
          });
      } catch (err) {
        console.error('Failed to parse profile:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-white to-[#e8f0e3]">
      <TopNav activeTab="resume" />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Resume & LinkedIn Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what's working, what's missing, and how to improve your story.
          </p>
        </div>

        {/* No Data State */}
        {!userProfile && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200 max-w-2xl mx-auto">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Your Resume First</h3>
            <p className="text-gray-600 mb-6">
              We need your resume or LinkedIn profile to provide personalized analysis.
            </p>
            <button
              onClick={() => router.push('/preview-onboarding')}
              className="px-8 py-3 bg-[#8a9a5b] text-white rounded-xl font-medium hover:bg-[#55613b] transition-colors"
            >
              Start Onboarding
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && userProfile && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#8a9a5b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Analyzing your resume and LinkedIn profile...</p>
          </div>
        )}

        {/* Analysis Content */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Strengths & Gaps Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">💪</div>
                  <h2 className="text-2xl font-bold text-gray-900">Strengths</h2>
                </div>
                <ul className="space-y-4">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg font-bold">✓</span>
                      <span className="text-gray-700 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps & Risks Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-900">Gaps & Risks</h2>
                </div>
                <ul className="space-y-4">
                  {analysis.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-500 mr-3 mt-1 text-lg font-bold">!</span>
                      <span className="text-gray-700 leading-relaxed">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Resume Bullets */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">📝</div>
                <h2 className="text-2xl font-bold text-gray-900">Suggested Resume Bullets</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Here's how to strengthen your resume bullets with better framing, metrics, and impact:
              </p>
              <div className="space-y-6">
                {analysis.improvedBullets.map((bullet, idx) => (
                  <div key={idx} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                    {/* Original */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Original</p>
                      <p className="text-gray-700 italic">{bullet.original}</p>
                    </div>
                    {/* Improved */}
                    <div className="bg-gradient-to-br from-[#f8faf6] to-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#55613b] mb-2 uppercase tracking-wide">Improved</p>
                          <p className="text-gray-900 font-medium leading-relaxed">{bullet.improved}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <CopyButton text={bullet.improved} label="Copy" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved LinkedIn About Summary */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">💼</div>
                <h2 className="text-2xl font-bold text-gray-900">Improved LinkedIn About Summary</h2>
              </div>
              <p className="text-gray-600 mb-6">
                A compelling About section that highlights your unique value proposition and makes people want to connect:
              </p>
              <div className="bg-gradient-to-br from-[#f8faf6] to-white border-2 border-[#e8f0e3] rounded-xl p-6 relative">
                <div className="absolute top-4 right-4">
                  <CopyButton text={analysis.improvedLinkedInSummary} label="Copy Summary" />
                </div>
                <div className="pr-32">
                  <textarea
                    readOnly
                    value={analysis.improvedLinkedInSummary}
                    className="w-full h-96 bg-transparent border-none resize-none focus:outline-none text-gray-800 leading-relaxed font-['Georgia',serif] text-base"
                  />
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-800 flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Pro tip:</strong> Customize this template by replacing [your domain/industry] with your specific area (e.g., "fintech", "B2B SaaS", "healthcare AI"). Add personal touches that reflect your unique voice.
                  </span>
                </p>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gradient-to-br from-[#f8faf6] to-white rounded-2xl border-2 border-[#8a9a5b] p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Next Steps
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 font-bold">1.</span>
                  <span className="text-gray-700">Copy the improved bullets and update your resume this week</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 font-bold">2.</span>
                  <span className="text-gray-700">Customize and publish the LinkedIn About summary within 48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 font-bold">3.</span>
                  <span className="text-gray-700">For bullets without metrics, spend 30 min researching the actual impact</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 font-bold">4.</span>
                  <span className="text-gray-700">Review the gaps section and add missing context to weak bullets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 font-bold">5.</span>
                  <span className="text-gray-700">Run your updated resume through this tool again to validate improvements</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
