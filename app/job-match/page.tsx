"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JobMatchAnalysis } from "@/app/types/features";

// TopNav Component
function TopNav({ activeTab }: { activeTab: string }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'profile', label: 'Profile', href: '/preview-onboarding' },
    { id: 'career', label: 'Career Map', href: '/career-map' },
    { id: 'resume', label: 'Resume Intel', href: '/resume-intel' },
    { id: 'jobmatch', label: 'Job Match', href: '/job-match' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#55613b]">Sage</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#f8faf6] text-[#55613b]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Circular Progress Indicator
function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 75) return '#10b981'; // green
    if (score >= 50) return '#3b82f6'; // blue
    return '#f59e0b'; // orange
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width="200" height="200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="16"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth="16"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-gray-900">{percentage}%</div>
        <div className="text-sm text-gray-500 mt-1">Match</div>
      </div>
    </div>
  );
}

// Copy Button Component
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
        copied
          ? 'bg-green-100 text-green-700 border-2 border-green-200'
          : 'bg-[#f8faf6] text-[#55613b] border-2 border-[#e8f0e3] hover:bg-[#e8f0e3]'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// Mock function to analyze job match
async function analyzeJobMatch(jobDescription: string, userProfile: any): Promise<JobMatchAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    matchScore: 78,
    strengths: [
      "Strong product management experience aligns perfectly with the 'lead product strategy' requirement",
      "Demonstrated cross-functional leadership matches the need to 'collaborate with engineering, design, and marketing teams'",
      "Data-driven approach evident in your background fits their emphasis on 'metrics-driven decision making'"
    ],
    gaps: [
      "Job requires 'experience with B2B SaaS at scale (100K+ users)' - your profile shows smaller user bases",
      "They want 'proven track record of pricing and monetization strategy' - this isn't highlighted in your experience",
      "Looking for 'API product experience' - only general product work is mentioned",
      "Requires 'enterprise sales cycle knowledge' - no explicit mention of working with enterprise customers",
      "Prefers candidates with 'experience in fintech or payments' - your background is in different verticals"
    ],
    suggestedActions: [
      "Add a bullet about the largest user base you've managed, even if under 100K, to show scale experience",
      "Highlight any pricing decisions you've influenced, even indirectly (e.g., 'Provided data analysis that informed pricing tier changes')",
      "If you've worked on any integrations or platform features, reframe them as 'API product work'",
      "Mention any interaction with enterprise customers or participation in sales calls",
      "Research fintech/payments terminology and weave relevant concepts into your cover letter",
      "Emphasize transferable skills: complexity management, compliance considerations, trust & security focus",
      "Reach out to someone at the company to learn more about their specific challenges and tailor your narrative"
    ],
    tailoredBullets: [
      "Led product strategy for [your product] serving 45K active users, driving 30% growth in engagement through data-informed feature prioritization and cross-functional collaboration with Engineering, Design, and Marketing teams",
      "Partnered with Sales and Finance leadership to optimize pricing model, resulting in 22% increase in conversion rate and $1.2M incremental ARR through strategic tier restructuring",
      "Shipped platform integration capabilities enabling 15+ third-party apps to connect via RESTful APIs, expanding ecosystem reach and driving 18% increase in enterprise adoption",
      "Collaborated with enterprise sales team on 10+ strategic deals (avg. ACV $150K+), translating complex customer requirements into product roadmap items and contributing to 85% win rate",
      "Drove security and compliance initiatives including SOC 2 Type II certification and GDPR readiness, establishing trust framework critical for enterprise fintech partnerships"
    ]
  };
}

// Main Page Component
export default function JobMatchPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<JobMatchAnalysis | null>(null);

  useEffect(() => {
    // Load user profile from localStorage
    const profileData = localStorage.getItem('onboarding_psych_profile');
    const resumeData = localStorage.getItem('onboarding_resume_text');
    
    if (profileData || resumeData) {
      try {
        const parsed = profileData ? JSON.parse(profileData) : {};
        setUserProfile(parsed);
      } catch (err) {
        console.error('Failed to parse profile:', err);
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description first");
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeJobMatch(jobDescription, userProfile);
      setResult(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert("Failed to analyze job match. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf6] via-white to-[#e8f0e3]">
      <TopNav activeTab="jobmatch" />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Job Match & Skill Gaps
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paste a job description to see how well you match, where you're strong, and what to improve.
          </p>
        </div>

        {/* No Profile State */}
        {!userProfile && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200 max-w-2xl mx-auto mb-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Profile First</h3>
            <p className="text-gray-600 mb-6">
              We need your profile and resume to analyze job matches.
            </p>
            <button
              onClick={() => router.push('/preview-onboarding')}
              className="px-8 py-3 bg-[#8a9a5b] text-white rounded-xl font-medium hover:bg-[#55613b] transition-colors"
            >
              Start Onboarding
            </button>
          </div>
        )}

        {/* Job Description Input */}
        {userProfile && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-4">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here, including responsibilities, requirements, and preferred qualifications..."
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-[#8a9a5b] focus:outline-none resize-none text-gray-700 leading-relaxed"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {jobDescription.length} characters • The more detail, the better the analysis
              </p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !jobDescription.trim()}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  analyzing || !jobDescription.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#8a9a5b] text-white hover:bg-[#55613b] shadow-md hover:shadow-lg'
                }`}
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Analyze Job</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Match Score */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 shadow-md text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Match Score</h2>
              <CircularProgress percentage={result.matchScore} />
              <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                {result.matchScore >= 75
                  ? "Excellent match! You meet most of the key requirements. Focus on highlighting your strengths and addressing the gaps below."
                  : result.matchScore >= 50
                  ? "Good match with room for improvement. You have relevant experience but some gaps to address in your application."
                  : "This role is a stretch. Consider whether it's worth applying or if you should focus on roles that better match your background."}
              </p>
            </div>

            {/* Three Column Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Strengths */}
              <div className="bg-white rounded-2xl border-2 border-green-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">💪</div>
                  <h3 className="text-lg font-bold text-gray-900">Top Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1 text-lg font-bold">✓</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Gaps */}
              <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">⚠️</div>
                  <h3 className="text-lg font-bold text-gray-900">Critical Gaps</h3>
                </div>
                <ul className="space-y-3">
                  {result.gaps.slice(0, 5).map((gap, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1 text-lg font-bold">!</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Actions */}
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🚀</div>
                  <h3 className="text-lg font-bold text-gray-900">Suggested Actions</h3>
                </div>
                <ul className="space-y-3">
                  {result.suggestedActions.slice(0, 5).map((action, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1 font-bold text-sm">{idx + 1}.</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tailored Resume Bullets */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">✍️</div>
                <h2 className="text-2xl font-bold text-gray-900">Suggested Resume Tweaks for This Job</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Here are resume bullets tailored specifically to this job description. Use these to customize your application:
              </p>
              <div className="space-y-4">
                {result.tailoredBullets.map((bullet, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-[#f8faf6] to-white border-2 border-[#e8f0e3] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#8a9a5b] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#55613b] uppercase tracking-wide">
                            Tailored Bullet
                          </span>
                        </div>
                        <p className="text-gray-900 leading-relaxed">{bullet}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <CopyButton text={bullet} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Actions */}
            {result.suggestedActions.length > 5 && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  More Ways to Strengthen Your Application
                </h3>
                <ul className="space-y-3">
                  {result.suggestedActions.slice(5).map((action, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-3 font-bold">{idx + 6}.</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reset Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  setJobDescription("");
                }}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
