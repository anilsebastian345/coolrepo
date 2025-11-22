"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from 'next-auth/react';
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { ResumeReview } from '@/app/types/resumeReview';
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
    { id: 'jobmatch', label: 'Job Match', href: '/job-match' },
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

export default function ResumeIntelPage() {
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
    console.log('Resume Text:', userProfile?.resumeText ? `Found (${userProfile.resumeText.length} chars)` : 'NOT FOUND');

    if (!userProfile?.resumeText) {
      setError('No resume found. Please upload your resume first.');
      return;
    }

    const fetchReview = async () => {
      setLoading(true);
      setError(null);

      try {
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

        console.log('Calling /api/resume-review with resume length:', userProfile.resumeText?.length || 0);
        
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
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to generate resume review');
        }

        const data = await response.json();
        console.log('Received review data:', data);
        setReview(data.review);
      } catch (err) {
        console.error('Error fetching review:', err);
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
      <AnalysisLoader
        title="Analyzing your resume…"
        messages={[
          "Reading your experience and accomplishments.",
          "Mapping your strengths, gaps, and skills.",
          "Preparing concrete edits you can paste into your resume."
        ]}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF6]">
        <TopNav activeTab="resume" />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Error</h2>
            <p className="text-red-700" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
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
    <div className="min-h-screen bg-[#FAFAF6]">
      <TopNav activeTab="resume" />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 
            className="text-3xl font-semibold text-[#232323] mb-3"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Resume Intel
          </h1>
          <p 
            className="text-base text-[#6F6F6F]"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            AI-powered insights from your actual resume
          </p>
        </div>

        {/* First Impression */}
        <div className="bg-[#F4F7EF] rounded-2xl shadow-sm p-8 mb-8 border border-[#E5E5E5]">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-4"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            First impression
          </h2>
          <p 
            className="text-[#333] leading-relaxed mb-4"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {review.firstImpression}
          </p>
          {review.strengths && review.strengths.length > 0 && (
            <div className="mt-4">
              <h3 
                className="text-sm font-medium text-[#6F6F6F] mb-2"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                What stands out
              </h3>
              <ul className="space-y-1.5">
                {review.strengths.slice(0, 3).map((strength, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-2 text-sm text-[#4A4A4A]"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#7F915F] mt-2 flex-shrink-0"></span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E5E5E5]">
            <h2 
              className="text-lg font-semibold text-[#232323] mb-4 flex items-center"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              <span className="text-[#7F915F] mr-2">✓</span>
              Strengths
            </h2>
            <ul className="space-y-2.5">
              {review.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#7F915F] mr-2 mt-1">•</span>
                  <span className="text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E5E5E5]">
            <h2 
              className="text-lg font-semibold text-[#232323] mb-4 flex items-center"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              <span className="text-orange-500 mr-2">⚠</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-2.5">
              {review.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span className="text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Extracted Skills */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-[#E5E5E5]">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-4"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Extracted Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(review.extractedSkills).map(([category, skills]) => (
              <div key={category}>
                <h3 
                  className="text-xs font-medium text-[#6F6F6F] uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#EEF2E8] text-[#4A4A4A] rounded-full text-sm border border-[#E5E5E5]"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bullet Analysis */}
        {review.bulletAnalysis.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-[#E5E5E5]">
            <h2 
              className="text-lg font-semibold text-[#232323] mb-4"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              📝 Improved Resume Bullets
            </h2>
            <div className="space-y-6">
              {review.bulletAnalysis.map((bullet, idx) => (
                <div key={idx} className="border-l-4 border-[#7F915F] pl-4">
                  <div className="mb-2">
                    <p 
                      className="text-sm font-medium text-[#6F6F6F] mb-1"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      Original:
                    </p>
                    <p 
                      className="text-[#4A4A4A] italic"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      {bullet.original}
                    </p>
                  </div>

                  <div className="bg-[#F5F7F1] border border-[#E5E5E5] rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p 
                          className="text-sm font-medium text-[#7F915F] mb-1"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          Improved:
                        </p>
                        <p 
                          className="text-[#232323]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          {bullet.improved}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bullet.improved, idx)}
                        className="ml-3 p-2 text-[#7F915F] hover:bg-[#EEF2E8] rounded transition-colors"
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
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-lg font-semibold text-[#232323]"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Personalized Resume Summary
            </h2>
            <button
              onClick={() => copyToClipboard(review.improvedSummary)}
              className="px-4 py-2 bg-[#7F915F] text-white rounded-lg hover:bg-[#6A7F4F] transition-colors flex items-center shadow-sm"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
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
          <div className="bg-[#F4F7EF] rounded-lg p-5 border border-[#E5E5E5]">
            <p 
              className="text-base text-[#333] leading-relaxed"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {review.improvedSummary}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white text-[#4A4A4A] border border-[#E5E5E5] rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/career-map')}
            className="px-6 py-3 bg-[#7F915F] text-white rounded-lg hover:bg-[#6A7F4F] transition-colors shadow-sm"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            View Career Directions
          </button>
        </div>
      </div>
    </div>
  );
}
