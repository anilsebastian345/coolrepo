"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState as useModalState } from "react";
import ProfileModal from "../components/ProfileModal";

function SageLogo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-[#f3f4f6] to-[#ececec]">
        {/* Inner gradient circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
          {/* Plus sign - sharp, no glow */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Yellow dot - smaller, between circles */}
        <div className="absolute" style={{ top: '18%', right: '18%' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffe082] shadow" />
        </div>
      </div>
      <h1 className="mt-4 text-xl text-text font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </div>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 12;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="white"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#8a9a5b"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
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
      <svg className="w-7 h-7 text-highlight" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F1F0ED" stroke="#C1CFC0" />
        <rect x="7" y="10" width="2" height="6" rx="1" fill="#C1CFC0" />
        <rect x="11" y="10" width="2" height="6" rx="1" fill="#C1CFC0" />
        <circle cx="8" cy="8" r="1" fill="#C1CFC0" />
      </svg>
    ),
    title: "Paste my LinkedIn summary",
    desc: "Quick and easy way to share your background",
  },
  {
    key: "resume",
    icon: (
      <svg className="w-7 h-7 text-highlight" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F1F0ED" stroke="#C1CFC0" />
        <path d="M8 8h8M8 12h8M8 16h4" stroke="#C1CFC0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Upload my resume",
    desc: "Let me review your professional experience",
  },
  {
    key: "questions",
    icon: (
      <svg className="w-7 h-7 text-highlight" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#F1F0ED" stroke="#C1CFC0" />
        <path d="M12 8v4" stroke="#8a9a5b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="#8a9a5b" />
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
    <div className="min-h-screen bg-primary flex flex-col items-center py-8 px-2 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <SageLogo />
      <h2 className="text-3xl font-bold text-text mt-2 mb-4">Welcome</h2>
      <p className="text-text text-center text-base mb-1">Help me get to know you so I can guide you better.</p>
      <p className="text-text/70 text-center text-sm mb-8 max-w-md">You can paste your LinkedIn summary, upload your resume, or answer a few questions. Whatever works for you.</p>
      
      {/* Hidden file input for resume upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="flex flex-col gap-4 w-full max-w-md mb-8">
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => handleOptionClick(opt.key)}
            className={`flex items-center w-full rounded-xl border transition p-4 text-left shadow-sm focus:outline-none ${selected === opt.key ? 'border-[#8a9a5b] bg-[#f8faf6]' : 'border-card bg-white hover:bg-card'} group`}
            type="button"
          >
            <div className="mr-4 flex-shrink-0">{opt.icon}</div>
            <div className="flex-1">
              <div className="text-text font-medium text-base mb-1">{opt.title}</div>
              <div className="text-text/70 text-sm">{opt.desc}</div>
            </div>
            <div className="ml-4">
              {opt.key === 'linkedin' ? (
                linkedinProgress === 4 ? (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <span className="absolute">
                      <CircularProgress percent={100} />
                    </span>
                    <span className="absolute flex items-center justify-center w-7 h-7">
                      <svg className="w-4 h-4 text-[#8a9a5b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </span>
                ) : linkedinProgress > 0 ? (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <CircularProgress percent={linkedinProgress * 25} />
                  </span>
                ) : (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <CircularProgress percent={0} />
                  </span>
                )
              ) : opt.key === 'resume' ? (
                resumeUploaded ? (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <span className="absolute">
                      <CircularProgress percent={100} />
                    </span>
                    <span className="absolute flex items-center justify-center w-7 h-7">
                      <svg className="w-4 h-4 text-[#8a9a5b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </span>
                ) : isUploading ? (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#8a9a5b] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-card bg-white"></span>
                )
              ) : opt.key === 'questions' ? (
                questionsCompleted ? (
                  <span className="inline-block w-7 h-7 flex items-center justify-center">
                    <span className="absolute">
                      <CircularProgress percent={100} />
                    </span>
                    <span className="absolute flex items-center justify-center w-7 h-7">
                      <svg className="w-4 h-4 text-[#8a9a5b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </span>
                ) : (
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-card bg-white"></span>
                )
              ) : (
                selected === opt.key ? (
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-[#8a9a5b] bg-[#8a9a5b] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                ) : (
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-card bg-white"></span>
                )
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="text-center text-[15px] text-[#8a9a5b] font-medium mt-2">
        Great progress! You can add more information or see what I've learned about you.
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
    <div className="w-full max-w-md flex flex-col items-center mt-6">
      <button
        className={`w-full py-3 rounded-xl text-lg font-semibold transition mb-2 ${allComplete ? 'bg-[#55613b] text-white hover:bg-[#8a9a5b]' : 'bg-[#ececec] text-[#bdbdbd] cursor-not-allowed'}`}
        disabled={!allComplete || loading}
        onClick={handleGenerateProfile}
      >
        {loading ? (isStreaming ? 'Generating...' : 'Generating Profile...') : 'Generate My Profile'}
      </button>
      
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="w-full bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-[#8a9a5b] rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-600">Generating your profile...</span>
          </div>
          <div className="text-xs text-gray-500">
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