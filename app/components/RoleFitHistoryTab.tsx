"use client";

import { useState, useEffect, useRef } from 'react';
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

// Helper component for fit pill with score bar
function FitPillWithBar({ label, score }: { label: string; score: number }) {
  const getFitColor = (fitLabel: string) => {
    switch (fitLabel) {
      case 'Strong Fit': return { text: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-500' };
      case 'Moderate Fit': return { text: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-500' };
      case 'Partial Fit': return { text: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500' };
      default: return { text: 'text-gray-700', bg: 'bg-gray-50', bar: 'bg-gray-500' };
    }
  };

  const colors = getFitColor(label);

  return (
    <div className="space-y-1.5">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {label} ({score})
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`${colors.bar} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function RoleFitHistoryTab({ userId, onLoadAnalysis }: RoleFitHistoryTabProps) {
  const [history, setHistory] = useState<RoleFitAnalysis[]>([]);
  const [insights, setInsights] = useState<RoleFitInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle states for progressive disclosure
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showFullPatterns, setShowFullPatterns] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  
  // Refs for scrolling
  const fullHistoryRef = useRef<HTMLDivElement>(null);
  const fullPatternsRef = useRef<HTMLDivElement>(null);

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

  // Calculate metrics from history
  const totalRoles = history.length;
  const averageFitScore = Math.round(
    history.reduce((sum, record) => sum + record.fitScore, 0) / totalRoles
  );
  
  // Build executive summary
  const summaryLine = `Across the ${totalRoles} role${totalRoles === 1 ? '' : 's'} you've analyzed, you show strong leadership and analytics experience, and your main growth area is deeper, hands-on domain expertise in specialized fields such as trust & safety, construction, entertainment/media, and GTM analytics.`;

  // Get top 3 gaps with mapped suggestions
  const topGaps = (insights?.recurringGaps || []).slice(0, 3);
  const gapSuggestions = insights?.recommendations || [];
  
  // Loading state for gap panel
  const isGapPanelLoading = insightsLoading || !insights || topGaps.length === 0;
  
  // Helper to truncate gap text to short label (one line)
  const truncateGapText = (text: string, maxLength = 70) => {
    if (!text) return '';
    // Take first sentence if it exists and is short enough
    const firstSentenceMatch = text.match(/^[^.!?]+[.!?]/);
    if (firstSentenceMatch && firstSentenceMatch[0].length <= maxLength) {
      return firstSentenceMatch[0];
    }
    // Otherwise truncate at word boundary
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '…';
  };
  
  // Helper to get clean action sentence from suggestion
  const getActionSentence = (text: string, maxLength = 100) => {
    if (!text) return '';
    // Get first complete sentence
    const match = text.match(/^[^.!?]+[.!?]/);
    const sentence = match ? match[0] : text;
    // Truncate if still too long
    if (sentence.length <= maxLength) return sentence;
    const truncated = sentence.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '…';
  };

  // Get recent 3 roles (sorted by date descending)
  const recentRoles = [...history].slice(0, 3);

  return (
    <div className="space-y-6">
      {/* BAND 1 - Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Overview numbers */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-4xl font-bold text-[#232323] mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Avg fit: {averageFitScore}%
              </div>
              <p className="text-sm text-[#6F6F6F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {totalRoles} role{totalRoles === 1 ? '' : 's'} analyzed
              </p>
            </div>
            
            <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {summaryLine}
            </p>
          </div>

          {/* Right: Where to focus next */}
          <div className="flex-1 space-y-3">
            <h3
              className="text-sm font-semibold text-[#232323]"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Where to focus next
            </h3>

            {isGapPanelLoading ? (
              // Skeleton while insights are loading
              <div className="mt-1 space-y-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-5/6" />
                <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-4/5 mt-4" />
                <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mt-4" />
                <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                <div className="h-2.5 bg-gray-100 rounded w-3/5" />
              </div>
            ) : (
              insights &&
              topGaps.length > 0 && (
                <div className="mt-1 space-y-4">
                  {topGaps.map((gap, idx) => {
                    const title = truncateGapText(gap, 70);
                    const rawSuggestion = gapSuggestions[idx];
                    const actionSentence = rawSuggestion ? getActionSentence(rawSuggestion, 100) : '';

                    return (
                      <div
                        key={idx}
                        className="pt-3 border-t border-gray-100 first:pt-0 first:border-t-0"
                      >
                        <p
                          className="text-sm font-semibold text-gray-900 leading-tight"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          {title}
                        </p>
                        <p
                          className="text-xs text-gray-500 mt-1 leading-relaxed"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                        >
                          This pattern appears across multiple roles you've analyzed.
                        </p>
                        {actionSentence && (
                          <p
                            className="text-xs text-gray-700 mt-1 leading-relaxed"
                            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                          >
                            <span className="font-medium">Next step:</span> {actionSentence}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* BAND 2 - Roles + Pattern Snapshot */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Recent roles (condensed) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Recent roles you've explored
          </h2>
          
          <div className="space-y-4">
            {recentRoles.map((record) => (
              <div
                key={record.id}
                onClick={() => handleRowClick(record)}
                className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-[#FAFAF6] cursor-pointer transition-colors border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#232323] truncate" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {record.jobTitle || 'Untitled role'}
                  </p>
                  <p className="text-xs text-[#6F6F6F] mt-0.5" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {record.company || 'Unknown'} · {formatDate(record.createdAt)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <FitPillWithBar label={record.fitLabel} score={record.fitScore} />
                </div>
              </div>
            ))}
          </div>
          
          {history.length > 3 && (
            <button
              onClick={() => {
                setShowFullHistory(!showFullHistory);
                if (!showFullHistory) {
                  setTimeout(() => fullHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
              }}
              className="text-sm text-[#7F915F] hover:text-[#6A7F4F] font-medium flex items-center gap-1 transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {showFullHistory ? 'Hide full history' : 'View full history'}
              <svg className={`w-4 h-4 transition-transform ${showFullHistory ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Right: Pattern snapshot */}
        {insights && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Pattern snapshot
            </h2>
            
            {/* Top 3 strengths */}
            {insights.recurringStrengths.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#7F915F] uppercase tracking-wide mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Top strengths
                </h3>
                <ul className="space-y-1.5">
                  {insights.recurringStrengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      <span className="text-[#7F915F] mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Top 3 gaps */}
            {insights.recurringGaps.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#E0A878] uppercase tracking-wide mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Top gaps
                </h3>
                <ul className="space-y-1.5">
                  {insights.recurringGaps.slice(0, 3).map((gap, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                      <span className="text-[#E0A878] mt-0.5">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowFullPatterns(!showFullPatterns);
                if (!showFullPatterns) {
                  setTimeout(() => fullPatternsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
              }}
              className="text-sm text-[#7F915F] hover:text-[#6A7F4F] font-medium flex items-center gap-1 transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {showFullPatterns ? 'Hide full pattern breakdown' : 'See full pattern breakdown'}
              <svg className={`w-4 h-4 transition-transform ${showFullPatterns ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* BAND 3 - Next Steps */}
      {insights && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-[#232323] mb-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            What Sage suggests next
          </h2>
          <p className="text-sm text-[#6F6F6F] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Based on your patterns, here's how to focus your search and strengthen your profile.
          </p>
          
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-800" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {insights.recommendations.slice(0, showAllSuggestions ? undefined : 3).map((rec, idx) => (
              <li key={idx} className="leading-relaxed">{rec}</li>
            ))}
          </ol>
          
          {insights.recommendations.length > 3 && (
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="mt-4 text-sm text-[#7F915F] hover:text-[#6A7F4F] font-medium flex items-center gap-1 transition-colors"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {showAllSuggestions ? 'Show less' : `Show all ${insights.recommendations.length} suggestions`}
              <svg className={`w-4 h-4 transition-transform ${showAllSuggestions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* EXPANDABLE SECTIONS - Full History Table */}
      {showFullHistory && (
        <div ref={fullHistoryRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-[#232323] mb-6" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Full history
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
      )}

      {/* EXPANDABLE SECTIONS - Full Pattern Breakdown */}
      {showFullPatterns && insights && (
        <div ref={fullPatternsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-[#232323]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Your patterns so far
          </h2>
          
          {/* Recurring Strengths */}
          {insights.recurringStrengths.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Recurring strengths
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {insights.recurringStrengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recurring Gaps */}
          {insights.recurringGaps.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Recurring gaps
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {insights.recurringGaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Best Fit Patterns */}
          {insights.bestFitPatterns.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                You tend to fit best with...
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {insights.bestFitPatterns.map((pattern, idx) => (
                  <li key={idx}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Weaker Fit Patterns */}
          {insights.weakerFitPatterns.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#232323] mb-3" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                You tend to fit less with...
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#4A4A4A]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {insights.weakerFitPatterns.map((pattern, idx) => (
                  <li key={idx}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
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
    </div>
  );
}
