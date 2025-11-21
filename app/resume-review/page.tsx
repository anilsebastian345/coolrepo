'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { ResumeReview } from '@/app/types/resumeReview';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { getCareerDirectionRecommendations } from '@/lib/careerDirections';

export default function ResumeReviewPage() {
  const router = useRouter();
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (profileLoading) return;

    console.log('User Profile:', userProfile);
    console.log('Resume Text:', userProfile?.resumeText ? 'FOUND' : 'NOT FOUND');

    if (!userProfile?.resumeText) {
      setError('No resume found. Please upload your resume first.');
      return;
    }

    // Fetch resume review
    const fetchReview = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get career directions (top 3)
        let careerDirections: CareerDirectionRecommendation[] = [];
        if (userProfile.careerStage && userProfile.careerPreferences) {
          careerDirections = await getCareerDirectionRecommendations({
            careerStage: userProfile.careerStage,
            careerPreferences: userProfile.careerPreferences,
            psychographicProfile: userProfile.psychographicProfile,
            resumeText: userProfile.resumeText,
            linkedInSummary: userProfile.linkedInSummary
          });
        }

        const response = await fetch('/api/resume-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: userProfile.resumeText,
            careerStage: userProfile.careerStage,
            careerPreferences: userProfile.careerPreferences,
            careerDirections: careerDirections.slice(0, 3),
            psychographicProfile: userProfile.psychographicProfile
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate resume review');
        }

        const data = await response.json();
        setReview(data.review);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume review');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [userProfile, profileLoading]);

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>

          {/* Skeleton cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resume Review & Skill Gap Analysis
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered insights to strengthen your resume and align with your career goals
          </p>
        </div>

        {/* First Impression */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-semibold mb-3">First Impression</h2>
          <p className="text-lg leading-relaxed">{review.firstImpression}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Strengths
            </h2>
            <ul className="space-y-2">
              {review.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-orange-500 mr-2">⚠</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-2">
              {review.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Extracted Skills */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Extracted Skills</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(review.extractedSkills).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direction Alignment */}
        {review.directionAlignment.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Career Direction Alignment
            </h2>
            <div className="space-y-6">
              {review.directionAlignment.map((direction, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {direction.directionName}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-purple-600 mr-2">
                        {direction.alignmentScore}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${direction.alignmentScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Strong Points */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2">
                        Strong Points
                      </h4>
                      <ul className="space-y-1">
                        {direction.strongPoints.map((point, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-1">✓</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skill Gaps */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-700 mb-2">
                        Skill Gaps
                      </h4>
                      <ul className="space-y-1">
                        {direction.skillGaps.map((gap, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-orange-500 mr-1">→</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {direction.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bullet Analysis */}
        {review.bulletAnalysis.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Bullet-by-Bullet Critique
            </h2>
            <div className="space-y-6">
              {review.bulletAnalysis.map((bullet, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Original:</p>
                    <p className="text-gray-700 italic">{bullet.original}</p>
                  </div>

                  {bullet.issues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-orange-600 mb-1">Issues:</p>
                      <ul className="space-y-1">
                        {bullet.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-orange-500 mr-1">→</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 mb-1">Improved:</p>
                        <p className="text-gray-900">{bullet.improved}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bullet.improved, idx)}
                        className="ml-3 p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-sm">✓</span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improved Summary */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Personalized Resume Summary
            </h2>
            <button
              onClick={() => copyToClipboard(review.improvedSummary)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              {copiedSummary ? (
                <>
                  <span className="mr-2">✓</span>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Summary
                </>
              )}
            </button>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5">
            <p className="text-lg text-gray-800 leading-relaxed">
              {review.improvedSummary}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/career-map')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Career Directions
          </button>
        </div>
      </div>
    </div>
  );
}
