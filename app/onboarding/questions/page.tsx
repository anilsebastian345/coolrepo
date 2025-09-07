"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

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
    id: "sociability",
    text: "I enjoy meeting new people and starting conversations.",
    description: "This measures your comfort with social interactions and networking."
  },
  {
    id: "conscientiousness", 
    text: "I set personal goals and work hard to achieve them.",
    description: "This reflects your ability to set and pursue objectives effectively."
  },
  {
    id: "emotional_stability",
    text: "I remain calm and collected even under pressure.", 
    description: "This measures your emotional resilience during challenging situations."
  },
  {
    id: "empathy",
    text: "I find it easy to empathize with others.",
    description: "This gauges your ability to understand and share others' feelings."
  },
  {
    id: "leadership",
    text: "I enjoy taking the lead in group situations.",
    description: "This assesses your comfort with leadership and taking charge."
  }
];

const likertOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" }, 
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

type AnswersType = {
  sociability: number | null;
  conscientiousness: number | null;
  emotional_stability: number | null;
  empathy: number | null;
  leadership: number | null;
};

export default function OnboardingQuestions() {
  const [answers, setAnswers] = useState<AnswersType>({
    sociability: null,
    conscientiousness: null,
    emotional_stability: null,
    empathy: null,
    leadership: null
  });
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_questions');
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          // Check if this is old format data (has roleModel, friendsSay, challenges)
          if (parsedData.roleModel !== undefined || parsedData.friendsSay !== undefined || parsedData.challenges !== undefined) {
            // Clear old format data and start fresh
            localStorage.removeItem('onboarding_questions');
            console.log('Cleared old question format data');
          } else {
            // This is new format data, use it
            setAnswers(parsedData);
          }
        } catch (e) {
          console.error('Failed to parse saved answers:', e);
          localStorage.removeItem('onboarding_questions'); // Clear corrupted data
        }
      }
      const savedProfile = localStorage.getItem('onboarding_psych_profile');
      if (savedProfile) setProfile(savedProfile);
    }
  }, []);

  function handleChange(questionId: keyof AnswersType, value: number) {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_questions', JSON.stringify(updated));
    }
    // Save to onboarding_questions.json for backend
    fetch('/api/save-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  const allAnswered = Object.values(answers).every(answer => answer !== null);
  const answeredCount = questions.filter(q => answers[q.id as keyof AnswersType] !== null).length;

  function handleNext() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_questions_completed', 'true');
    }
    router.push('/preview-onboarding');
  }

  async function handleGenerateProfile() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'temp-user-id',
          questions: answers 
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Failed to generate profile');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setProfile(data.profile);
      setShowModal(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_psych_profile', data.profile);
      }
    } catch (e) {
      setError('Failed to generate profile');
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'My Sage Psychographic Profile',
        text: profile,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(profile);
      alert('Profile copied to clipboard!');
    }
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center py-8 px-2 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      {/* Stepper */}
      <div className="flex items-center w-full max-w-2xl mb-2">
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
      <p className="text-text/80 text-center text-base mb-8 max-w-2xl">Rate how much you agree with each statement. This helps me understand your work style and leadership preferences.</p>
      
      <div className="flex flex-col gap-8 w-full max-w-2xl mb-8">
        {questions.map((question, idx) => (
          <div key={question.id} className="bg-white border border-[#ececec] rounded-xl p-6 shadow-sm">
            <div className="flex items-start mb-4">
              <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm" style={{ background: '#8a9a5b', color: 'white' }}>{idx+1}</span>
              <div className="flex-1">
                <h3 className="text-text font-medium text-lg mb-2">{question.text}</h3>
                <p className="text-text/70 text-sm">{question.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4">
              {likertOptions.map((option) => (
                <label 
                  key={option.value} 
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    answers[question.id as keyof AnswersType] === option.value
                      ? 'border-[#8a9a5b] bg-[#8a9a5b]/10 text-[#8a9a5b]'
                      : 'border-[#ececec] bg-white hover:border-[#8a9a5b]/50 hover:bg-[#8a9a5b]/5'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id as keyof AnswersType] === option.value}
                    onChange={() => handleChange(question.id as keyof AnswersType, option.value)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium mb-1">{option.label}</div>
                  <div className="text-xs text-text/60">{option.value}</div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="text-center mb-6">
        <p className="text-sm text-text/70">
          {answeredCount} of {questions.length} questions answered
        </p>
      </div>

      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      
      <button
        onClick={handleNext}
        className={`w-full max-w-md py-3 rounded-xl text-lg font-semibold transition mt-2 ${
          allAnswered 
            ? 'bg-[#8a9a5b] text-white hover:bg-[#6d7a4a]' 
            : 'bg-[#ececec] text-[#bdbdbd] cursor-not-allowed'
        }`}
        disabled={!allAnswered}
      >
        Continue
      </button>
      
      {!allAnswered && (
        <div className="text-center text-xs text-[#bdbdbd] mt-2">
          Please answer all questions to continue
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold text-center mb-4 text-[#8a9a5b]">Your Psychographic Profile</h2>
            <div className="whitespace-pre-line text-text text-base mb-6" style={{ maxHeight: 320, overflowY: 'auto' }}>{profile}</div>
            <button
              className="w-full py-2 rounded-xl bg-[#8a9a5b] text-white font-semibold text-lg hover:bg-[#6d7a4a] mb-2"
              onClick={handleShare}
            >
              Share
            </button>
            <div className="text-center text-xs text-[#bdbdbd]">You can copy or share this profile on social media.</div>
          </div>
        </div>
      )}
    </div>
  );
} 