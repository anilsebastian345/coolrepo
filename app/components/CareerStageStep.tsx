"use client";
import { useState, useEffect } from 'react';
import { CAREER_STAGE_OPTIONS, CareerStageUserSelected } from '@/lib/careerStage';

interface CareerStageStepProps {
  onSelect: (stage: CareerStageUserSelected) => void;
  initialValue?: CareerStageUserSelected;
}

export default function CareerStageStep({ onSelect, initialValue }: CareerStageStepProps) {
  const [selectedStage, setSelectedStage] = useState<CareerStageUserSelected | null>(
    initialValue || null
  );

  useEffect(() => {
    if (initialValue) {
      setSelectedStage(initialValue);
    }
  }, [initialValue]);

  const handleSelect = (value: CareerStageUserSelected) => {
    setSelectedStage(value);
    onSelect(value);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_career_stage', value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#d3d7c7] p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-[#1F2937] mb-2">
          Where are you in your career?
        </h3>
        <p className="text-sm text-[#7a7a7a] mb-6">
          This helps us personalize your coaching experience. You can skip this if you prefer.
        </p>

        <div className="space-y-3">
          {CAREER_STAGE_OPTIONS.map((option) => {
            const isSelected = selectedStage === option.value;
            const isPreferNotToSay = option.value === 'prefer_not_to_say';
            
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value as CareerStageUserSelected)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'bg-[#9DC183]/10 border-[#8a9112] shadow-md'
                    : isPreferNotToSay
                    ? 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                    : 'bg-white/40 border-[#d3d7c7] hover:border-[#8a9112] hover:shadow-sm'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#8a9112] focus:ring-offset-2
                `}
              >
                <div className="flex items-center">
                  {/* Radio button indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors
                    ${isSelected
                      ? 'border-[#8a9112] bg-[#8a9112]'
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-base font-medium transition-colors
                    ${isSelected ? 'text-[#1F2937]' : 'text-[#4B5563]'}
                    ${isPreferNotToSay ? 'text-[#7a7a7a] italic' : ''}
                  `}>
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedStage && selectedStage !== 'prefer_not_to_say' && (
          <div className="mt-6 p-4 bg-[#9DC183]/5 rounded-lg border border-[#9DC183]/20">
            <p className="text-sm text-[#4B5563]">
              <span className="font-medium text-[#1F2937]">Great!</span> We'll tailor your experience for the{' '}
              <span className="font-medium text-[#8a9112]">
                {CAREER_STAGE_OPTIONS.find(o => o.value === selectedStage)?.label.toLowerCase()}
              </span>{' '}
              stage.
            </p>
          </div>
        )}

        {selectedStage === 'prefer_not_to_say' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-[#7a7a7a]">
              No problem! We'll infer your career stage from your resume or provide general guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
