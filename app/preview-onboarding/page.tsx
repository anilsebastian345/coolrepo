"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState as useModalState } from "react";
import Link from "next/link";
import ProfileModal from '@/app/components/ProfileModal';
import ResumeModal from "../components/ResumeModal";
import LinkedInModal from "../components/LinkedInModal";

function SageLogo() {
  return (
    <Link href="/" className="flex flex-col items-center mb-6 hover:scale-105 transition-transform duration-200">
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-xl bg-white/30 border border-white/40 backdrop-blur-md animate-profile-pop">
        {/* Inner gradient circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-md">
          {/* Plus sign - sharp, no glow */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Yellow dot - smaller, between circles */}
        <div className="absolute" style={{ top: '14%', right: '14%' }}>
          <div className="w-2 h-2 rounded-full bg-[#ffd700] shadow" />
        </div>
      </div>
      <h1 className="mt-4 text-lg text-[#7a7a7a] font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </Link>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 14;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#f3f4f6"
        fill="white"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#9DC183"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

function ProgressIndicator({ percent, isComplete }: { percent: number, isComplete: boolean }) {
  if (isComplete) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#8a9112]">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (percent === 0) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#d3d7c7] bg-white">
        <span className="w-3 h-3 rounded-full bg-[#e5e7eb]"></span>
      </span>
    );
  }

  // Progress circle with percentage
  const radius = 10;
  const stroke = 2;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-7 h-7">
      <svg height={radius * 2} width={radius * 2} className="absolute">
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="white"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress arc */}
        <circle
          stroke="#8a9112"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.5s ease-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Percentage text */}
      <span className="text-[10px] font-medium text-[#8a9112] leading-none">
        {Math.round(percent)}%
      </span>
    </div>
  );
}

const options = [
  {
    key: "resume",
    icon: (
      <svg className="w-6 h-6 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <path d="M8 8h8M8 12h8M8 16h4" stroke="#9DC183" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Upload my resume",
    desc: "Let me review your professional experience",
  },
  {
    key: "questions",
    icon: (
      <svg className="w-6 h-6 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <path d="M12 8v4" stroke="#9DC183" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="#9DC183" />
      </svg>
    ),
    title: "Answer a few questions",
    desc: "We'll have a brief conversation to get started",
  },
  {
    key: "linkedin-pdf",
    icon: (
      <svg className="w-6 h-6 text-[#9DC183]" fill="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" 
              stroke="#9DC183" strokeWidth="0.5" transform="scale(0.6) translate(5,5)"/>
      </svg>
    ),
    title: "Upload LinkedIn PDF",
    desc: "Upload your LinkedIn profile as a PDF",
  },
];

export default function PreviewOnboarding() {
  const [selected, setSelected] = useState("questions");
  const [linkedinProgress, setLinkedinProgress] = useState(0);
  const [questionsProgress, setQuestionsProgress] = useState(0);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [linkedinModalOpen, setLinkedinModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [resumeInfo, setResumeInfo] = useState<{fileName: string, uploadedAt: string} | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check LinkedIn PDF upload
      const linkedinComplete = localStorage.getItem('onboarding_linkedin_complete');
      if (linkedinComplete === 'true') {
        setLinkedinProgress(1); // Mark as completed
      } else {
        setLinkedinProgress(0);
      }
      
      // Check questions progress (5 questions total)
      const questionsData = localStorage.getItem('onboarding_questions');
      if (questionsData) {
        try {
          const parsed = JSON.parse(questionsData);
          const answered = Object.values(parsed).filter(v => v !== null && v !== undefined).length;
          setQuestionsProgress(answered);
          if (answered === 5) {
            setQuestionsCompleted(true);
          }
        } catch {}
      } else {
        setQuestionsProgress(0);
      }
      
      // Check if resume was uploaded
      const resumeData = localStorage.getItem('onboarding_resume_uploaded');
      const resumeInfoData = localStorage.getItem('onboarding_resume_data');
      if (resumeData && resumeInfoData) {
        setResumeUploaded(true);
        try {
          const parsed = JSON.parse(resumeInfoData);
          setResumeInfo({ fileName: parsed.fileName, uploadedAt: parsed.uploadedAt });
        } catch {}
        if (resumeData === 'true') setSelected('resume');
      }

      // Check if questions were completed (legacy check)
      const questionsDone = localStorage.getItem('onboarding_questions_completed');
      if (questionsDone === 'true') setQuestionsCompleted(true);
    }
  }, []);

  async function handleFileUploadModal(file: File) {
    console.log('=== FRONTEND UPLOAD START ===');
    console.log('File details:', { name: file.name, type: file.type, size: file.size });
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      console.log('FormData created, sending request...');
      
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }
      const result = await response.json();
      console.log('Upload success:', result);
      
      localStorage.setItem('onboarding_resume_uploaded', 'true');
      localStorage.setItem('onboarding_resume_data', JSON.stringify({
        fileId: result.fileId,
        fileName: result.fileName,
        uploadedAt: new Date().toISOString()
      }));
      setResumeUploaded(true);
      setResumeInfo({ fileName: result.fileName, uploadedAt: new Date().toISOString() });
      setResumeModalOpen(false);
    } catch (error) {
      console.error('=== FRONTEND UPLOAD ERROR ===');
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  }
  function handleDeleteResumeModal() {
    localStorage.removeItem('onboarding_resume_uploaded');
    localStorage.removeItem('onboarding_resume_data');
    setResumeUploaded(false);
    setResumeInfo(null);
    setResumeModalOpen(false);
  }



  function handleOptionClick(key: string) {
    if (key === "resume") {
      setResumeModalOpen(true);
      return;
    }
    if (key === "questions") {
      router.push("/onboarding/questions");
      return;
    }
    if (key === "linkedin-pdf") {
      setLinkedinModalOpen(true);
      return;
    }
    setSelected(key);
  }

  // Get user name from resume, login, or guest mode
  let userName = '';
  if (typeof window !== 'undefined') {
    const resumeInfoData = localStorage.getItem('onboarding_resume_data');
    if (resumeInfoData) {
      try {
        const parsed = JSON.parse(resumeInfoData);
        if (parsed.userName && parsed.userName.length > 0) {
          userName = parsed.userName;
        }
      } catch {}
    }
    if (!userName) {
      const loginName = localStorage.getItem('onboarding_user_name');
      if (loginName) userName = loginName;
    }
    if (!userName) {
      const guestMode = localStorage.getItem('guestMode');
      const guestName = localStorage.getItem('userName');
      if (guestMode === 'true' && guestName) {
        userName = guestName;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] via-[#F9FAFB] to-[#F3F4F6] flex flex-col items-center py-8 px-4 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <SageLogo />
      <h2 className="text-[28px] font-semibold text-[#1F2937] mt-2 mb-0 tracking-tight">
        {userName ? `Welcome, ${userName}` : 'Welcome'}
      </h2>
      <br />
      <p className="text-base font-normal text-black text-center mb-1">Help me get to know you so I can guide you better.</p>
      <br />
      <p className="text-sm text-[#7a7a7a] text-center mb-8" style={{whiteSpace: 'pre-line'}}>
        You can paste your LinkedIn summary,
        <br />upload your resume, or answer a few questions.
        <br />Whatever works for you.
      </p>
      
      {/* Hidden file input for resume upload */}
      {/* (Removed old input and preview card) */}
      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        resumeInfo={resumeInfo}
        onUpload={handleFileUploadModal}
        onDelete={handleDeleteResumeModal}
        isUploading={isUploading}
      />

      <LinkedInModal
        isOpen={linkedinModalOpen}
        onClose={() => setLinkedinModalOpen(false)}
        onUploadSuccess={(data) => {
          setLinkedinProgress(1); // Mark as completed
          alert(`LinkedIn profile uploaded successfully!`);
        }}
      />
      
      {/* Enhanced Input Tiles */}
      <div className="w-full max-w-md mx-auto mb-5 p-0"> {/* container for all cards */}
        {options.map((opt) => {
          const isLinkedInPDF = opt.key === 'linkedin-pdf';
          const isResume = opt.key === 'resume';
          const isQuestions = opt.key === 'questions';
          const isLinkedInPDFComplete = isLinkedInPDF && linkedinProgress > 0;
          const isResumeComplete = isResume && resumeUploaded;
          const isQuestionsComplete = isQuestions && questionsCompleted;
          const isComplete = isLinkedInPDFComplete || isResumeComplete || isQuestionsComplete;
          
          // Calculate progress percentage
          let progressPercent = 0;
          if (isLinkedInPDF) {
            progressPercent = linkedinProgress > 0 ? 100 : 0;
          } else if (isQuestions) {
            progressPercent = (questionsProgress / 5) * 100;
          } else if (isResume) {
            progressPercent = resumeUploaded ? 100 : 0;
          }
          
          return (
            <button
              key={opt.key}
              onClick={() => handleOptionClick(opt.key)}
              className={`w-full max-w-sm mx-auto flex items-center px-6 py-5 mb-[36px] rounded-lg border-[1.5px] transition-all duration-200
                ${isComplete
                  ? 'bg-white/60 border-[#8a9112] backdrop-blur-md'
                  : 'bg-white/40 border-[#d3d7c7] backdrop-blur-md'}
                hover:border-[#8a9112] hover:shadow-lg hover:scale-[1.025] focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              style={{ minHeight: 80 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4 bg-[#f5f6f2]">
                {opt.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[16px] font-normal text-black mb-1 leading-tight">
                  {opt.title}
                </div>
                <div className="text-[13px] text-[#7a7a7a] font-normal leading-snug" style={{whiteSpace: 'pre-line'}}>
                  {opt.key === 'resume' ? (
                    <>Let me review your professional<br />experience</>
                  ) : opt.key === 'questions' ? (
                    <>We'll have a brief conversation to<br />get started</>
                  ) : (
                    opt.desc
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center justify-center">
                <ProgressIndicator percent={progressPercent} isComplete={isComplete} />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Enhanced completion message as badge */}
      {(() => {
        // Check for any progress
        const hasLinkedInProgress = typeof window !== 'undefined' ? (() => {
          const data = localStorage.getItem('onboarding_linkedin_data');
          if (data) {
            try {
              const parsed = JSON.parse(data);
              return [parsed.about, parsed.experience, parsed.education, parsed.recommendations].some(v => v && v.trim().length > 0);
            } catch {}
          }
          return false;
        })() : false;
        
        const hasQuestionsProgress = typeof window !== 'undefined' ? (() => {
          const questionsData = localStorage.getItem('onboarding_questions');
          if (questionsData) {
            try {
              const parsed = JSON.parse(questionsData);
              return Object.values(parsed).some(v => v !== null && v !== undefined && v !== '');
            } catch {}
          }
          return false;
        })() : false;
        
        const hasAnyProgress = hasLinkedInProgress || resumeUploaded || hasQuestionsProgress;
        const allComplete = (linkedinProgress === 4) && resumeUploaded && (questionsProgress === 5);
        
        if (allComplete) {
          return (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#9DC183]/10 to-[#8a9a5b]/10 border border-[#9DC183]/20 mb-6">
              <span className="text-2xl mr-2">🎉</span>
              <span className="text-[#374151] font-medium text-sm">Fantastic! You've completed everything. See what I've learned about you.</span>
            </div>
          );
        } else if (hasAnyProgress) {
          return (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#9DC183]/10 to-[#8a9a5b]/10 border border-[#9DC183]/20 mb-6">
              <span className="text-2xl mr-2">✨</span>
              <span className="text-[#374151] font-medium text-sm">Great start! I can already learn from what you've shared.</span>
            </div>
          );
        } else {
          return null;
        }
      })()}
      
      {/* Generate My Profile Button */}
      <GenerateProfileButton
        linkedinComplete={linkedinProgress === 4}
        resumeComplete={resumeUploaded}
        questionsComplete={questionsCompleted || questionsProgress === 5}
        router={router}
      />
    </div>
  );
}

function GenerateProfileButton({ linkedinComplete, resumeComplete, questionsComplete, router }: { linkedinComplete: boolean; resumeComplete: boolean; questionsComplete: boolean; router: any }) {
  const [loading, setLoading] = useModalState(false);
  const [showModal, setShowModal] = useModalState(false);
  const [profile, setProfile] = useModalState("");
  const [error, setError] = useModalState("");
  const [streamingContent, setStreamingContent] = useModalState("");
  const [isStreaming, setIsStreaming] = useModalState(false);
  
  // Check for any meaningful progress (at least 1 section with some data)
  const hasLinkedInProgress = typeof window !== 'undefined' ? (() => {
    const data = localStorage.getItem('onboarding_linkedin_data');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return [parsed.about, parsed.experience, parsed.education, parsed.recommendations].some(v => v && v.trim().length > 0);
      } catch {}
    }
    return false;
  })() : false;
  
  const hasQuestionsProgress = typeof window !== 'undefined' ? (() => {
    const questionsData = localStorage.getItem('onboarding_questions');
    if (questionsData) {
      try {
        const parsed = JSON.parse(questionsData);
        return Object.values(parsed).some(v => v !== null && v !== undefined && v !== '');
      } catch {}
    }
    return false;
  })() : false;
  
  const hasAnyProgress = hasLinkedInProgress || resumeComplete || hasQuestionsProgress;

  async function handleGenerateProfile() {
    setLoading(true);
    setError("");
    setStreamingContent("");
    setIsStreaming(false);
    
    try {
      // Get questions and LinkedIn data from localStorage
      let questionsData = {};
      let linkedinData = {};
      if (typeof window !== 'undefined') {
        const storedQuestions = localStorage.getItem('onboarding_questions');
        if (storedQuestions) {
          try {
            questionsData = JSON.parse(storedQuestions);
          } catch (e) {
            console.error('Failed to parse questions:', e);
          }
        }
        
        const storedLinkedin = localStorage.getItem('onboarding_linkedin_data');
        if (storedLinkedin) {
          try {
            linkedinData = JSON.parse(storedLinkedin);
          } catch (e) {
            console.error('Failed to parse LinkedIn data:', e);
          }
        }
      }
      
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'temp-user-id',
          questions: questionsData,
          linkedin: linkedinData
        }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Failed to generate profile');
        setLoading(false);
        return;
      }

      // Check if it's a cached response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setProfile(data.profile);
        setShowModal(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding_psych_profile', data.profile);
        }
        setLoading(false);
        return;
      }

      // Handle streaming response
      setIsStreaming(true);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullProfile = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.complete && data.profile) {
                // Final complete profile
                setProfile(data.profile);
                setShowModal(true);
                setIsStreaming(false);
                
                if (typeof window !== 'undefined') {
                  localStorage.setItem('onboarding_psych_profile', data.profile);
                }
                setLoading(false);
                return;
              } else if (data.partial && data.content) {
                // Partial content update
                fullProfile += data.content;
                setStreamingContent(fullProfile);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
    } catch (e) {
      setError('Failed to generate profile');
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-row items-center justify-center gap-4 mt-6">
      <button
        className={`flex-1 py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
          hasAnyProgress 
            ? 'bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] text-white hover:shadow-xl' 
            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-md'
        }`}
        disabled={!hasAnyProgress || loading}
        onClick={handleGenerateProfile}
      >
        {loading && (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
        <span>{loading ? 'Generating...' : 'See what I have learned'}</span>
      </button>
      
      <button
        className="flex-1 py-4 px-6 rounded-2xl text-lg font-semibold bg-gradient-to-r from-[#E5E7EB] to-[#D1D5DB] text-[#374151] hover:from-[#D1D5DB] hover:to-[#9CA3AF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        onClick={() => router.push('/chat')}
      >
        <span>Let's chat</span>
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      
      {/* Profile Modal */}
      <ProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        profileJson={profile}
      />
    </div>
  );
} 