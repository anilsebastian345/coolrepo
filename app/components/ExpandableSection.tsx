'use client';

import { useState } from 'react';

interface ExpandableSectionProps {
  summary: React.ReactNode;
  children: React.ReactNode;
}

export default function ExpandableSection({ summary, children }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-[#7F915F] hover:text-[#6A7F4F] transition-colors"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        <span>{isExpanded ? 'Hide details' : 'Show full details'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
