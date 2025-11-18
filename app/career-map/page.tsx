"use client";

import { useState } from "react";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import CareerPreferencesForm from "@/app/components/CareerPreferencesForm";
import CareerDirectionMapView from "@/app/components/CareerDirectionMapView";

export default function CareerMapPage() {
  const { userProfile, isLoading, refetch } = useUserProfile();
  const [showForm, setShowForm] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // No profile loaded
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-slate-600">Unable to load your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Show form if preferences not completed or user clicked update
  const shouldShowForm = !userProfile.careerPreferencesCompleted || showForm;

  const handleFormComplete = async () => {
    await refetch();
    setShowForm(false);
  };

  const handleUpdatePreferences = () => {
    setShowForm(true);
  };

  if (shouldShowForm) {
    return (
      <CareerPreferencesForm
        userProfile={userProfile}
        onComplete={handleFormComplete}
      />
    );
  }

  return (
    <CareerDirectionMapView
      userProfile={userProfile}
      onUpdatePreferences={handleUpdatePreferences}
    />
  );
}
