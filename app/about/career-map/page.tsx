import Image from 'next/image';
import Link from 'next/link';

export default function CareerMapOverviewPage() {
  return (
    <main className="bg-[#FAFAF6] min-h-screen">
      {/* HERO SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-widest text-[#7F915F] uppercase">
                Feature Overview
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#232323]">
                Career Fit & Direction
              </h1>
              <p className="text-lg text-[#4A4A4A]">
                See which roles you naturally align with — and how your path can evolve over time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/career-map"
                  className="inline-block px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md text-center"
                >
                  Explore my career map
                </Link>
                <Link
                  href="/job-match"
                  className="inline-block text-[#7F915F] hover:underline font-medium py-3 text-center"
                >
                  Analyze a specific role →
                </Link>
              </div>
            </div>

            {/* Right: Screenshot */}
            <div className="relative">
              <Image
                src="/sage-career-fit.png"
                alt="Sage career fit and career map preview UI"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE DETERMINE FIT SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            How Sage determines your career fit
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#232323]">
                Understand your profile
              </h3>
              <p className="text-[#4A4A4A]">
                Uses your psychographic profile, core strengths, and past experiences to build a complete picture.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#232323]">
                Match you to role families
              </h3>
              <p className="text-[#4A4A4A]">
                Clusters roles into groups like Product, Strategy, Operations, Data, and Leadership.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#232323]">
                Score alignment and trajectory
              </h3>
              <p className="text-[#4A4A4A]">
                Shows where you're strongest today and where you could grow into over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE CAREER MAP SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            The Career Map
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Explanation */}
            <div className="space-y-4">
              <p className="text-[#4A4A4A]">
                The Career Map shows your starting points, natural next roles, and longer-term destinations.
              </p>
              <p className="text-[#4A4A4A]">
                It helps answer the question: "If not this role, what else should I consider?"
              </p>
            </div>

            {/* Right: Visual Mock */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#7F915F] uppercase">Now</p>
                <div className="bg-[#FAFAF6] rounded-lg p-4">
                  <p className="font-semibold text-[#232323]">Head of Analytics</p>
                </div>
              </div>
              <div className="flex justify-center">
                <svg className="w-6 h-6 text-[#7F915F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#7F915F] uppercase">Next</p>
                <div className="bg-[#FAFAF6] rounded-lg p-4">
                  <p className="font-semibold text-[#232323]">Director, Data & AI Strategy</p>
                </div>
              </div>
              <div className="flex justify-center">
                <svg className="w-6 h-6 text-[#7F915F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#7F915F] uppercase">Later</p>
                <div className="bg-[#FAFAF6] rounded-lg p-4">
                  <p className="font-semibold text-[#232323]">VP, Data & Transformation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHEN TO USE IT SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            When to use Career Fit & Direction
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                When you're considering a pivot and want to see where you're a natural fit
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                When multiple roles look attractive and you need a tie-breaker
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                When you want a longer-term path, not just the next job
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT MAKES IT DIFFERENT SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            Why it's different from generic career quizzes
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Built on your real profile, roles, and resume inputs — not abstract personality labels
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Connects to actual roles you're exploring, not generic career categories
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Updates as you add more data through role analyses and resume changes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / FOOTER SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#232323]">
            See your own Career Map
          </h2>
          <p className="text-[#4A4A4A]">
            Explore which roles align with your strengths and where your career could go next.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/career-map"
              className="px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md"
            >
              Explore my career fit
            </Link>
            <Link
              href="/job-match"
              className="text-[#7F915F] hover:underline font-medium"
            >
              Start by analyzing a role →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
