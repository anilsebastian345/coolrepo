"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState as useModalState } from "react";
import Link from "next/link";
import ProfileModal from "../components/ProfileModal";
import ResumeModal from "../components/ResumeModal";

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
        {/* Green dot - smaller, between circles */}
        <div className="absolute" style={{ top: '14%', right: '14%' }}>
          <div className="w-2 h-2 rounded-full bg-[#8bc34a] shadow" />
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

const options = [
  {
    key: "linkedin",
    icon: (
      <svg className="w-6 h-6 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="7" y="10" width="2" height="6" rx="1" fill="#9DC183" />
        <rect x="11" y="10" width="2" height="6" rx="1" fill="#9DC183" />
        <circle cx="8" cy="8" r="1" fill="#9DC183" />
      </svg>
    ),
    title: "Paste my LinkedIn summary",
    desc: "Quick and easy way to share your background",
  },
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
];

export default function PreviewOnboarding() {
  const [selected, setSelected] = useState("questions");
  const [linkedinProgress, setLinkedinProgress] = useState(0);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [resumeInfo, setResumeInfo] = useState<{fileName: string, uploadedAt: string} | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check LinkedIn progress
      const data = localStorage.getItem('onboarding_linkedin_data');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const filled = [parsed.about, parsed.experience, parsed.education, parsed.recommendations].filter(v => v && v.trim().length > 0).length;
          setLinkedinProgress(filled);
          if (filled > 0) setSelected('linkedin');
        } catch {}
      } else {
        setLinkedinProgress(0);
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

      // Check if questions were completed
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
    setSelected(key);
    if (key === "linkedin") {
      router.push("/onboarding/linkedin");
    }
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
      
      {/* Enhanced Input Tiles */}
      <div className="w-full max-w-md mx-auto mb-5 p-0"> {/* container for all cards */}
        {options.map((opt) => {
          const isLinkedIn = opt.key === 'linkedin';
          const isResume = opt.key === 'resume';
          const isQuestions = opt.key === 'questions';
          const isLinkedInComplete = isLinkedIn && linkedinProgress === 4;
          const isResumeComplete = isResume && resumeUploaded;
          const isQuestionsComplete = isQuestions && questionsCompleted;
          const isComplete = isLinkedInComplete || isResumeComplete || isQuestionsComplete;
          return (
            <button
              key={opt.key}
              onClick={() => handleOptionClick(opt.key)}
              className={`w-full max-w-sm mx-auto flex items-center px-6 py-5 mb-[36px] rounded-lg border-[1.5px] transition-all duration-200
                ${isComplete
                  ? 'bg-white/60 border-[#8a9112] backdrop-blur-md'
                  : 'bg-white/40 border-[#d3d7c7] backdrop-blur-md'}
                hover:border-[#8a9112] hover:shadow-lg hover:scale-[1.025] focus:outline-none`}
              style={{ minHeight: 80 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4 bg-[#f5f6f2]">
                {opt.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[16px] font-normal text-black mb-1 leading-tight">{opt.title}</div>
                <div className="text-[13px] text-[#7a7a7a] font-normal leading-snug" style={{whiteSpace: 'pre-line'}}>
                  {opt.key === 'linkedin' ? (
                    <>Quick and easy way to share your<br />background</>
                  ) : opt.key === 'resume' ? (
                    <>Let me review your professional<br />experience</>
                  ) : (
                    <>We'll have a brief conversation to<br />get started</>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center justify-center">
                {isComplete ? (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#8a9112]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#d3d7c7] bg-white">
                    <span className="w-3 h-3 rounded-full bg-[#e5e7eb]"></span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Enhanced completion message as badge */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#9DC183]/10 to-[#8a9a5b]/10 border border-[#9DC183]/20 mb-6">
        <span className="text-2xl mr-2">🎉</span>
        <span className="text-[#374151] font-medium text-sm">Great progress! You can add more information or see what I've learned about you.</span>
      </div>
      
      {/* Generate My Profile Button */}
      <GenerateProfileButton
        linkedinComplete={linkedinProgress === 4}
        resumeComplete={resumeUploaded}
        questionsComplete={questionsCompleted}
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
  const allComplete = linkedinComplete && resumeComplete && questionsComplete;

  async function handleGenerateProfile() {
    setLoading(true);
    setError("");
    setStreamingContent("");
    setIsStreaming(false);
    
    try {
      // Get questions data from localStorage
      let questionsData = {};
      if (typeof window !== 'undefined') {
        const storedQuestions = localStorage.getItem('onboarding_questions');
        if (storedQuestions) {
          try {
            questionsData = JSON.parse(storedQuestions);
          } catch (e) {
            console.error('Failed to parse questions:', e);
          }
        }
      }
      
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'temp-user-id',
          questions: questionsData 
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
          allComplete 
            ? 'bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] text-white hover:shadow-xl' 
            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-md'
        }`}
        disabled={!allComplete || loading}
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