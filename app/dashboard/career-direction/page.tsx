"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CareerDirectionResponse, CareerPath } from "@/app/types/features";

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

function CareerPathCard({ path, rank }: { path: CareerPath; rank: number }) {
  const [isExpanded, setIsExpanded] = useState(rank === 1);
  
  const matchColor = path.matchScore >= 85 ? 'text-green-600' : path.matchScore >= 70 ? 'text-blue-600' : 'text-orange-600';
  const bgColor = path.matchScore >= 85 ? 'bg-green-50' : path.matchScore >= 70 ? 'bg-blue-50' : 'bg-orange-50';
  
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-gray-400">#{rank}</span>
              <h3 className="text-2xl font-bold text-gray-900">{path.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{path.description}</p>
          </div>
          <div className={`ml-4 px-4 py-2 rounded-xl ${bgColor} flex-shrink-0`}>
            <div className={`text-3xl font-bold ${matchColor}`}>{path.matchScore}%</div>
            <div className="text-xs text-gray-600 text-center">match</div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-[#8a9a5b] font-medium hover:text-[#55613b] transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-6 animate-fade-in-up">
          {/* Key Strengths */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">💪</span>
              Key Strengths You Bring
            </h4>
            <ul className="space-y-2">
              {path.keyStrengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Required Skills */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🎓</span>
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {path.requiredSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Growth Areas */}
          {path.growthAreas.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🌱</span>
                Areas for Growth
              </h4>
              <ul className="space-y-2">
                {path.growthAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1">→</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Next Steps */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Your Next Steps
            </h4>
            <ol className="space-y-3">
              {path.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#8a9a5b] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerDirectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CareerDirectionResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-load on mount
    handleGenerate();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    
    try {
      // Get data from localStorage
      const profile = localStorage.getItem('onboarding_psych_profile');
      const resume = localStorage.getItem('onboarding_resume_text');
      const linkedin = localStorage.getItem('onboarding_linkedin_text');
      
      if (!profile) {
        setError("Please complete your psychographic profile first.");
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/career-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp-user-id',
          profile,
          resume,
          linkedin
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate career recommendations');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-white to-[#e8f0e3]">
      <TopNav activeTab="career" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🧭</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Career Direction Map
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized career paths based on your unique psychographic profile and professional experience
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#8a9a5b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Analyzing your profile and generating recommendations...</p>
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
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Reasoning */}
            {data.reasoning && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Why These Paths?
                </h3>
                <p className="text-gray-700 leading-relaxed">{data.reasoning}</p>
              </div>
            )}
            
            {/* Career Paths */}
            <div className="space-y-6">
              {data.recommendedPaths.map((path, idx) => (
                <CareerPathCard key={idx} path={path} rank={idx + 1} />
              ))}
            </div>
            
            {/* Regenerate Button */}
            <div className="text-center pt-8">
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-[#8a9a5b] text-white rounded-xl hover:bg-[#55613b] transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Regenerate Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
