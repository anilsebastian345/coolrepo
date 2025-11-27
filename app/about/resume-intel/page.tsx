import Image from 'next/image';
import Link from 'next/link';

export default function ResumeIntelOverviewPage() {
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
                Resume & Profile Intelligence
              </h1>
              <p className="text-lg text-[#4A4A4A]">
                Smart, actionable insights that strengthen your resume and LinkedIn instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/resume-intel"
                  className="inline-block px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md text-center"
                >
                  Analyze my resume
                </Link>
                <Link
                  href="/job-match"
                  className="inline-block text-[#7F915F] hover:underline font-medium py-3 text-center"
                >
                  See role fit first →
                </Link>
              </div>
            </div>

            {/* Right: Screenshot */}
            <div className="relative">
              <Image
                src="/sage-resume-analysis.png"
                alt="Sage resume and profile analysis preview UI"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT LOOKS AT SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            What Sage looks at
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pill 1 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-semibold text-[#232323]">Story clarity</h3>
              <p className="text-sm text-[#4A4A4A]">
                Does your resume tell a clear narrative?
              </p>
            </div>

            {/* Pill 2 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-semibold text-[#232323]">Impact & metrics</h3>
              <p className="text-sm text-[#4A4A4A]">
                Are achievements quantified?
              </p>
            </div>

            {/* Pill 3 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-semibold text-[#232323]">Leadership & scope</h3>
              <p className="text-sm text-[#4A4A4A]">
                What level of ownership is visible?
              </p>
            </div>

            {/* Pill 4 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-semibold text-[#232323]">Role alignment</h3>
              <p className="text-sm text-[#4A4A4A]">
                Does it match the roles you're targeting?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            How the analysis works
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <p className="text-[#4A4A4A] pt-1">
                You upload a resume or paste your LinkedIn profile
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <p className="text-[#4A4A4A] pt-1">
                Sage parses and structures the content (no manual formatting needed)
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7F915F] text-white flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <p className="text-[#4A4A4A] pt-1">
                It generates an assessment plus concrete suggestions
              </p>
            </div>
          </div>

          {/* Two-column block */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#232323] mb-3">Signal summary</h3>
              <p className="text-sm text-[#4A4A4A]">
                Strong foundation, storytelling: Good
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#232323] mb-3">Improvement areas</h3>
              <div className="space-y-2 text-sm text-[#4A4A4A]">
                <p>• Clarify scope of leadership</p>
                <p>• Add metrics to key achievements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE FEEDBACK SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            Example feedback you might see
          </h2>
          <div className="bg-[#FAFAF6] rounded-2xl p-8 space-y-4">
            <p className="font-semibold text-[#232323] mb-4">For example:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Add 2–3 quantified achievements to your summary
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Clarify your scope in recent roles (team size, budget, regions)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7F915F] mt-1">•</span>
                <span className="text-[#4A4A4A]">
                  Highlight 1–2 cross-functional wins with concrete outcomes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY NOT JUST USE GENERIC AI SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            Why this is better than a generic AI prompt
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                It's grounded in your overall Sage profile and career direction
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                It reuses patterns from roles you've analyzed, not just the text on the page
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                It keeps feedback focused and prioritized, not a laundry list
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#232323]">
            Strengthen your resume in minutes
          </h2>
          <p className="text-[#4A4A4A]">
            Get concrete, actionable feedback that helps you stand out.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/resume-intel"
              className="px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md"
            >
              Run a resume analysis
            </Link>
            <Link
              href="/job-match"
              className="text-[#7F915F] hover:underline font-medium"
            >
              Learn about Job Match & Skill Gaps →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
