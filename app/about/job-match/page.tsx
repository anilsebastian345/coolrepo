import Image from 'next/image';
import Link from 'next/link';

export default function JobMatchOverviewPage() {
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
                Job Match & Skill Gaps
              </h1>
              <p className="text-lg text-[#4A4A4A]">
                Understand how you match to any job and what skills to build to stand out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/job-match"
                  className="inline-block px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md text-center"
                >
                  Analyze a role
                </Link>
                <Link
                  href="/job-match?tab=history"
                  className="inline-block text-[#7F915F] hover:underline font-medium py-3 text-center"
                >
                  View my role history →
                </Link>
              </div>
            </div>

            {/* Right: Screenshot */}
            <div className="relative">
              <Image
                src="/sage-role-fit.png"
                alt="Sage job match and skill gaps preview UI"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW MATCH SCORING WORKS SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            How Sage calculates match
          </h2>
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-[#4A4A4A] mb-6">
              Sage compares your profile, resume, and prior roles to the job description to generate a comprehensive match score.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Looks at leadership scope, domain experience, tools, and responsibilities
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Generates a single match score plus a breakdown of strengths vs gaps
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Updates as you refine your profile and add more role analyses
                </span>
              </div>
            </div>
          </div>

          {/* Mock Score Card */}
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[#7F915F] mb-2">76%</div>
              <p className="text-sm text-[#6F6F6F]">Match Score</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#232323] font-medium">Strengths</span>
                  <span className="text-[#7F915F]">85%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7F915F]" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#232323] font-medium">Skill gaps</span>
                  <span className="text-[#4A4A4A]">15%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4A4A4A]" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL GAP INSIGHTS SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            See exactly where the gaps are
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: Text */}
            <div className="space-y-4">
              <p className="text-[#4A4A4A]">
                Sage surfaces repeated gaps across the roles you've analyzed — not just for one posting.
              </p>
              <p className="text-[#4A4A4A]">
                This helps you identify patterns in domain knowledge, tools, and leadership expectations.
              </p>
            </div>

            {/* Right: Example Gaps Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#232323] mb-4">Example skill gaps</h3>
              <div className="space-y-3 text-sm text-[#4A4A4A]">
                <div className="flex items-start gap-2">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span>Limited experience with ad-tech or marketing analytics platforms</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span>No recent examples of end-to-end product ownership</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span>Missing hands-on experience with BI tools or SQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE IT SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            How to use Job Match & Skill Gaps
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <p className="text-[#4A4A4A] pt-1">
                Paste a job description or link
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <p className="text-[#4A4A4A] pt-1">
                See your match score and breakdown
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <p className="text-[#4A4A4A] pt-1">
                Decide: apply, refine your resume, or skip
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                4
              </div>
              <p className="text-[#4A4A4A] pt-1">
                Track patterns over time to see what skills you should invest in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENT FROM GENERIC AI SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            Why this beats a one-off AI comparison
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Uses a consistent scoring model across all roles you analyze
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Builds patterns over time to reveal recurring gaps and strengths
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Connects directly to your resume and profile improvements
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#232323]">
            Test your next role
          </h2>
          <p className="text-[#4A4A4A]">
            See how you match and what skills matter most for the roles you want.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/job-match"
              className="px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md"
            >
              Run a job match analysis
            </Link>
            <Link
              href="/job-match?tab=history"
              className="text-[#7F915F] hover:underline font-medium"
            >
              Review your patterns so far →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
