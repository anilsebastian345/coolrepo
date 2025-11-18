'use client';

import { useState } from 'react';
import { CareerStage, CareerPreferences, careerPreferencesConfig, OptionTag } from '@/lib/careerStage';
import { UserProfile } from '@/app/hooks/useUserProfile';

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
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Saving your preferences...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Intro */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {config.introTitle}
          </h1>
          <p className="text-lg text-slate-600">
            {config.introSubtitle}
          </p>
        </div>

        {/* Question 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {config.q1.title}
          </h2>
          {config.q1.subtitle && (
            <p className="text-sm text-slate-600 mb-4">{config.q1.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {config.q1.options.map((option) => (
              <button
                key={option.tag}
                type="button"
                onClick={() => toggleTag('energizingWork', option.tag, config.q1.maxSelect)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  preferences.energizingWork.includes(option.tag)
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {preferences.energizingWork.length >= config.q1.maxSelect && (
            <p className="text-xs text-slate-500 mt-2">
              You can only pick up to {config.q1.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 2 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {config.q2.title}
          </h2>
          {config.q2.subtitle && (
            <p className="text-sm text-slate-600 mb-4">{config.q2.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {config.q2.options.map((option) => (
              <button
                key={option.tag}
                type="button"
                onClick={() => toggleTag('avoidWork', option.tag, config.q2.maxSelect)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  preferences.avoidWork.includes(option.tag)
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {preferences.avoidWork.length >= config.q2.maxSelect && (
            <p className="text-xs text-slate-500 mt-2">
              You can only pick up to {config.q2.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {config.q3.title}
          </h2>
          {config.q3.subtitle && (
            <p className="text-sm text-slate-600 mb-4">{config.q3.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {config.q3.options.map((option) => (
              <button
                key={option.tag}
                type="button"
                onClick={() => toggleTag('environments', option.tag, config.q3.maxSelect)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  preferences.environments.includes(option.tag)
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {preferences.environments.length >= config.q3.maxSelect && (
            <p className="text-xs text-slate-500 mt-2">
              You can only pick up to {config.q3.maxSelect}.
            </p>
          )}
        </div>

        {/* Question 4 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {config.q4.title}
          </h2>
          {config.q4.subtitle && (
            <p className="text-sm text-slate-600 mb-4">{config.q4.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {config.q4.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, peopleVsIC: option.value }))}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  preferences.peopleVsIC === option.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 5 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {config.q5.title}
          </h2>
          {config.q5.subtitle && (
            <p className="text-sm text-slate-600 mb-4">{config.q5.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {config.q5.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, changeAppetite: option.value }))}
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  preferences.changeAppetite === option.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="bg-slate-900 text-white rounded-lg px-4 py-2 font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save and see my Career Directions'}
          </button>
        </div>
      </form>
    </div>
  );
}
