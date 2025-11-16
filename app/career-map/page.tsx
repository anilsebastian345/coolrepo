"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CareerRecommendation } from "@/app/types/features";
import { getCareerRecommendations } from "@/lib/careerCoach";

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

// Role Card Component
function RoleCard({ role, onClick }: { role: CareerRecommendation; onClick: () => void }) {
  const getFitColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getFitBg = (score: number) => {
    if (score >= 85) return 'bg-green-50';
    if (score >= 70) return 'bg-blue-50';
    return 'bg-orange-50';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#8a9a5b] transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#55613b] transition-colors">
          {role.roleTitle}
        </h3>
        <div className={`${getFitBg(role.fitScore)} ${getFitColor(role.fitScore)} px-3 py-1 rounded-full text-sm font-semibold`}>
          {role.fitScore}% fit
        </div>
      </div>

      {/* Why it fits */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Why this fits you:</p>
        <ul className="space-y-2">
          {role.whyItFits.slice(0, 3).map((reason, idx) => (
            <li key={idx} className="text-sm text-gray-600 flex items-start">
              <span className="text-[#8a9a5b] mr-2">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Core Strengths Used</p>
          <div className="flex flex-wrap gap-2">
            {role.strengthsUsed.slice(0, 3).map((strength, idx) => (
              <span key={idx} className="bg-[#f8faf6] text-[#55613b] text-xs px-3 py-1 rounded-full border border-[#e8f0e3]">
                {strength}
              </span>
            ))}
            {role.strengthsUsed.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                +{role.strengthsUsed.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Key Skills</p>
          <div className="flex flex-wrap gap-2">
            {role.keySkills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100">
                {skill}
              </span>
            ))}
            {role.keySkills.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                +{role.keySkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Click indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500 group-hover:text-[#55613b] transition-colors">
          Click to view full details
        </span>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#55613b] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// Role Detail Modal
function RoleDetailModal({ role, onClose }: { role: CareerRecommendation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#f8faf6] to-white border-b border-gray-200 p-8 rounded-t-3xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{role.roleTitle}</h2>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {role.fitScore}% Match
                </div>
                <span className="text-gray-500 text-sm">Based on your profile and experience</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">{role.description}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Why This Fits */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">✨</span>
              Why This Role Fits You
            </h3>
            <ul className="space-y-3">
              {role.whyItFits.map((reason, idx) => (
                <li key={idx} className="flex items-start bg-[#f8faf6] p-4 rounded-xl">
                  <span className="text-[#8a9a5b] font-bold mr-3 text-lg">{idx + 1}.</span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Typical Responsibilities */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Typical Responsibilities
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {role.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#8a9a5b] mr-3 mt-1">▸</span>
                  <span className="text-gray-700">{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills Required */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {role.keySkills.map((skill, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Strengths You'll Use */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">💪</span>
              Strengths You'll Use
            </h3>
            <div className="flex flex-wrap gap-2">
              {role.strengthsUsed.map((strength, idx) => (
                <span key={idx} className="bg-[#f8faf6] text-[#55613b] px-4 py-2 rounded-full border border-[#e8f0e3] text-sm font-medium">
                  {strength}
                </span>
              ))}
            </div>
          </section>

          {/* Gap Summary */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Gap Summary
            </h3>
            <div className="bg-orange-50 border-2 border-orange-100 rounded-xl p-6">
              <p className="text-sm text-orange-800 mb-4 font-medium">
                Areas to develop for this role:
              </p>
              <ul className="space-y-2">
                {role.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-500 mr-3 font-bold">{idx + 1}.</span>
                    <span className="text-orange-900">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              Recommended Next Steps
            </h3>
            <div className="space-y-3">
              {role.nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start bg-gradient-to-r from-[#f8faf6] to-white p-4 rounded-xl border border-[#e8f0e3]">
                  <div className="bg-[#8a9a5b] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-gray-700 pt-1">{step}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            className="px-6 py-3 bg-[#8a9a5b] text-white rounded-xl font-medium hover:bg-[#55613b] transition-colors flex items-center gap-2"
          >
            <span>Save to My Plan</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function CareerMapPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage
    const profileData = localStorage.getItem('onboarding_psych_profile');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        setUserProfile(parsed);
        
        // Fetch recommendations from service
        setLoading(true);
        getCareerRecommendations(parsed)
          .then(recs => {
            setRecommendations(recs);
            setLoading(false);
          })
          .catch(err => {
            console.error('Failed to fetch recommendations:', err);
            setLoading(false);
          });
      } catch (err) {
        console.error('Failed to parse profile:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-white to-[#e8f0e3]">
      <TopNav activeTab="career" />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🧭</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Career Direction Map
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on your strengths and experience, here are roles where you're likely to thrive.
          </p>
        </div>

        {/* No Profile State */}
        {!userProfile && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200 max-w-2xl mx-auto">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Profile First</h3>
            <p className="text-gray-600 mb-6">
              We need your psychographic profile to generate personalized career recommendations.
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
            <p className="text-gray-600">Analyzing your profile and generating recommendations...</p>
          </div>
        )}

        {/* Role Cards Grid */}
        {userProfile && !loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onClick={() => setSelectedRole(role)}
              />
            ))}
          </div>
        )}

        {/* Additional Context */}
        {userProfile && (
          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-[#e8f0e3] p-8 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              How We Calculated These Recommendations
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#8a9a5b] mr-3">•</span>
                <span>We analyzed your psychographic profile including strengths, growth areas, and values</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8a9a5b] mr-3">•</span>
                <span>We matched your skills and experience against common role requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8a9a5b] mr-3">•</span>
                <span>Fit scores reflect alignment between your profile and role demands (85%+ = excellent fit)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#8a9a5b] mr-3">•</span>
                <span>Click any role to see detailed responsibilities, gaps, and personalized next steps</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}
