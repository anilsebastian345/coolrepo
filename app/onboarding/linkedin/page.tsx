"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function SageLogo() {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative w-12 h-12 flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-[#f3f4f6] to-[#ececec]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '18%', right: '18%' }}>
          <div className="w-2 h-2 rounded-full bg-[#ffe082] shadow" />
        </div>
      </div>
      <h1 className="mt-2 text-lg text-text font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </div>
  );
}

const sections = [
  {
    key: "about",
    label: "About Section",
    desc: "Your professional summary or bio from LinkedIn",
    placeholder: "Paste your LinkedIn About section here...",
  },
  {
    key: "experience",
    label: "Experience Section",
    desc: "Your current and past roles, responsibilities, and achievements",
    placeholder: "Paste your work experience from LinkedIn here...",
  },
  {
    key: "education",
    label: "Education Section",
    desc: "Your degrees, certifications, and educational background",
    placeholder: "Paste your education details from LinkedIn here...",
  },
  {
    key: "recommendations",
    label: "Recommendations Section",
    desc: "Testimonials and endorsements from colleagues or clients",
    placeholder: "Paste any recommendations you've received on LinkedIn here...",
  },
];

export default function LinkedInOnboarding() {
  const [inputs, setInputs] = useState({ about: "", experience: "", education: "", recommendations: "" });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_linkedin_data');
      if (saved) {
        try {
          setInputs(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);
  const router = useRouter();

  const atLeastOneFilled = Object.values(inputs).some((v) => v.trim().length > 0);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center py-6 px-2 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      {/* Progress Bar */}
      <div className="flex items-center w-full max-w-md mb-4">
        <button onClick={() => router.back()} className="mr-3 p-1 rounded-full hover:bg-card text-[#8a9a5b] focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-[#8a9a5b] font-semibold tracking-widest mr-2">STEP 2 OF 4</span>
          <div className="flex items-center space-x-1">
            <span className="w-8 h-1 rounded bg-[#8a9a5b]"></span>
            <span className="w-8 h-1 rounded bg-[#8a9a5b]"></span>
            <span className="w-8 h-1 rounded bg-card"></span>
            <span className="w-8 h-1 rounded bg-card"></span>
          </div>
        </div>
      </div>
      <SageLogo />
      <h2 className="text-2xl font-bold text-text mt-2 mb-2">Paste your LinkedIn Info</h2>
      <p className="text-text text-center text-base mb-1">Share the sections that best represent your professional background. You can skip any that don't apply.</p>
      <div className="flex flex-col gap-4 w-full max-w-md mt-4 mb-4">
        {sections.map((section) => (
          <div key={section.key} className="bg-white border border-card rounded-xl p-4">
            <div className="text-text font-semibold text-base mb-1">{section.label}</div>
            <div className="text-text/70 text-sm mb-2">{section.desc}</div>
            <textarea
              className="w-full min-h-[70px] max-h-40 rounded-lg border border-card bg-[#fafaf7] p-3 text-sm text-text focus:outline-none focus:border-[#8a9a5b] resize-vertical transition"
              placeholder={section.placeholder}
              value={inputs[section.key as keyof typeof inputs]}
              onChange={e => {
                const newInputs = { ...inputs, [section.key]: e.target.value };
                setInputs(newInputs);
                // Save to localStorage immediately to track progress
                if (typeof window !== 'undefined') {
                  localStorage.setItem('onboarding_linkedin_data', JSON.stringify(newInputs));
                }
              }}
            />
          </div>
        ))}
      </div>
      {/* Tip Box */}
      <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-yellow-900 text-sm">
        <span className="font-semibold">Tip:</span> You can copy sections directly from your LinkedIn profile. Don’t worry about formatting — I’ll understand the content regardless of how it’s pasted.
      </div>
      {/* Privacy Note */}
      <div className="w-full max-w-md text-xs text-center text-text/50 mb-4">
        Your LinkedIn information is processed securely and used only to understand your professional background. It’s never shared or stored beyond what’s needed for your coaching experience.
      </div>
      {/* Save & Continue Button */}
      <button
        className={`w-full max-w-md py-3 rounded-lg text-white font-semibold flex items-center justify-center transition mt-2 ${atLeastOneFilled ? 'bg-[#8a9a5b] hover:bg-[#6b8f71] cursor-pointer' : 'bg-card text-text/30 cursor-not-allowed'}`}
        disabled={!atLeastOneFilled}
        onClick={() => {
          if (atLeastOneFilled) {
            localStorage.setItem('onboarding_linkedin_complete', 'true');
            localStorage.setItem('onboarding_linkedin_data', JSON.stringify(inputs));
            router.push('/preview-onboarding');
          }
        }}
      >
        Save & Continue
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {!atLeastOneFilled && (
        <div className="w-full max-w-md text-xs text-center text-text/40 mt-2">
          Add content to at least one section to continue
        </div>
      )}
    </div>
  );
} 