"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from 'next-auth/react';
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { JobMatchAnalysis } from '@/app/types/jobMatch';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { getCareerDirectionRecommendations } from '@/lib/careerDirections';
import AnalysisLoader from '@/app/components/AnalysisLoader';

function TopNav({ activeTab }: { activeTab: string }) {
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = session?.user?.name?.split(' ')[0] || 'User';

  return (
    <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#7A8E50]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Sage</span>
          </Link>

          <div className="flex items-center gap-4">
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

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                <span className="text-sm font-medium text-[#232323]">{displayName}</span>
                <svg className={`w-4 h-4 text-[#6F6F6F] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 animate-fade-in">
                  <button
                    onClick={() => { router.push('/preview-onboarding'); setShowUserDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-[#4A4A4A] hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Update Profile Inputs
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full px-4 py-2 text-left text-sm text-[#4A4A4A] hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RoleFitAnalysisPage() {
  const router = useRouter();
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [useProfileData, setUseProfileData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [careerDirections, setCareerDirections] = useState<CareerDirectionRecommendation[]>([]);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!profileLoading && userProfile?.careerStage && userProfile?.careerPreferences) {
      const fetchDirections = async () => {
        const directions = await getCareerDirectionRecommendations({
          careerStage: userProfile.careerStage!,
          careerPreferences: userProfile.careerPreferences!,
          psychographicProfile: userProfile.psychographicProfile,
          resumeText: userProfile.resumeText,
          linkedInSummary: userProfile.linkedInSummary
        });
        setCareerDirections(directions.slice(0, 3));
      };
      fetchDirections();
    }
  }, [userProfile, profileLoading]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze.');
      return;
    }

    if (!userProfile?.resumeText && useProfileData) {
      setError('No resume found. Please upload your resume first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim() || undefined,
          jobDescription: jobDescription.trim(),
          userProfile: useProfileData ? {
            careerStage: userProfile?.careerStage,
            careerPreferences: userProfile?.careerPreferences,
            careerDirections: careerDirections,
            resumeText: userProfile?.resumeText,
            linkedInSummary: userProfile?.linkedInSummary,
            psychographicProfile: userProfile?.psychographicProfile,
          } : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.details || 'Failed to analyze role fit');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error analyzing role fit:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze role fit');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedBulletIndex(index);
        setTimeout(() => setCopiedBulletIndex(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFitInfo = (score: number) => {
    if (score >= 80) return { label: 'Strong Fit', color: '#7F915F', bgColor: '#EEF2E8' };
    if (score >= 60) return { label: 'Moderate Fit', color: '#D4A574', bgColor: '#FEF3E8' };
    return { label: 'Partial Fit', color: '#E07856', bgColor: '#FEF0EC' };
  };

  const runAnotherAnalysis = () => {
    setAnalysis(null);
    setJobTitle('');
    setJobDescription('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (profileLoading || loading) {
    if (loading) {
      return (
        <AnalysisLoader
          title="Analyzing your fit for this role…"
          messages={[
            "Extracting key requirements and responsibilities.",
            "Comparing the role to your experience and strengths.",
            "Identifying gaps and suggestions to improve your positioning."
          ]}
        />
      );
    }
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F915F] mb-4"></div>
          <p className="text-[#6F6F6F] font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      <TopNav activeTab="rolefit" />

      <div className="max-w-[880px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Role Fit Analysis
          </h1>
          <p className="text-base text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            See how you align with any role and where to focus before applying.
          </p>
        </div>

        {/* Input Form (shown when no analysis) */}
        {!analysis && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Paste a job description to analyze your fit
            </h2>
            <p className="text-sm text-[#6F6F6F] mb-8" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Sage will compare this role against your profile and resume to highlight strengths, gaps, and how to position yourself.
            </p>

            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Job title (optional)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Product Manager"
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F915F] focus:border-transparent"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Job description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setError(null);
                  }}
                  placeholder="Paste the full job description here…"
                  rows={12}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F915F] focus:border-transparent resize-none"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Use Profile Data Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useProfile"
                  checked={useProfileData}
                  onChange={(e) => setUseProfileData(e.target.checked)}
                  className="w-4 h-4 text-[#7F915F] bg-gray-100 border-gray-300 rounded focus:ring-[#7F915F] focus:ring-2"
                />
                <label htmlFor="useProfile" className="text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Use my latest profile and resume data
                </label>
              </div>

              {/* CTA Button */}
              <div>
                <button
                  onClick={handleAnalyze}
                  disabled={!jobDescription.trim()}
                  className="w-full py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6A7F4F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Analyze My Fit
                </button>
                <p className="mt-3 text-xs text-center text-[#8F8F8F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Your data is not stored. The job description is only used for this analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Summary & Fit Score */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Overall fit for this role
                  </h2>
                  <p className="text-base text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {`Based on your profile and resume, you're a ${getFitInfo(analysis.overallMatchScore).label.toLowerCase()} for this position. Your experience aligns with several key requirements, though there are areas where additional development or positioning would strengthen your application.`}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {(() => {
                    const fitInfo = getFitInfo(analysis.overallMatchScore);
                    return (
                      <div 
                        className="px-6 py-3 rounded-full font-semibold text-center min-w-[140px]"
                        style={{ 
                          backgroundColor: fitInfo.bgColor,
                          color: fitInfo.color,
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {fitInfo.label}
                        <div className="text-2xl font-bold mt-1">{analysis.overallMatchScore}%</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Match Breakdown */}
            {analysis.dimensionScores && analysis.dimensionScores.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-[#232323] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Match Breakdown
                </h2>
                <div className="space-y-6">
                  {analysis.dimensionScores.map((dim, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-medium text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {dim.dimension === 'skills' ? 'Skills' : 
                           dim.dimension === 'experience' ? 'Experience' : 
                           dim.dimension === 'responsibilities' ? 'Responsibilities' : 
                           'Culture & Environment'}
                        </span>
                        <span className="text-base font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {dim.score}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E5E5] rounded-full h-2 mb-3">
                        <div
                          className="bg-[#232323] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${dim.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-[#6F6F6F] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {dim.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths vs Role */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Where you're a strong match
                </h2>
                <p className="text-sm text-[#6F6F6F] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Based on your profile and resume, these parts of the role are natural fits.
                </p>
                <div className="space-y-4">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#7F915F] mt-2"></div>
                      <p className="text-base text-[#333] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {strength}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps & Development Areas */}
            {analysis.gaps && analysis.gaps.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-[#E0A878]">
                <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Gaps and development areas
                </h2>
                <p className="text-sm text-[#6F6F6F] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  These are the parts of the role where your experience is lighter or less explicit.
                </p>
                <div className="space-y-4 mb-6">
                  {analysis.gaps.map((gap, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#E0A878] mt-2"></div>
                      <p className="text-base text-[#333] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {gap}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#FEF9F5] rounded-lg p-5 border border-[#F5E8DC]">
                  <h3 className="text-sm font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    How to handle this
                  </h3>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    You can still apply if you're comfortable addressing these gaps. Consider:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Highlighting adjacent experience that partially covers these areas.</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Addressing gaps proactively in your cover letter or interviews.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Resume & Positioning Suggestions */}
            {analysis.tailoringSuggestions?.keyBullets && analysis.tailoringSuggestions.keyBullets.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-[#232323] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  How to position yourself for this role
                </h2>

                {/* Tailored resume summary */}
                {analysis.tailoringSuggestions.summary && (
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Suggested positioning summary
                    </h3>
                    <div className="bg-[#F5F7F1] rounded-lg p-5 border border-[#E5E5E5]">
                      <p className="text-sm text-[#232323] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {analysis.tailoringSuggestions.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggested resume bullet tweaks */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Suggested resume bullet tweaks
                  </h3>
                  <div className="space-y-6">
                    {analysis.tailoringSuggestions.keyBullets.slice(0, 4).map((bullet: { original?: string; improved: string; note: string }, index: number) => (
                      <div key={index} className="space-y-2">
                        {bullet.original && (
                          <div className="text-sm text-[#6F6F6F] italic" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Original: {bullet.original}
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-4 bg-[#F5F7F1] rounded-lg p-4 border-l-3 border-[#7F915F]">
                          <div className="text-sm text-[#232323] font-medium flex-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Improved: {bullet.improved}
                          </div>
                          <button
                            onClick={() => copyToClipboard(bullet.improved, index)}
                            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedBulletIndex === index ? (
                              <svg className="w-5 h-5 text-[#7F915F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-[#6F6F6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {bullet.note && (
                          <div className="text-xs text-[#6F6F6F] italic" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            {bullet.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended skills to develop */}
                {analysis.recommendedSkills && analysis.recommendedSkills.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      Key skills to develop or emphasize
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommendedSkills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-[#EEF2E8] text-[#232323] rounded-full text-sm font-medium border border-[#D4DCC5]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interview Talking Points - Using riskFlags as talking points for now */}
            {analysis.riskFlags && analysis.riskFlags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Areas to address proactively
                </h2>
                <p className="text-sm text-[#6F6F6F] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Be prepared to discuss these points in your cover letter or interviews.
                </p>
                <div className="space-y-4">
                  {analysis.riskFlags.map((tip: string, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E0A878] text-white flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-base text-[#333] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={runAnotherAnalysis}
                className="flex-1 px-6 py-3 bg-[#7F915F] text-white font-medium rounded-lg hover:bg-[#6A7F4F] transition-colors shadow-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Run another role
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 bg-white text-[#4A4A4A] border border-[#E5E5E5] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
