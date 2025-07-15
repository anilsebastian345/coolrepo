"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function SageLogo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-[#f3f4f6] to-[#ececec]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '18%', right: '18%' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffe082] shadow" />
        </div>
      </div>
      <h1 className="mt-4 text-xl text-text font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </div>
  );
}

const questions = [
  {
    label: "Who is your role model, and why?",
    placeholder: "Share who inspires you and why...",
    key: "roleModel"
  },
  {
    label: "What would your friends say about you?",
    placeholder: "How do others describe you?",
    key: "friendsSay"
  },
  {
    label: "The kind of challenges that frustrate me most are…",
    placeholder: "Help me understand what tends to drain your energy...",
    key: "challenges"
  }
];

export default function OnboardingQuestions() {
  const [answers, setAnswers] = useState({ roleModel: '', friendsSay: '', challenges: '' });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_questions');
      if (saved) setAnswers(JSON.parse(saved));
    }
  }, []);

  function handleChange(key: string, value: string) {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_questions', JSON.stringify(updated));
    }
  }

  const allFilled = Object.values(answers).every(ans => ans.trim().length > 0);

  function handleNext() {
    // Mark questions as completed in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_questions_completed', 'true');
    }
    router.push('/preview-onboarding');
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center py-8 px-2 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      {/* Stepper */}
      <div className="flex items-center w-full max-w-md mb-2">
        <button className="mr-4 text-[#8a9a5b] text-2xl" onClick={() => router.back()}>&larr;</button>
        <div className="flex-1 flex flex-col items-center">
          <div className="text-xs text-[#8a9a5b] font-semibold mb-1 tracking-widest">STEP 2 OF 4</div>
          <div className="flex gap-1 w-32 h-2 mb-2">
            <div className="flex-1 rounded bg-[#8a9a5b]" />
            <div className="flex-1 rounded bg-[#8a9a5b]" />
            <div className="flex-1 rounded bg-[#e5e7eb]" />
            <div className="flex-1 rounded bg-[#e5e7eb]" />
          </div>
        </div>
      </div>
      <SageLogo />
      <h2 className="text-2xl font-bold text-text mt-2 mb-2 text-center">Help me get to know you</h2>
      <p className="text-text/80 text-center text-base mb-6 max-w-md">These questions help me understand how you work best, so I can offer more personalized guidance.</p>
      <div className="flex flex-col gap-6 w-full max-w-md mb-8">
        {questions.map((q, idx) => (
          <div key={q.key} className="bg-white border border-[#ececec] rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold mr-2" style={{ background: '#8a9a5b', color: 'white' }}>{idx+1}</span>
              <span className="text-text font-medium text-base">{q.label}</span>
            </div>
            <textarea
              className="w-full mt-2 p-3 border border-[#ececec] rounded-lg bg-[#f8faf6] text-text text-base focus:outline-none focus:ring-2 focus:ring-[#8a9a5b]/30 resize-none min-h-[64px]"
              placeholder={q.placeholder}
              value={answers[q.key as keyof typeof answers]}
              onChange={e => handleChange(q.key, e.target.value)}
              maxLength={500}
            />
          </div>
        ))}
      </div>
      <div className="text-center text-[15px] text-[#8a9a5b] font-medium mt-2 mb-4">
        Take your time — there are no right or wrong answers. I'm here to understand what makes you unique.
      </div>
      <button
        className={`w-full max-w-md py-3 rounded-xl text-lg font-semibold transition mt-2 ${allFilled ? 'bg-[#8a9a5b] text-white hover:bg-[#6d7a4a]' : 'bg-[#ececec] text-[#bdbdbd] cursor-not-allowed'}`}
        disabled={!allFilled}
        onClick={handleNext}
      >
        Next &rarr;
      </button>
      <div className="text-center text-xs text-[#bdbdbd] mt-2">
        Please answer all questions to continue
      </div>
    </div>
  );
} 