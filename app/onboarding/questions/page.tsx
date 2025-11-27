"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

function SageLogo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#7A8E50] to-[#55613b] flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 className="mt-4 text-xl text-text font-normal font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Sage</h1>
    </div>
  );
}

type Question = {
  id: number;
  text: string;
  description: string;
  trait: "Extraversion" | "Conscientiousness" | "Emotional Stability" | "Agreeableness" | "Openness";
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "I am the life of the party.",
    description: "This measures your comfort with visibility and social energy as a leader.",
    trait: "Extraversion",
  },
  {
    id: 2,
    text: "I feel comfortable around people.",
    description: "This reflects how at ease you are in group settings and new environments.",
    trait: "Extraversion",
  },
  {
    id: 3,
    text: "I start conversations easily.",
    description: "This captures how naturally you initiate interactions and build relationships.",
    trait: "Extraversion",
  },
  {
    id: 4,
    text: "I get chores done right away.",
    description: "This reflects your tendency to act quickly and follow through on tasks.",
    trait: "Conscientiousness",
  },
  {
    id: 5,
    text: "I like order and structure in my work.",
    description: "This measures how much you value planning, organization, and structure.",
    trait: "Conscientiousness",
  },
  {
    id: 6,
    text: "I follow through on commitments.",
    description: "This reflects your reliability and dependability to others.",
    trait: "Conscientiousness",
  },
  {
    id: 7,
    text: "I remain calm under pressure.",
    description: "This measures your emotional resilience in demanding situations.",
    trait: "Emotional Stability",
  },
  {
    id: 8,
    text: "I seldom feel blue.",
    description: "This reflects how often you experience negative mood or low energy.",
    trait: "Emotional Stability",
  },
  {
    id: 9,
    text: "I handle stressful situations well.",
    description: "This captures how effectively you cope with stress and uncertainty.",
    trait: "Emotional Stability",
  },
  {
    id: 10,
    text: "I sympathize with others' feelings.",
    description: "This measures your capacity for empathy and emotional attunement.",
    trait: "Agreeableness",
  },
  {
    id: 11,
    text: "I take time for others.",
    description: "This reflects how willing you are to support and invest in people around you.",
    trait: "Agreeableness",
  },
  {
    id: 12,
    text: "I make people feel at ease.",
    description: "This captures how approachable and relationally safe you feel to others.",
    trait: "Agreeableness",
  },
  {
    id: 13,
    text: "I have a vivid imagination.",
    description: "This measures your tendency to think creatively and envision possibilities.",
    trait: "Openness",
  },
  {
    id: 14,
    text: "I am curious about many different things.",
    description: "This reflects your appetite for learning and exploring new ideas.",
    trait: "Openness",
  },
  {
    id: 15,
    text: "I enjoy reflecting on abstract ideas.",
    description: "This captures your comfort with complex, conceptual thinking.",
    trait: "Openness",
  },
];

const likertOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" }, 
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

const QUESTION_GROUPS = [
  {
    title: "Your Energy & Social Style (Extraversion)",
    questions: [1, 2, 3],
  },
  {
    title: "Your Follow-Through & Work Discipline (Conscientiousness)",
    questions: [4, 5, 6],
  },
  {
    title: "How You Handle Challenges (Emotional Stability)",
    questions: [7, 8, 9],
  },
  {
    title: "How You Relate to Others (Agreeableness)",
    questions: [10, 11, 12],
  },
  {
    title: "Your Thinking & Curiosity (Openness)",
    questions: [13, 14, 15],
  },
];

type AnswersType = { [questionId: number]: number };

export default function OnboardingQuestions() {
  const [answers, setAnswers] = useState<AnswersType>({});
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
          setAnswers(parsedData);
        } catch (e) {
          console.error('Failed to parse saved answers:', e);
          localStorage.removeItem('onboarding_questions');
        }
      }
      const savedProfile = localStorage.getItem('onboarding_psych_profile');
      if (savedProfile) setProfile(savedProfile);
    }
  }, []);

  function handleChange(questionId: number, value: number) {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_questions', JSON.stringify(updated));
    }
    // Save to backend
    fetch('/api/save-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined);
  const answeredCount = QUESTIONS.filter(q => answers[q.id] !== undefined).length;

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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F0] to-[#E8EEE0] flex flex-col items-center py-6 px-4 font-sans" style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      {/* Stepper */}
      <div className="flex items-center w-full max-w-7xl mb-4">
        <button className="mr-4 text-[#7F915F] text-2xl hover:text-[#6d7a4a] transition" onClick={() => router.back()}>&larr;</button>
        <div className="flex-1 flex flex-col items-center">
          <div className="text-xs text-[#7F915F] font-semibold mb-1 tracking-widest">STEP 2 OF 4</div>
          <div className="flex gap-1 w-32 h-2 mb-2">
            <div className="flex-1 rounded bg-[#7F915F]" />
            <div className="flex-1 rounded bg-[#7F915F]" />
            <div className="flex-1 rounded bg-white/40" />
            <div className="flex-1 rounded bg-white/40" />
          </div>
        </div>
      </div>
      
      <SageLogo />
      <h2 className="text-2xl font-bold text-text mt-2 mb-2 text-center">Help me get to know you</h2>
      <div className="text-text/70 text-center text-sm mb-1 max-w-3xl px-4">
        <p>Rate how much you agree with each statement. These 15 research-validated items (Mini-IPIP + BFI-2-S) help Sage build your personalized leadership profile.</p>
      </div>
      
      {/* Likert scale helper */}
      <div className="text-xs text-text/60 text-center mb-6 max-w-3xl">
        Scale: <span className="font-semibold">1 = Strongly Disagree</span>, <span className="font-semibold">5 = Strongly Agree</span>
      </div>
      
      {/* Question groups */}
      <div className="w-full max-w-7xl mb-24 space-y-10">
        {QUESTION_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            {/* Section header */}
            <h3 className="text-lg font-semibold text-[#7F915F] mb-4 px-2">
              {group.title}
            </h3>
            
            {/* 3-column grid for questions in this group - all 3 in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {group.questions.map((questionId) => {
                const question = QUESTIONS.find(q => q.id === questionId);
                if (!question) return null;
                
                return (
                  <div 
                    key={question.id} 
                    className="bg-white/30 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40 flex flex-col"
                  >
                    <div className="flex items-start mb-3 flex-1">
                      <span 
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold mr-2 text-xs flex-shrink-0" 
                        style={{ background: '#7F915F', color: 'white' }}
                      >
                        {question.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-text font-semibold text-sm mb-1 leading-tight">{question.text}</h4>
                        <p className="text-text/60 text-xs leading-snug">{question.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-auto">
                      {likertOptions.map((option) => (
                        <label 
                          key={option.value} 
                          className={`flex-1 cursor-pointer py-2 px-1 rounded-lg border transition-all duration-200 text-center ${
                            answers[question.id] === option.value
                              ? 'border-[#7F915F] bg-[#7F915F]/20 shadow-md'
                              : 'border-white/60 bg-white/40 hover:border-[#7F915F]/60 hover:bg-white/60'
                          }`}
                          title={option.label}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.value}
                            checked={answers[question.id] === option.value}
                            onChange={() => handleChange(question.id, option.value)}
                            className="sr-only"
                          />
                          <div className={`text-sm font-bold ${answers[question.id] === option.value ? 'text-[#7F915F]' : 'text-text/70'}`}>
                            {option.value}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom bar with progress and continue button */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-lg border-t border-white/60 shadow-lg py-4 px-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-text">
              {answeredCount} of {QUESTIONS.length}
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden w-48">
              <div 
                className="h-full bg-gradient-to-r from-[#7F915F] to-[#6d7a4a] transition-all duration-500"
                style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <button
            onClick={handleNext}
            className={`px-8 py-2.5 rounded-xl text-base font-semibold transition-all ${
              allAnswered 
                ? 'bg-[#7F915F] text-white hover:bg-[#6d7a4a] shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
            disabled={!allAnswered}
          >
            Continue
          </button>
        </div>
      </div>

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