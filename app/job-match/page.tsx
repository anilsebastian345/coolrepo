"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { JobMatchAnalysis } from '@/app/types/jobMatch';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { getCareerDirectionRecommendations } from '@/lib/careerDirections';

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
        </div>
      </div>
    </nav>
  );
}

export default function JobMatchPage() {
  const router = useRouter();
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [careerDirections, setCareerDirections] = useState<CareerDirectionRecommendation[]>([]);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!profileLoading && userProfile?.careerStage && userProfile?.careerPreferences) {
      // Fetch career directions
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
      setError('Please enter a job description');
      return;
    }

    if (!userProfile?.resumeText) {
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
          userProfile: {
            careerStage: userProfile.careerStage,
            careerPreferences: userProfile.careerPreferences,
            careerDirections: careerDirections,
            resumeText: userProfile.resumeText,
            linkedInSummary: userProfile.linkedInSummary,
            psychographicProfile: userProfile.psychographicProfile,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.details || 'Failed to analyze job match';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received analysis:', data);
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error analyzing job match:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze job match');
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
      } else {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return { text: 'Strong match', color: 'text-green-600' };
    if (score >= 60) return { text: 'Moderate match', color: 'text-yellow-600' };
    return { text: 'Developing match', color: 'text-orange-600' };
  };

  const getDimensionLabel = (dimension: string) => {
    const labels: { [key: string]: string } = {
      skills: 'Skills',
      experience: 'Experience',
      responsibilities: 'Responsibilities',
      culture_environment: 'Culture & Environment'
    };
    return labels[dimension] || dimension;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav activeTab="jobmatch" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav activeTab="jobmatch" />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Job Match & Fit Analysis
          </h1>
          <p className="text-lg text-gray-600">
            See how you match with any job opportunity
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title (optional)
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Product Manager"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || loading}
            className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Fit'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Overall Match Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{analysis.jobTitle}</h2>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold text-slate-900">{analysis.overallMatchScore}</span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <p className={`text-lg font-medium ${getMatchLabel(analysis.overallMatchScore).color}`}>
                {getMatchLabel(analysis.overallMatchScore).text}
              </p>
            </div>

            {/* Dimension Scores */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Match Breakdown</h3>
              {analysis.dimensionScores.map((dim, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{getDimensionLabel(dim.dimension)}</span>
                    <span className="text-sm font-semibold text-gray-700">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-slate-900 h-2 rounded-full transition-all"
                      style={{ width: `${dim.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600">{dim.comment}</p>
                </div>
              ))}
            </div>

            {/* Strengths & Gaps */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Where You're Strong
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-orange-500 mr-2">⚠</span>
                  Gaps for This Job
                </h3>
                <ul className="space-y-2">
                  {analysis.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Skills */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Skills to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tailoring Suggestions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Tailoring Suggestions</h3>
              
              {/* Summary */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Tailored Resume Summary for This Job</h4>
                  <button
                    onClick={() => copyToClipboard(analysis.tailoringSuggestions.summary)}
                    className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    {copiedSummary ? (
                      <>
                        <span>✓</span>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">{analysis.tailoringSuggestions.summary}</p>
                </div>
              </div>

              {/* Bullets */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Example Bullets You Can Use</h4>
                <div className="space-y-4">
                  {analysis.tailoringSuggestions.keyBullets.map((bullet, idx) => (
                    <div key={idx} className="border-l-4 border-slate-300 pl-4">
                      {bullet.original && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Original:</p>
                          <p className="text-sm text-gray-600 italic">{bullet.original}</p>
                        </div>
                      )}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-green-700 mb-1">Improved:</p>
                            <p className="text-sm text-gray-900">{bullet.improved}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bullet.improved, idx)}
                            className="flex-shrink-0 p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedBulletIndex === idx ? (
                              <span className="text-sm">✓</span>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">{bullet.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Flags */}
            {analysis.riskFlags.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-yellow-600 mr-2">⚡</span>
                  Potential Concerns a Recruiter Might Have
                </h3>
                <ul className="space-y-2">
                  {analysis.riskFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-1">•</span>
                      <span className="text-sm text-gray-700">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setJobTitle('');
                  setJobDescription('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Analyze Another Job
              </button>
              <button
                onClick={() => router.push('/career-map')}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                View Career Directions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
