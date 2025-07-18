"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState as useModalState } from "react";
import ProfileModal from "../components/ProfileModal";

function SageLogo() {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Glassmorphism-style card for profile icon */}
      <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl shadow-2xl bg-white/80 backdrop-blur-sm border border-white/20 mb-4">
        {/* Inner gradient circle with enhanced styling */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#9DC183] via-[#8a9a5b] to-[#55613b] flex items-center justify-center shadow-lg">
          {/* Plus sign with improved styling */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Enhanced yellow dot */}
        <div className="absolute" style={{ top: '12%', right: '12%' }}>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FFE082] to-[#FFB74D] shadow-md" />
        </div>
      </div>
      {/* Sage name with soft gradient background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9DC183]/10 to-[#8a9a5b]/10 rounded-lg blur-sm"></div>
        <h1 className="relative text-2xl font-semibold text-[#2d3748] tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Sage
        </h1>
      </div>
    </div>
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
      if (resumeData) {
        setResumeUploaded(true);
        if (resumeData === 'true') setSelected('resume');
      }

      // Check if questions were completed
      const questionsDone = localStorage.getItem('onboarding_questions_completed');
      if (questionsDone === 'true') setQuestionsCompleted(true);
    }
  }, []);
  const router = useRouter();

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Store upload state
      localStorage.setItem('onboarding_resume_uploaded', 'true');
      localStorage.setItem('onboarding_resume_data', JSON.stringify({
        fileId: result.fileId,
        fileName: result.fileName,
        uploadedAt: new Date().toISOString()
      }));
      
      setResumeUploaded(true);
      setSelected('resume');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  }

  function handleOptionClick(key: string) {
    if (key === "resume") {
      fileInputRef.current?.click();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] via-[#F9FAFB] to-[#F3F4F6] flex flex-col items-center py-8 px-4 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SageLogo />
      <h2 className="text-4xl font-bold text-[#1F2937] mt-2 mb-3 tracking-tight">Welcome</h2>
      <p className="text-[#374151] text-center text-lg mb-2 font-medium">Help me get to know you so I can guide you better.</p>
      <p className="text-[#6B7280] text-center text-base mb-10 max-w-lg leading-relaxed">You can paste your LinkedIn summary, upload your resume, or answer a few questions. Whatever works for you.</p>
      
      {/* Hidden file input for resume upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Enhanced Input Tiles */}
      <div className="w-full max-w-lg space-y-4 mb-8">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleOptionClick(opt.key)}
            className={`w-full p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
              selected === opt.key 
                ? 'bg-white shadow-lg border-2 border-[#9DC183]/20' 
                : 'bg-white/80 backdrop-blur-sm shadow-md border border-white/50 hover:border-[#9DC183]/30'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Enhanced icon with rounded background */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                selected === opt.key 
                  ? 'bg-gradient-to-br from-[#9DC183] to-[#8a9a5b]' 
                  : 'bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}>
                <div className={selected === opt.key ? 'text-white' : 'text-[#9DC183]'}>
                  {opt.icon}
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className={`text-lg font-semibold mb-1 ${
                  selected === opt.key ? 'text-[#1F2937]' : 'text-[#374151]'
                }`}>
                  {opt.title}
                </h3>
                <p className={`text-sm ${
                  selected === opt.key ? 'text-[#6B7280]' : 'text-[#9CA3AF]'
                }`}>
                  {opt.desc}
                </p>
                
              </div>
              
              {/* Enhanced status indicator */}
              <div className="flex items-center justify-center w-8 h-8">
                {opt.key === 'linkedin' ? (
                  linkedinProgress === 4 ? (
                    <span className="inline-block w-8 h-8 flex items-center justify-center">
                      <span className="absolute">
                        <CircularProgress percent={100} />
                      </span>
                      <span className="absolute flex items-center justify-center w-8 h-8">
                        <svg className="w-5 h-5 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  ) : linkedinProgress > 0 ? (
                    <span className="inline-block w-8 h-8 flex items-center justify-center">
                      <CircularProgress percent={linkedinProgress * 25} />
                    </span>
                  ) : (
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#E5E7EB] bg-white"></span>
                  )
                ) : opt.key === 'resume' ? (
                  resumeUploaded ? (
                    <span className="inline-block w-8 h-8 flex items-center justify-center">
                      <span className="absolute">
                        <CircularProgress percent={100} />
                      </span>
                      <span className="absolute flex items-center justify-center w-8 h-8">
                        <svg className="w-5 h-5 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  ) : isUploading ? (
                    <span className="inline-block w-8 h-8 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#9DC183] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#E5E7EB] bg-white"></span>
                  )
                ) : opt.key === 'questions' ? (
                  questionsCompleted ? (
                    <span className="inline-block w-8 h-8 flex items-center justify-center">
                      <span className="absolute">
                        <CircularProgress percent={100} />
                      </span>
                      <span className="absolute flex items-center justify-center w-8 h-8">
                        <svg className="w-5 h-5 text-[#9DC183]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  ) : (
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#E5E7EB] bg-white"></span>
                  )
                ) : (
                  selected === opt.key ? (
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#9DC183] bg-[#9DC183] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#E5E7EB] bg-white"></span>
                  )
                )}
              </div>
            </div>
          </button>
        ))}
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
      />
    </div>
  );
}

function GenerateProfileButton({ linkedinComplete, resumeComplete, questionsComplete }: { linkedinComplete: boolean; resumeComplete: boolean; questionsComplete: boolean }) {
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
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'temp-user-id' }),
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
        className={`flex-1 py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
          allComplete 
            ? 'bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] text-white hover:shadow-xl' 
            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-md'
        }`}
        disabled={!allComplete || loading}
        onClick={handleGenerateProfile}
      >
        {loading ? (isStreaming ? 'Generating...' : 'Generating Profile...') : 'See what I have learned'}
      </button>
      
      <button
        className="flex-1 py-4 px-6 rounded-2xl text-lg font-semibold bg-gradient-to-r from-[#E5E7EB] to-[#D1D5DB] text-[#374151] hover:from-[#D1D5DB] hover:to-[#9CA3AF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span>Let's chat</span>
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      
      {/* Enhanced streaming indicator */}
      {isStreaming && (
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-lg border border-white/50">
          <div className="flex items-center mb-3">
            <div className="w-4 h-4 bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] rounded-full animate-pulse mr-3"></div>
            <span className="text-sm font-medium text-[#374151]">Generating your profile...</span>
          </div>
          <div className="text-xs text-[#6B7280]">
            {streamingContent.length > 0 ? 'Profile is being created...' : 'Starting generation...'}
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      <ProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        profileJson={profile}
      />
    </div>
  );
} 