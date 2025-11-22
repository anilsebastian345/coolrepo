'use client';

import { useState } from 'react';
import { CareerStage, CareerPreferences, careerPreferencesConfig, OptionTag } from '@/lib/careerStage';
import { UserProfile } from '@/app/hooks/useUserProfile';
import TagPill from './TagPill';

interface CareerPreferencesFormProps {
  userProfile: UserProfile;
  onComplete: () => void;
}

export default function CareerPreferencesForm({
  userProfile,
  onComplete,
}: CareerPreferencesFormProps) {
  const careerStage = userProfile.careerStage || 'unknown';
  const config = careerPreferencesConfig[careerStage];

  const [preferences, setPreferences] = useState<CareerPreferences>(
    userProfile.careerPreferences || {
      energizingWork: [],
      avoidWork: [],
      environments: [],
      peopleVsIC: null,
      changeAppetite: null,
    }
  );

  const [saving, setSaving] = useState(false);

  const toggleTag = (field: 'energizingWork' | 'avoidWork' | 'environments', tag: OptionTag, maxSelect: number) => {
    setPreferences((prev) => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(tag);

      if (isSelected) {
        return {
          ...prev,
          [field]: currentArray.filter((t) => t !== tag),
        };
      } else {
        if (currentArray.length >= maxSelect) {
          return prev; // Don't add if at max
        }
        return {
          ...prev,
          [field]: [...currentArray, tag],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/career-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerPreferences: preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isValid =
    preferences.energizingWork.length >= 1 &&
    preferences.peopleVsIC !== null &&
    preferences.changeAppetite !== null;

  return (
    <div className="min-h-screen bg-[#FAFAF6] py-12 px-4">
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="inline-block w-12 h-12 border-4 border-[#7F915F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p 
              className="text-[#6F6F6F]"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Saving your preferences...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-[880px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-3xl font-semibold text-[#232323] mb-3"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Let's calibrate your next chapter
          </h1>
          <p 
            className="text-base text-[#6F6F6F] max-w-[640px] mx-auto leading-relaxed"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            We'll use this to shape your next chapter and potential pivots.
          </p>
        </div>

        {/* Question 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {config.q1.title}
          </h2>
          {config.q1.subtitle && (
            <p 
              className="text-sm text-[#6F6F6F] mb-6"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {config.q1.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {config.q1.options.map((option) => (
              <TagPill
                key={option.tag}
                label={option.label}
                selected={preferences.energizingWork.includes(option.tag)}
                onClick={() => toggleTag('energizingWork', option.tag, config.q1.maxSelect)}
              />
            ))}
          </div>
          {preferences.energizingWork.length >= config.q1.maxSelect && (
            <p 
              className="text-xs text-[#8F8F8F] mt-3"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              You can only pick up to {config.q1.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 2 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {config.q2.title}
          </h2>
          {config.q2.subtitle && (
            <p 
              className="text-sm text-[#6F6F6F] mb-6"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {config.q2.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {config.q2.options.map((option) => (
              <TagPill
                key={option.tag}
                label={option.label}
                selected={preferences.avoidWork.includes(option.tag)}
                onClick={() => toggleTag('avoidWork', option.tag, config.q2.maxSelect)}
              />
            ))}
          </div>
          {preferences.avoidWork.length >= config.q2.maxSelect && (
            <p 
              className="text-xs text-[#8F8F8F] mt-3"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              You can only pick up to {config.q2.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {config.q3.title}
          </h2>
          {config.q3.subtitle && (
            <p 
              className="text-sm text-[#6F6F6F] mb-6"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {config.q3.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {config.q3.options.map((option) => (
              <TagPill
                key={option.tag}
                label={option.label}
                selected={preferences.environments.includes(option.tag)}
                onClick={() => toggleTag('environments', option.tag, config.q3.maxSelect)}
              />
            ))}
          </div>
          {preferences.environments.length >= config.q3.maxSelect && (
            <p 
              className="text-xs text-[#8F8F8F] mt-3"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              You can only pick up to {config.q3.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 4 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {config.q4.title}
          </h2>
          {config.q4.subtitle && (
            <p 
              className="text-sm text-[#6F6F6F] mb-6"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {config.q4.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {config.q4.options.map((option) => (
              <TagPill
                key={option.value}
                label={option.label}
                selected={preferences.peopleVsIC === option.value}
                onClick={() => setPreferences((prev) => ({ ...prev, peopleVsIC: option.value }))}
              />
            ))}
          </div>
        </div>

        {/* Question 5 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 
            className="text-lg font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {config.q5.title}
          </h2>
          {config.q5.subtitle && (
            <p 
              className="text-sm text-[#6F6F6F] mb-6"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {config.q5.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {config.q5.options.map((option) => (
              <TagPill
                key={option.value}
                label={option.label}
                selected={preferences.changeAppetite === option.value}
                onClick={() => setPreferences((prev) => ({ ...prev, changeAppetite: option.value }))}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-12">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="bg-[#7F915F] text-white rounded-xl px-8 py-3 font-medium hover:bg-[#6A7F4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-[#7F915F]"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            {saving ? 'Saving...' : 'Save and see my Career Directions'}
          </button>
        </div>
      </form>
    </div>
  );
}
