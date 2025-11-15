"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JobMatchResult } from "@/app/types/features";

function TopNav({ activeTab }: { activeTab: string }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/preview-onboarding' },
    { id: 'career', label: 'Career Map', href: '/dashboard/career-direction' },
    { id: 'resume', label: 'Resume Intel', href: '/dashboard/resume-intelligence' },
    { id: 'jobmatch', label: 'Job Match', href: '/dashboard/job-match' },
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

export default function JobMatchPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const profile = localStorage.getItem('onboarding_psych_profile');
      const resume = localStorage.getItem('onboarding_resume_text');
      const linkedin = localStorage.getItem('onboarding_linkedin_text');
      
      if (!profile && !resume && !linkedin) {
        setError("Please complete your profile first.");
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp-user-id',
          jobDescription,
          profile,
          resume,
          linkedin
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze job match');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
    if (percentage >= 60) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  };

  const getImportanceColor = (importance: string) => {
    if (importance === 'critical') return { bg: 'bg-red-100', text: 'text-red-700' };
    if (importance === 'important') return { bg: 'bg-orange-100', text: 'text-orange-700' };
    return { bg: 'bg-blue-100', text: 'text-blue-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-white to-[#e8f0e3]">
      <TopNav activeTab="jobmatch" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Job Match & Skill Gap Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Paste any job description to see how you match up
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Paste Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here...&#10;&#10;Include:&#10;- Job title and responsibilities&#10;- Required qualifications&#10;- Preferred skills&#10;- Company information"
            className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#9DC183] text-gray-800 font-mono text-sm"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {jobDescription.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              className="px-8 py-3 bg-[#8a9a5b] text-white rounded-xl hover:bg-[#55613b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#8a9a5b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Analyzing job match and identifying gaps...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Match Score */}
            <div className={`rounded-2xl border-2 p-8 ${getMatchColor(data.matchPercentage).bg} ${getMatchColor(data.matchPercentage).border}`}>
              <div className="text-center mb-6">
                <div className={`text-7xl font-bold mb-2 ${getMatchColor(data.matchPercentage).text}`}>
                  {data.matchPercentage}%
                </div>
                <div className="text-2xl font-semibold text-gray-900">Match Score</div>
              </div>
              <div className="bg-white/80 rounded-xl p-6">
                <p className="text-gray-800 leading-relaxed text-center">
                  {data.overallAssessment}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💪</span>
                Your Strengths for This Role
              </h2>
              <div className="space-y-6">
                {data.strengths.map((strength, idx) => (
                  <div key={idx} className="border-2 border-green-100 bg-green-50/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{strength.skill}</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-semibold text-gray-600">Evidence:</span>
                        <p className="text-gray-700">{strength.evidence}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-green-700">Impact:</span>
                        <p className="text-gray-700">{strength.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Skill Gaps & How to Address Them
              </h2>
              <div className="space-y-6">
                {data.gaps.map((gap, idx) => {
                  const colors = getImportanceColor(gap.importance);
                  return (
                    <div key={idx} className="border-2 border-gray-100 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{gap.skill}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                          {gap.importance}
                        </span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-semibold text-blue-900 mb-1">💡 Suggestion:</div>
                        <p className="text-blue-800">{gap.suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Application Strategy
              </h2>
              <ol className="space-y-4">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-800 pt-1">{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Analyze Another */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  setData(null);
                  setJobDescription("");
                }}
                className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
