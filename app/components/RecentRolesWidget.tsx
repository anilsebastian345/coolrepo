"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleFitAnalysis } from '@/lib/roleFitHistory';

export default function RecentRolesWidget() {
  const router = useRouter();
  const [recentRoles, setRecentRoles] = useState<RoleFitAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRoles();
  }, []);

  const fetchRecentRoles = async () => {
    try {
      const response = await fetch('/api/role-fit-history');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setRecentRoles((data.analyses || []).slice(0, 3));
    } catch (err) {
      console.error('Error fetching recent roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFitColor = (fitLabel: string) => {
    switch (fitLabel) {
      case 'Strong Fit': return 'text-green-700';
      case 'Moderate Fit': return 'text-blue-700';
      case 'Partial Fit': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          Recent roles you explored
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F915F]"></div>
        </div>
      </div>
    );
  }

  if (recentRoles.length === 0) {
    return null; // Don't show widget if no history
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#232323] mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        Recent roles you explored
      </h3>
      
      <div className="space-y-3 mb-4">
        {recentRoles.map((role) => (
          <div
            key={role.id}
            onClick={() => router.push('/job-match?tab=history')}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FAFAF6] cursor-pointer transition-colors group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EEF2E8] flex items-center justify-center text-sm">
              {role.company?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#232323] truncate" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {role.company || 'Unknown'}
                  </p>
                  <p className="text-xs text-[#6F6F6F] truncate" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {role.jobTitle || 'Untitled role'}
                  </p>
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${getFitColor(role.fitLabel)}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {role.fitLabel.replace(' Fit', '')} ({role.fitScore})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => router.push('/job-match?tab=history')}
        className="w-full px-4 py-2 text-sm font-medium text-[#7F915F] hover:text-[#6A7F4F] hover:bg-[#FAFAF6] rounded-lg transition-colors flex items-center justify-center gap-1"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        <span>View all & patterns</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
