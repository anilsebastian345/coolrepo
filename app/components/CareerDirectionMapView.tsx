"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/app/hooks/useUserProfile";
import { CareerDirectionRecommendation } from "@/app/types/careerDirections";
import { getCareerDirectionRecommendations } from "@/lib/careerDirections";

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
  const [expandedDirection, setExpandedDirection] = useState<string | null>(null);

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

  const getFitBadge = (score: number) => {
    if (score >= 75) return { label: "High Fit", color: "bg-green-100 text-green-800 border-green-200" };
    if (score >= 60) return { label: "Good Fit", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { label: "Emerging", color: "bg-amber-100 text-amber-800 border-amber-200" };
  };

  const toggleDirection = (id: string) => {
    setExpandedDirection(expandedDirection === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading your career direction map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Your Career Direction Map
            </h1>
            <p className="text-lg text-slate-600">
              These suggestions combine your background, working style, and preferences. They're meant to be directions, not prescriptions.
            </p>
          </div>
          <button
            onClick={handleUpdate}
            className="text-sm text-slate-500 hover:text-slate-700 underline whitespace-nowrap ml-4"
          >
            Update preferences
          </button>
        </div>

        {/* Career Directions */}
        <div className="space-y-4 mt-8">
          {recommendations.map((direction) => {
            const isExpanded = expandedDirection === direction.id;
            const badge = getFitBadge(direction.fitScore);

            return (
              <div
                key={direction.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all"
              >
                {/* Main Card - Clickable */}
                <button
                  onClick={() => toggleDirection(direction.id)}
                  className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Direction Name & Badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-slate-900">
                          {direction.name}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-slate-600 mb-4">
                        {direction.summary}
                      </p>

                      {/* Why It Fits */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Why this fits you:</h3>
                        <ul className="space-y-1 list-disc ml-5">
                          {direction.whyItFits.map((reason, idx) => (
                            <li key={idx} className="text-sm text-slate-700">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cluster Pills */}
                      <div className="flex flex-wrap gap-2">
                        {direction.clusters.map((cluster) => (
                          <span
                            key={cluster.id}
                            className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs border border-slate-200"
                          >
                            {cluster.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <svg
                        className={`w-6 h-6 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6">
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 italic">
                        {direction.stageNote}
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      What this could look like for you
                    </h3>

                    <div className="space-y-6">
                      {direction.clusters.map((cluster) => {
                        // Filter paths by stage
                        const stagePaths = cluster.examplePaths.filter(
                          path => path.stageHint === userProfile.careerStage || path.stageHint === "any"
                        );
                        const pathsToShow = stagePaths.length > 0 ? stagePaths : cluster.examplePaths.slice(0, 3);

                        return (
                          <div key={cluster.id} className="bg-white rounded-xl p-4 border border-slate-200">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {cluster.name}
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">
                              {cluster.summary}
                            </p>

                            <div className="space-y-2 ml-4">
                              {pathsToShow.slice(0, 3).map((path) => (
                                <div key={path.id} className="text-sm">
                                  <span className="font-medium text-slate-900">
                                    {path.name}:
                                  </span>
                                  <span className="text-slate-700 ml-1">
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
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No directions found
            </h2>
            <p className="text-slate-600 mb-6">
              Try updating your preferences to get career direction recommendations.
            </p>
            <button
              onClick={handleUpdate}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Update My Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
