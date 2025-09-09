"use client";

import React, { useState, useEffect } from 'react';

interface ProfileData {
  title: string;
  archetype: string;
  core_drives_and_values: string;
  cognitive_style: string;
  leadership_style: string;
  communication_style: string;
  risk_and_ambition: string;
  growth_and_blind_spots: string;
  summary: string;
  strength_signatures?: Array<{
    trait: string;
    evidence: string;
    why_it_matters: string;
  }>;
  latent_risks_and_blind_spots?: Array<{
    pattern: string;
    risk: string;
    coaching_prompt: string;
  }>;
  personalized_coaching_focus?: Array<{
    area: string;
    goal: string;
  }>;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileJson: string;
}

export default function ProfileModal({ isOpen, onClose, profileJson }: ProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (profileJson) {
      try {
        let jsonToParse = profileJson;
        const jsonMatch = profileJson.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonToParse = jsonMatch[1];
        }
        const parsed = JSON.parse(jsonToParse);
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse profile JSON:', e);
      }
    }
  }, [profileJson]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Leadership Profile',
          text: 'Check out my executive psychographic profile!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setIsSharing(false);
  };

  const toggleCard = (cardKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  if (!isOpen || !profile) return null;

  // Core sections for overview
  const overviewSections = [
    { key: 'archetype', title: 'Your Archetype', icon: '🎯', color: 'from-blue-500/10 to-indigo-600/10', borderColor: 'border-blue-500/20', textColor: 'text-blue-700' },
    { key: 'core_drives_and_values', title: 'Core Identity', icon: '🔷', color: 'from-emerald-500/10 to-teal-600/10', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-700' },
    { key: 'summary', title: 'Executive Summary', icon: '📋', color: 'from-violet-500/10 to-purple-600/10', borderColor: 'border-violet-500/20', textColor: 'text-violet-700' },
  ];

  // Style sections for detailed view
  const styleSections = [
    { key: 'cognitive_style', title: 'How You Think', icon: '🧠', color: 'from-purple-500/10 to-violet-600/10', borderColor: 'border-purple-500/20', textColor: 'text-purple-700' },
    { key: 'leadership_style', title: 'Leadership Approach', icon: '👑', color: 'from-amber-500/10 to-orange-600/10', borderColor: 'border-amber-500/20', textColor: 'text-amber-700' },
    { key: 'communication_style', title: 'Communication Style', icon: '💬', color: 'from-cyan-500/10 to-blue-600/10', borderColor: 'border-cyan-500/20', textColor: 'text-cyan-700' },
    { key: 'risk_and_ambition', title: 'Risk & Growth', icon: '🚀', color: 'from-rose-500/10 to-pink-600/10', borderColor: 'border-rose-500/20', textColor: 'text-rose-700' },
    { key: 'growth_and_blind_spots', title: 'Development Areas', icon: '🌱', color: 'from-yellow-500/10 to-orange-600/10', borderColor: 'border-yellow-500/20', textColor: 'text-yellow-700' },
  ];

  const renderCard = (section: any, content: string, isExpanded = false) => (
    <div 
      key={section.key}
      className={`bg-gradient-to-br ${section.color} backdrop-blur-sm border ${section.borderColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
      onClick={() => toggleCard(section.key)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-white/50 to-white/20 flex items-center justify-center text-xl`}>
          {section.icon}
        </div>
        <h3 className={`font-semibold text-lg ${section.textColor}`}>{section.title}</h3>
        <div className="ml-auto">
          <svg 
            className={`w-5 h-5 ${section.textColor} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className={`text-gray-700 ${isExpanded ? '' : 'line-clamp-3'}`}>
        {content}
      </div>
      {!isExpanded && (
        <div className="mt-2 text-sm text-gray-500">
          Click to expand...
        </div>
      )}
    </div>
  );

  const renderStrengthSignatures = () => {
    if (!profile.strength_signatures?.length) return null;
    
    return (
      <div className="bg-gradient-to-br from-green-50/50 to-emerald-100/30 backdrop-blur-sm border border-green-200/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
            <span className="text-2xl">💪</span>
          </div>
          <h3 className="text-xl font-bold text-green-800">Strength Signatures</h3>
        </div>
        
        <div className="grid gap-4">
          {profile.strength_signatures.map((strength, index) => (
            <div key={index} className="bg-white/40 rounded-xl p-4 border border-green-200/20">
              <div className="font-semibold text-green-800 mb-2">{strength.trait}</div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Evidence:</span> {strength.evidence}
              </div>
              <div className="text-sm text-green-700">
                <span className="font-medium">Why it matters:</span> {strength.why_it_matters}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLatentRisks = () => {
    if (!profile.latent_risks_and_blind_spots?.length) return null;
    
    return (
      <div className="bg-gradient-to-br from-amber-50/50 to-orange-100/30 backdrop-blur-sm border border-amber-200/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-amber-800">Growth Areas & Blind Spots</h3>
        </div>
        
        <div className="grid gap-4">
          {profile.latent_risks_and_blind_spots.map((risk, index) => (
            <div key={index} className="bg-white/40 rounded-xl p-4 border border-amber-200/20">
              <div className="font-semibold text-amber-800 mb-2">{risk.pattern}</div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Risk:</span> {risk.risk}
              </div>
              <div className="text-sm text-amber-700 italic">
                <span className="font-medium">Coaching prompt:</span> "{risk.coaching_prompt}"
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCoachingFocus = () => {
    if (!profile.personalized_coaching_focus?.length) return null;
    
    return (
      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-100/30 backdrop-blur-sm border border-indigo-200/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-bold text-indigo-800">Personalized Coaching Focus</h3>
        </div>
        
        <div className="grid gap-4">
          {profile.personalized_coaching_focus.map((focus, index) => (
            <div key={index} className="bg-white/40 rounded-xl p-4 border border-indigo-200/20">
              <div className="font-semibold text-indigo-800 mb-2">{focus.area}</div>
              <div className="text-sm text-gray-700">
                {focus.goal}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold mb-2">{profile.title || 'Your Leadership Profile'}</h2>
            <p className="text-slate-300">AI-Generated Executive Psychographic Profile</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: '👁️' },
              { id: 'details', label: 'Deep Dive', icon: '🔍' },
              { id: 'insights', label: 'Insights', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 border-t border-l border-r border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {overviewSections.map(section => 
                renderCard(section, profile[section.key as keyof ProfileData] as string, expandedCards[section.key])
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {styleSections.map(section => 
                renderCard(section, profile[section.key as keyof ProfileData] as string, expandedCards[section.key])
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {renderStrengthSignatures()}
              {renderLatentRisks()}
              {renderCoachingFocus()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Generated with AI • Personalized for your growth
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              )}
              Share Profile
            </button>
            
            {shareSuccess && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
