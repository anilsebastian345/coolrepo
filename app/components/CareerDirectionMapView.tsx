"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/app/hooks/useUserProfile";
import { CareerDirectionRecommendation } from "@/app/types/careerDirections";
import { getCareerDirectionRecommendations } from "@/lib/careerDirections";
import FitLevelChip from "./FitLevelChip";
import ExpandableSection from "./ExpandableSection";
import TagPill from "./TagPill";

interface CareerDirectionMapViewProps {
  userProfile: UserProfile;
  onUpdatePreferences: () => void;
}

export default function CareerDirectionMapView({
  userProfile,
  onUpdatePreferences,
}: CareerDirectionMapViewProps) {
  const [recommendations, setRecommendations] = useState<CareerDirectionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getDirectionSummary = (direction: CareerDirectionRecommendation): string => {
    // Generate concise one-line summary based on direction
    const summaries: Record<string, string> = {
      'business-strategy-leadership': 'For leaders who excel at systems thinking, transformation, and measurable impact.',
      'product-innovation': 'For builders who combine user insight, technical fluency, and strategic product thinking.',
      'operations-scaling': 'For operators who thrive on efficiency, process excellence, and organizational leverage.',
      'people-culture': 'For leaders who develop talent, shape culture, and drive organizational effectiveness.',
      'consulting-advisory': 'For strategic advisors who solve complex problems and drive client transformation.',
      'technical-leadership': 'For technical leaders who bridge engineering excellence and business strategy.',
    };
    return summaries[direction.id] || 'A career direction aligned with your strengths and preferences.';
  };

  const getTopBullets = (direction: CareerDirectionRecommendation): string[] => {
    // Rewrite bullets to be concise and punchy
    return direction.whyItFits.slice(0, 3).map(bullet => {
      // Truncate and make more concise
      if (bullet.length > 80) {
        return bullet.substring(0, 77) + '...';
      }
      return bullet;
    });
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
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#7F915F] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Loading your career direction map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF6] py-12 px-4">
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
        <div className="space-y-8">
          {recommendations.map((direction) => (
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
                className="text-sm text-[#4A4A4A] mb-6 max-w-[80%] leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {getDirectionSummary(direction)}
              </p>

              {/* Preview Bullets */}
              <div className="mb-6">
                <ul className="space-y-2">
                  {getTopBullets(direction).map((bullet, idx) => (
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

              {/* Role Examples Section */}
              <div className="mb-6 pb-6 border-b border-[#E5E5E5]">
                <h3 
                  className="text-xs font-medium text-[#6F6F6F] uppercase tracking-wider mb-3"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Common roles in this direction
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getRoleExamples(direction).map((role, idx) => (
                    <TagPill key={idx} label={role} variant="display" />
                  ))}
                </div>
              </div>

              {/* Expandable Section */}
              <ExpandableSection summary="Show full details">
                <div className="space-y-6">
                  {/* Full Why It Fits */}
                  <div className="bg-[#F4F7EF] rounded-xl p-6">
                    <h3 
                      className="text-base font-semibold text-[#232323] mb-4"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      Why this fits you
                    </h3>
                    <ul className="space-y-2">
                      {direction.whyItFits.map((reason, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start gap-3 text-sm text-[#4A4A4A]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7F915F] mt-2 flex-shrink-0"></span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clusters */}
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
                          <div key={cluster.id} className="bg-white rounded-xl p-5 border border-[#E5E5E5]">
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
              </ExpandableSection>
            </div>
          ))}
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
  );
}
