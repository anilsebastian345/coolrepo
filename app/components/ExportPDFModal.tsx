'use client';

import { useState } from 'react';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (sections: ExportSections) => void;
}

export interface ExportSections {
  summary: boolean;
  strengths: boolean;
  skills: boolean;
  bullets: boolean;
  careerDirections: boolean;
}

export default function ExportPDFModal({ isOpen, onClose, onExport }: ExportPDFModalProps) {
  const [sections, setSections] = useState<ExportSections>({
    summary: true,
    strengths: true,
    skills: true,
    bullets: true,
    careerDirections: false,
  });

  const toggleSection = (key: keyof ExportSections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    onExport(sections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
        style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 
            className="text-2xl font-semibold text-[#232323] mb-2"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Download your Sage report
          </h2>
          <p 
            className="text-sm text-[#6F6F6F]"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Select which sections to include in your PDF report.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sections.summary}
              onChange={() => toggleSection('summary')}
              className="w-5 h-5 rounded border-2 border-[#D4D4D4] text-[#7F915F] focus:ring-[#7F915F] focus:ring-offset-0 cursor-pointer"
            />
            <span 
              className="text-sm text-[#232323] group-hover:text-[#7F915F] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Resume Summary
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sections.strengths}
              onChange={() => toggleSection('strengths')}
              className="w-5 h-5 rounded border-2 border-[#D4D4D4] text-[#7F915F] focus:ring-[#7F915F] focus:ring-offset-0 cursor-pointer"
            />
            <span 
              className="text-sm text-[#232323] group-hover:text-[#7F915F] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Strengths & Areas for Improvement
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sections.bullets}
              onChange={() => toggleSection('bullets')}
              className="w-5 h-5 rounded border-2 border-[#D4D4D4] text-[#7F915F] focus:ring-[#7F915F] focus:ring-offset-0 cursor-pointer"
            />
            <span 
              className="text-sm text-[#232323] group-hover:text-[#7F915F] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Improved Resume Bullets
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sections.skills}
              onChange={() => toggleSection('skills')}
              className="w-5 h-5 rounded border-2 border-[#D4D4D4] text-[#7F915F] focus:ring-[#7F915F] focus:ring-offset-0 cursor-pointer"
            />
            <span 
              className="text-sm text-[#232323] group-hover:text-[#7F915F] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Extracted Skills
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sections.careerDirections}
              onChange={() => toggleSection('careerDirections')}
              className="w-5 h-5 rounded border-2 border-[#D4D4D4] text-[#7F915F] focus:ring-[#7F915F] focus:ring-offset-0 cursor-pointer"
            />
            <span 
              className="text-sm text-[#232323] group-hover:text-[#7F915F] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Career Direction Highlights
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white text-[#4A4A4A] border border-[#E5E5E5] rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2.5 bg-[#7F915F] text-white rounded-lg hover:bg-[#6A7F4F] transition-colors shadow-sm"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
