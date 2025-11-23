"use client";

import { useState, useEffect } from 'react';
import { RoleFitAnalysis } from '@/lib/roleFitHistory';
import { JobMatchAnalysis } from '@/app/types/jobMatch';
import AnalysisLoader from './AnalysisLoader';

interface RoleFitInsights {
  recurringStrengths: string[];
  recurringGaps: string[];
  bestFitPatterns: string[];
  weakerFitPatterns: string[];
  recommendations: string[];
}

interface RoleFitHistoryTabProps {
  userId: string;
  onLoadAnalysis: (analysis: JobMatchAnalysis, title: string, description: string) => void;
}

export default function RoleFitHistoryTab({ userId, onLoadAnalysis }: RoleFitHistoryTabProps) {
  const [history, setHistory] = useState<RoleFitAnalysis[]>([]);
  const [insights, setInsights] = useState<RoleFitInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/role-fit-history');
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setHistory(data.analyses || []);
      
      // Fetch insights if we have enough data
      if (data.analyses && data.analyses.length >= 3) {
        fetchInsights();
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await fetch('/api/role-fit-insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleRowClick = (record: RoleFitAnalysis) => {
    // Reconstruct job description from snippet (or use full if available)
    const jobDescription = record.jobDescriptionSnippet || '';
    const jobTitle = record.jobTitle || '';
    
    onLoadAnalysis(record.rawResult, jobTitle, jobDescription);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getFitColor = (fitLabel: string) => {
    switch (fitLabel) {
      case 'Strong Fit': return 'text-green-700 bg-green-50';
      case 'Moderate Fit': return 'text-blue-700 bg-blue-50';
      case 'Partial Fit': return 'text-amber-700 bg-amber-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const deriveTag = (jobTitle: string | null): string => {
    if (!jobTitle) return '';
    
    const title = jobTitle.toLowerCase();
    if (title.includes('product') || title.includes('pm')) return 'Product';
    if (title.includes('engineer') || title.includes('developer')) return 'Engineering';
    if (title.includes('ops') || title.includes('operations')) return 'Operations';
    if (title.includes('strategy')) return 'Strategy';
    if (title.includes('data') || title.includes('analytics')) return 'Data';
    if (title.includes('design')) return 'Design';
    if (title.includes('marketing')) return 'Marketing';
    if (title.includes('sales')) return 'Sales';
    
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F915F] mb-4"></div>
          <p className="text-[#6F6F6F] font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Loading your history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          {error}
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#7F915F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            No analyses yet
          </h3>
          <p className="text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Once you've analyzed a few roles, Sage will show patterns in where you're strongest and where the gaps are.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recent Roles Table */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-semibold text-[#232323] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          Recent roles you've explored
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Fit
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Tags
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => {
                const tag = deriveTag(record.jobTitle);
                return (
                  <tr
                    key={record.id}
                    onClick={() => handleRowClick(record)}
                    className="border-b border-[#E5E5E5] hover:bg-[#FAFAF6] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {record.company || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {record.jobTitle || 'Untitled role'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getFitColor(record.fitLabel)}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        {record.fitLabel} ({record.fitScore})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      {tag && (
                        <span className="inline-block px-2 py-1 bg-[#F5F5F5] text-[#6F6F6F] rounded text-xs" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                          {tag}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      {history.length >= 3 && (
        <>
          {insightsLoading ? (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F915F] mb-3"></div>
                <p className="text-sm text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Analyzing your history...
                </p>
              </div>
            </div>
          ) : insights ? (
            <>
              {/* Patterns Card */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-[#232323] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Your patterns so far
                </h2>
                
                <div className="space-y-6">
                  {/* Recurring Strengths */}
                  {insights.recurringStrengths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#7F915F] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Recurring strengths
                      </h3>
                      <ul className="space-y-2">
                        {insights.recurringStrengths.map((strength, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            <span className="text-[#7F915F] mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Recurring Gaps */}
                  {insights.recurringGaps.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#E0A878] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Recurring gaps
                      </h3>
                      <ul className="space-y-2">
                        {insights.recurringGaps.map((gap, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            <span className="text-[#E0A878] mt-1">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Best Fit Patterns */}
                  {insights.bestFitPatterns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#4A4A4A] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        You tend to fit best with...
                      </h3>
                      <ul className="space-y-2">
                        {insights.bestFitPatterns.map((pattern, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            <span className="text-[#7F915F] mt-1">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Weaker Fit Patterns */}
                  {insights.weakerFitPatterns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#4A4A4A] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        You tend to fit less with...
                      </h3>
                      <ul className="space-y-2">
                        {insights.weakerFitPatterns.map((pattern, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            <span className="mt-1">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Card */}
              {insights.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    What Sage suggests next
                  </h2>
                  <p className="text-sm text-[#6F6F6F] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    Based on your patterns, here's how to focus your search and strengthen your profile.
                  </p>
                  
                  <ul className="space-y-4">
                    {insights.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7F915F] text-white flex items-center justify-center text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-base text-[#232323] leading-relaxed">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
