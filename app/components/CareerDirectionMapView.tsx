"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from 'next-auth/react';
import { UserProfile } from "@/app/hooks/useUserProfile";
import { CareerDirectionRecommendation } from "@/app/types/careerDirections";
import { getCareerDirectionRecommendations } from "@/lib/careerDirections";
import FitLevelChip from "./FitLevelChip";
import TagPill from "./TagPill";
import AnalysisLoader from "./AnalysisLoader";

interface CareerDirectionMapViewProps {
  userProfile: UserProfile;
  onUpdatePreferences: () => void;
}

export default function CareerDirectionMapView({
  userProfile,
  onUpdatePreferences,
}: CareerDirectionMapViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<CareerDirectionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const recs = await getCareerDirectionRecommendations(userProfile);
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load career directions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [userProfile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = () => {
    const confirmed = window.confirm(
      "Are you sure you want to update your career preferences? This will take you back to the questionnaire."
    );
    if (confirmed) {
      onUpdatePreferences();
    }
  };

  const getFitLevel = (score: number): 'high' | 'strong' | 'possible' => {
    if (score >= 75) return 'high';
    if (score >= 60) return 'strong';
    return 'possible';
  };

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getDirectionSummary = (direction: CareerDirectionRecommendation): string => {
    // Generate concise one-line summary based on direction
    const summaries: Record<string, string> = {
      'business-strategy-leadership': 'A direction for leaders who excel at systems thinking, transformation, and measurable outcomes.',
      'product-innovation': 'A direction for builders who combine user insight, technical fluency, and strategic product thinking.',
      'operations-scaling': 'A direction for operators who thrive on efficiency, process excellence, and organizational leverage.',
      'people-culture': 'A direction for leaders who develop talent, shape culture, and drive organizational effectiveness.',
      'consulting-advisory': 'A direction for strategic advisors who solve complex problems and drive client transformation.',
      'technical-leadership': 'A direction for technical leaders who bridge engineering excellence and business strategy.',
    };
    return summaries[direction.id] || 'A career direction aligned with your strengths and preferences.';
  };

  const getPreviewBullets = (direction: CareerDirectionRecommendation): string[] => {
    // Create SHORT preview bullets (different from full bullets)
    const previews: Record<string, string[]> = {
      'business-strategy-leadership': [
        'Led global teams and delivered high-impact transformation',
        'Strong strategic thinking and systems orientation',
        'Recognized for leadership clarity and results'
      ],
      'product-innovation': [
        'Built products that balance user needs with business goals',
        'Bridge technical teams and strategic vision',
        'Track record of shipping impactful features'
      ],
      'operations-scaling': [
        'Optimized complex systems and processes at scale',
        'Strong analytical and execution capabilities',
        'Delivered measurable efficiency improvements'
      ],
      'people-culture': [
        'Developed talent and shaped high-performing cultures',
        'Strong interpersonal and coaching abilities',
        'Created lasting organizational impact'
      ],
    };
    return previews[direction.id] || direction.whyItFits.slice(0, 2).map(b => 
      b.length > 70 ? b.substring(0, 67) + '...' : b
    );
  };

  const getRoleExamples = (direction: CareerDirectionRecommendation): string[] => {
    // Extract role examples from clusters
    const roles: string[] = [];
    direction.clusters.forEach(cluster => {
      cluster.examplePaths.slice(0, 2).forEach(path => {
        roles.push(path.name);
      });
    });
    return roles.slice(0, 4);
  };

  if (loading) {
    return (
      <AnalysisLoader
        title="Building your career direction map…"
        messages={[
          "Reviewing your profile and preferences.",
          "Matching your patterns to potential directions.",
          "Prioritizing the best fits for this stage of your career."
        ]}
      />
    );
  }

  const displayName = session?.user?.name?.split(' ')[0] || 'User';
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/profile' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/resume-intel' },
    { id: 'jobmatch', label: 'Job Match', href: '/job-match' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#7A8E50]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Sage</span>
            </Link>
            
            {/* Nav Items & User Dropdown */}
            <div className="flex items-center gap-4">
              {/* Nav Items */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.id === 'career'
                        ? 'bg-[#7A8E50] text-white shadow-sm'
                        : 'text-[#4A4A4A] hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* User Dropdown */}
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

      {/* Page Content */}
      <div className="py-12 px-4">
        <div className="max-w-[920px] mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 
              className="text-3xl font-semibold text-[#232323] mb-3"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Your Career Direction Map
            </h1>
            <p 
              className="text-base text-[#6F6F6F] max-w-[680px] mx-auto leading-relaxed"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              These suggestions combine your background, working style, and preferences. They're directions, not prescriptions.
            </p>
            <button
              onClick={handleUpdate}
              className="mt-4 text-sm text-[#7F915F] hover:text-[#6A7F4F] underline transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Update preferences
            </button>
          </div>

          {/* Career Directions */}
          <div className="space-y-10">
            {recommendations.map((direction) => {
              const isExpanded = expandedCards.has(direction.id);
              
              return (
                <div
                  key={direction.id}
                  className="bg-white rounded-2xl shadow-sm p-8 transition-all duration-300 hover:shadow-md animate-fade-in-up"
                  style={{ 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <svg className="w-5 h-5 text-[#7F915F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <h2 
                        className="text-xl font-semibold text-[#232323]"
                        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                      >
                        {direction.name}
                      </h2>
                    </div>
                    <FitLevelChip level={getFitLevel(direction.fitScore)} />
                  </div>

                  {/* One-line Summary */}
                  <p 
                    className="text-sm text-[#555] mb-6 leading-relaxed"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    {getDirectionSummary(direction)}
                  </p>

                  {/* Preview Bullets (shown when collapsed) */}
                  {!isExpanded && (
                    <div className="mb-6">
                      <ul className="space-y-2.5">
                        {getPreviewBullets(direction).map((bullet, idx) => (
                          <li 
                            key={idx} 
                            className="flex items-start gap-3 text-sm text-[#4A4A4A]"
                            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7F915F] mt-2 flex-shrink-0"></span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Role Examples Section */}
                  <div className={`pb-6 border-b border-[#E5E5E5] ${isExpanded ? 'mb-6' : 'mb-8'}`}>
                    <h3 
                      className="text-xs font-medium text-[#6F6F6F] uppercase tracking-wider mb-3"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      Common roles in this direction
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {getRoleExamples(direction).map((role, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-[#EEF2E8] text-[#4A4A4A] border border-[#E5E5E5] hover:shadow-sm transition-shadow"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-6 mb-6">
                      {/* Full Why It Fits */}
                      <div className="bg-[#F5F7F1] rounded-xl p-5 shadow-sm">
                        <h3 
                          className="text-base font-semibold text-[#232323] mb-4"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          Why this fits you
                        </h3>
                        <ul className="space-y-2.5">
                          {direction.whyItFits.map((reason, idx) => (
                            <li 
                              key={idx} 
                              className="flex items-start gap-3 text-sm text-[#4A4A4A] leading-relaxed"
                              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7F915F] mt-2 flex-shrink-0"></span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What this could look like */}
                      <div>
                        <h3 
                          className="text-base font-semibold text-[#232323] mb-4"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          What this could look like for you
                        </h3>
                        <div className="space-y-4">
                          {direction.clusters.map((cluster) => {
                            const stagePaths = cluster.examplePaths.filter(
                              path => path.stageHint === userProfile.careerStage || path.stageHint === "any"
                            );
                            const pathsToShow = stagePaths.length > 0 ? stagePaths : cluster.examplePaths.slice(0, 3);

                            return (
                              <div key={cluster.id} className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm">
                                <h4 
                                  className="font-semibold text-[#232323] mb-1"
                                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                                >
                                  {cluster.name}
                                </h4>
                                <p 
                                  className="text-sm text-[#6F6F6F] mb-3"
                                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                                >
                                  {cluster.summary}
                                </p>

                                <div className="space-y-2">
                                  {pathsToShow.slice(0, 3).map((path) => (
                                    <div key={path.id} className="text-sm">
                                      <span 
                                        className="font-medium text-[#232323]"
                                        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                                      >
                                        {path.name}:
                                      </span>
                                      <span 
                                        className="text-[#4A4A4A] ml-1"
                                        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                                      >
                                        {path.description}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Stage Note */}
                      {direction.stageNote && (
                        <div className="bg-[#FAFAF6] rounded-xl p-4 border border-[#E5E5E5]">
                          <p 
                            className="text-sm text-[#6F6F6F] italic"
                            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                          >
                            {direction.stageNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show/Hide Details Button */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => toggleCard(direction.id)}
                      className="flex items-center gap-2 text-sm text-[#666] hover:text-[#333] transition-colors"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {recommendations.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <h2 
                className="text-2xl font-semibold text-[#232323] mb-3"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                No directions found
              </h2>
              <p 
                className="text-[#6F6F6F] mb-6"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Try updating your preferences to get career direction recommendations.
              </p>
              <button
                onClick={handleUpdate}
                className="px-6 py-3 bg-[#7F915F] text-white rounded-xl hover:bg-[#6A7F4F] transition-colors shadow-sm"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                Update My Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
