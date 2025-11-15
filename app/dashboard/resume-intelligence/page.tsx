"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeAnalysis } from "@/app/types/features";

function SageLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
      <div className="relative w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-white/30 border border-white/40 backdrop-blur-md">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <span className="text-lg text-[#7a7a7a] font-normal">← Back to Dashboard</span>
    </Link>
  );
}

export default function ResumeIntelligencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Auto-load on mount
    handleAnalyze();
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    
    try {
      const resume = localStorage.getItem('onboarding_resume_text');
      const linkedin = localStorage.getItem('onboarding_linkedin_text');
      
      if (!resume && !linkedin) {
        setError("Please upload your resume or LinkedIn profile first.");
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/resume-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp-user-id',
          resume,
          linkedin
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-[#ffffff] to-[#e8f0e3]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <SageLogo />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume & LinkedIn Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered analysis to strengthen your professional presence
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#8a9a5b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Analyzing your resume and LinkedIn profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Upload Resume/LinkedIn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Strengths */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💪</span>
                Your Strengths
              </h2>
              <div className="space-y-6">
                {data.strengths.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Opportunities for Growth
              </h2>
              <div className="space-y-6">
                {data.gaps.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <span className="text-orange-500 mt-1 flex-shrink-0">→</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved Bullets */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📝</span>
                Improved Resume Bullets
              </h2>
              <div className="space-y-6">
                {data.improvedBullets.map((bullet, idx) => (
                  <div key={idx} className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#9DC183] transition-colors">
                    {/* Original */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-500 mb-2">ORIGINAL</div>
                      <p className="text-gray-600 italic">{bullet.original}</p>
                    </div>
                    
                    {/* Improved */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-green-600 mb-2">IMPROVED</div>
                      <p className="text-gray-900 font-medium leading-relaxed">{bullet.improved}</p>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-semibold text-blue-900 mb-1">Why this works:</div>
                      <p className="text-sm text-blue-800">{bullet.reasoning}</p>
                    </div>
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => copyToClipboard(bullet.improved, idx)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#8a9a5b] text-white rounded-lg hover:bg-[#55613b] transition-colors duration-200 font-medium text-sm"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <span>✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy Improved Version</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* LinkedIn About */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💼</span>
                Improved LinkedIn About Section
              </h2>
              
              {/* Improved About */}
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="whitespace-pre-line text-gray-800 leading-relaxed mb-6">
                  {data.linkedinAbout.improved}
                </div>
                <button
                  onClick={() => copyToClipboard(data.linkedinAbout.improved, 999)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8a9a5b] text-white rounded-lg hover:bg-[#55613b] transition-colors duration-200 font-medium"
                >
                  {copiedIndex === 999 ? (
                    <>
                      <span>✓</span>
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Highlights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What makes this effective:</h3>
                <ul className="space-y-2">
                  {data.linkedinAbout.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="text-center pt-8">
              <button
                onClick={handleAnalyze}
                className="px-8 py-3 bg-[#8a9a5b] text-white rounded-xl hover:bg-[#55613b] transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Regenerate Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
